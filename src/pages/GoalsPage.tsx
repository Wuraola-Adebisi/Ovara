import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { useUndoRemove } from '../hooks/useUndoRemove';
import { Card, EmptyState, Meter, PageFeature, PageHeader } from '../components/PagePrimitives';
import { formatWater, getGoalValue, waterToMl } from '../lib/wellbeing';
import type { GoalCategory, GoalPeriod } from '../lib/types';

const labels: Record<GoalCategory, string> = { steps: 'Steps', activity_minutes: 'Active minutes', water_ml: 'Water', routine_completions: 'Routine check-ins', journal_entries: 'Journal entries' };
const units: Record<GoalCategory, string> = { steps: 'steps', activity_minutes: 'min', water_ml: '', routine_completions: 'check-ins', journal_entries: 'entries' };
const periodLabels: Record<GoalPeriod, string> = { daily: 'per day', weekly: 'per week', monthly: 'per month' };

export default function GoalsPage() {
  const today = useToday();
  const [goals, setGoals] = useStore('goals');
  const [activities] = useStore('activities');
  const [water] = useStore('water');
  const [journals] = useStore('journals');
  const [completions] = useStore('completions');
  const [preferences] = useStore('preferences');
  const remove = useUndoRemove(goals, setGoals);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('activity_minutes');
  const [target, setTarget] = useState('150');
  const [period, setPeriod] = useState<GoalPeriod>('weekly');
  const data = useMemo(() => ({ activities, water, journals, completions }), [activities, water, journals, completions]);
  const now = useMemo(() => new Date(today + 'T12:00:00'), [today]);

  const amountText = (category: GoalCategory, value: number) => {
    if (category !== 'water_ml') return value.toLocaleString() + ' ' + units[category];
    const formatted = formatWater(value, preferences.waterUnit);
    return formatted.value + ' ' + formatted.unit;
  };

  function addGoal(event: FormEvent) {
    event.preventDefault();
    const typed = Math.max(1, Number(target) || 1);
    // Water goals are typed in the unit shown in Preferences and stored in ml.
    const amount = category === 'water_ml' ? Math.max(1, waterToMl(typed, preferences.waterUnit)) : Math.round(typed);
    setGoals(current => [{ id: Date.now(), title: title.trim() || labels[category], category, target: amount, period, createdAt: new Date().toISOString() }, ...current]);
    setTitle(''); setShowForm(false);
  }

  return <div className="stack">
    <PageHeader title="Goals" desc="Targets you set for yourself. Progress comes from what you log." action={<button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => setShowForm(value => !value)}><Plus size={18} aria-hidden="true"/>Add a goal</button>}/>

    <PageFeature eyebrow="Choose a direction that feels right" text="Goals give your intentions a little structure. Set a target that reflects your priorities, check in as you go and change course when you need to." image="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=85" imageAlt="A notebook and planner laid out for thoughtful goal setting" />

    {showForm && <form className="card form-card" onSubmit={addGoal}>
      <div className="card-head"><h2>Add a goal</h2></div>
      <div className="form-grid">
        <label className="field">Name (optional)<input value={title} onChange={event => setTitle(event.target.value)} placeholder="Move more most days" autoComplete="off"/></label>
        <label className="field">Measure<select value={category} onChange={event => setCategory(event.target.value as GoalCategory)}>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label className="field">Target{category === 'water_ml' ? ' in ' + (preferences.waterUnit === 'oz' ? 'fl oz' : 'ml') : ''}<input type="number" inputMode="numeric" min="1" max="1000000" value={target} onChange={event => setTarget(event.target.value)} required/></label>
        <label className="field">Time frame<select value={period} onChange={event => setPeriod(event.target.value as GoalPeriod)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
      </div>
      <div className="btn-row"><button type="submit" className="btn btn-primary">Save goal</button><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
    </form>}

    <Card title="Progress">
      {goals.length === 0 ? <EmptyState title="No goals yet" body="Pick one measure and a time frame. Progress fills in as you log." action={<button type="button" className="btn btn-secondary" onClick={() => setShowForm(true)}>Add a goal</button>}/> :
        <ul className="goal-list">
          {goals.map(goal => {
            const value = getGoalValue(goal, data, now, preferences.weekStartsOn);
            const percent = Math.min(100, Math.round(value / goal.target * 100));
            return <li className="goal" key={goal.id}>
              <div className="goal-top">
                <div><b>{goal.title}</b><small>{labels[goal.category]} {periodLabels[goal.period]}</small></div>
                <button type="button" className="icon-btn" aria-label={'Remove ' + goal.title} onClick={() => remove(goal.id, goal.title)}><Trash2 size={18}/></button>
              </div>
              <Meter value={value} max={goal.target} label={goal.title + ' progress'}/>
              <div className="goal-foot"><span>{amountText(goal.category, value)} of {amountText(goal.category, goal.target)}</span><b>{percent >= 100 ? 'Reached' : percent + '%'}</b></div>
            </li>;
          })}
        </ul>}
    </Card>
    <p className="muted small-print">Goals are personal targets, not health recommendations.</p>
  </div>;
}
