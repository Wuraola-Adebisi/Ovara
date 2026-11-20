import { useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { useUndoRemove } from '../hooks/useUndoRemove';
import { useToast } from '../components/Toast';
import { Card, EmptyState, Meter, PageHeader } from '../components/PagePrimitives';
import { formatWater, getGoalValue, waterToMl } from '../lib/wellbeing';
import type { GoalCategory, GoalPeriod, WellbeingGoal } from '../lib/types';

const labels: Record<GoalCategory, string> = { steps: 'Steps', activity_minutes: 'Active minutes', water_ml: 'Water', routine_completions: 'Routine check-ins', journal_entries: 'Journal entries' };
const units: Record<GoalCategory, string> = { steps: 'steps', activity_minutes: 'min', water_ml: '', routine_completions: 'check-ins', journal_entries: 'entries' };
const periodLabels: Record<GoalPeriod, string> = { daily: 'per day', weekly: 'per week', monthly: 'per month' };

const presets: { title: string; category: GoalCategory; target: number; period: GoalPeriod }[] = [
  { title: '150 active minutes a week', category: 'activity_minutes', target: 150, period: 'weekly' },
  { title: '7,000 steps a day', category: 'steps', target: 7000, period: 'daily' },
  { title: 'Drink 2 litres a day', category: 'water_ml', target: 2000, period: 'daily' },
  { title: 'Tick off 20 routines a week', category: 'routine_completions', target: 20, period: 'weekly' },
  { title: 'Write 4 journal entries a week', category: 'journal_entries', target: 4, period: 'weekly' },
];

export default function GoalsPage() {
  const today = useToday();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [goals, setGoals] = useStore('goals');
  const [activities] = useStore('activities');
  const [water] = useStore('water');
  const [journals] = useStore('journals');
  const [completions] = useStore('completions');
  const [preferences] = useStore('preferences');
  const remove = useUndoRemove(goals, setGoals);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('activity_minutes');
  const [target, setTarget] = useState('150');
  const [period, setPeriod] = useState<GoalPeriod>('weekly');
  const data = useMemo(() => ({ activities, water, journals, completions }), [activities, water, journals, completions]);
  const now = useMemo(() => new Date(today + 'T12:00:00'), [today]);

  const amountText = (cat: GoalCategory, value: number) => {
    if (cat !== 'water_ml') return value.toLocaleString() + ' ' + units[cat];
    const formatted = formatWater(value, preferences.waterUnit);
    return formatted.value + ' ' + formatted.unit;
  };
  const targetForForm = (goal: WellbeingGoal) => goal.category === 'water_ml' ? formatWater(goal.target, preferences.waterUnit).value.replace(/,/g, '') : String(goal.target);

  function resetForm() { setEditingId(null); setTitle(''); setCategory('activity_minutes'); setTarget('150'); setPeriod('weekly'); setShowForm(false); }
  function startEdit(goal: WellbeingGoal) {
    setEditingId(goal.id); setTitle(goal.title); setCategory(goal.category); setTarget(targetForForm(goal)); setPeriod(goal.period); setShowForm(true);
    window.setTimeout(() => formRef.current?.scrollIntoView({ block: 'start' }), 0);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const typed = Math.max(1, Number(target) || 1);
    // Water goals are typed in the unit shown in Preferences and stored in ml.
    const amount = category === 'water_ml' ? Math.max(1, waterToMl(typed, preferences.waterUnit)) : Math.round(typed);
    const next = { title: title.trim() || labels[category], category, target: amount, period };
    if (editingId) { setGoals(current => current.map(goal => goal.id === editingId ? { ...goal, ...next } : goal)); toast.show('Goal updated'); }
    else setGoals(current => [{ id: Date.now(), createdAt: new Date().toISOString(), ...next }, ...current]);
    resetForm();
  }
  const addPreset = (preset: (typeof presets)[number]) => { setGoals(current => [{ id: Date.now(), createdAt: new Date().toISOString(), ...preset }, ...current]); toast.show('Goal added'); };

  return <div className="stack">
    <PageHeader title="Goals" desc="Targets you set for yourself. Progress comes from what you log." action={<button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => showForm ? resetForm() : setShowForm(true)}><Plus size={18} aria-hidden="true"/>Add a goal</button>}/>

    {showForm && <form ref={formRef} className="card form-card" onSubmit={save}>
      <div className="card-head"><h2>{editingId ? 'Edit goal' : 'Add a goal'}</h2></div>
      <div className="form-grid">
        <label className="field">Name (optional)<input value={title} onChange={event => setTitle(event.target.value)} placeholder="Move most days" autoComplete="off"/></label>
        <label className="field">Measure<select value={category} onChange={event => setCategory(event.target.value as GoalCategory)}>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label className="field">Target{category === 'water_ml' ? ' in ' + (preferences.waterUnit === 'oz' ? 'fl oz' : 'ml') : ''}<input type="number" inputMode="numeric" min="1" max="1000000" value={target} onChange={event => setTarget(event.target.value)} required/></label>
        <label className="field">Time frame<select value={period} onChange={event => setPeriod(event.target.value as GoalPeriod)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
      </div>
      <div className="btn-row"><button type="submit" className="btn btn-primary">{editingId ? 'Save changes' : 'Save goal'}</button><button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button></div>
    </form>}

    <Card title="Progress">
      {goals.length === 0 ? <EmptyState title="No goals yet" body="Pick one measure and a time frame, or start from a suggestion below. Progress fills in as you log." action={<button type="button" className="btn btn-secondary" onClick={() => setShowForm(true)}>Add a goal</button>}/> :
        <ul className="goal-list">
          {goals.map(goal => {
            const value = getGoalValue(goal, data, now, preferences.weekStartsOn);
            const percent = Math.min(100, Math.round(value / goal.target * 100));
            return <li className="goal" key={goal.id}>
              <div className="goal-top">
                <div><b>{goal.title}</b><small>{labels[goal.category]} {periodLabels[goal.period]}</small></div>
                <div className="btn-row">
                  <button type="button" className="icon-btn" aria-label={'Edit ' + goal.title} onClick={() => startEdit(goal)}><Pencil size={18}/></button>
                  <button type="button" className="icon-btn" aria-label={'Remove ' + goal.title} onClick={() => remove(goal.id, goal.title)}><Trash2 size={18}/></button>
                </div>
              </div>
              <Meter value={value} max={goal.target} label={goal.title + ' progress'}/>
              <div className="goal-foot"><span>{amountText(goal.category, value)} of {amountText(goal.category, goal.target)}</span><b>{percent >= 100 ? 'Reached' : percent + '%'}</b></div>
            </li>;
          })}
        </ul>}
    </Card>

    <Card title="Suggestions">
      <p className="muted">Common starting points. Add one as it is and edit it afterwards.</p>
      <ul className="rows">{presets.map(preset => <li className="row" key={preset.title}>
        <div className="row-main"><b>{preset.title}</b><small>{labels[preset.category]} {periodLabels[preset.period]}</small></div>
        <button type="button" className="btn btn-secondary" onClick={() => addPreset(preset)} disabled={goals.some(goal => goal.category === preset.category && goal.period === preset.period && goal.target === preset.target)}>Add</button>
      </li>)}</ul>
    </Card>
    <p className="muted small-print">Goals are personal targets, not health recommendations.</p>
  </div>;
}
