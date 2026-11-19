import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Flag, Plus, Target, Trash2 } from 'lucide-react';
import { Header, PanelTitle } from '../components/PagePrimitives';
import { usePersistentState } from '../hooks/usePersistentState';
import { getGoalValue, type GoalCategory, type GoalPeriod, type JournalEntry, type RoutineCompletion, type WaterEntry, type WellbeingGoal } from '../lib/wellbeing';
import type { ActivityRecord } from '../data/seed';

const labels: Record<GoalCategory, string> = { steps: 'Steps', activity_minutes: 'Active minutes', water_ml: 'Water (ml)', routine_completions: 'Routine check-ins', journal_entries: 'Journal reflections' };
const units: Record<GoalCategory, string> = { steps: 'steps', activity_minutes: 'minutes', water_ml: 'ml', routine_completions: 'check-ins', journal_entries: 'entries' };

export default function GoalsPage() {
  const [goals, setGoals] = usePersistentState<WellbeingGoal[]>('ovara.goals', []);
  const [activities] = usePersistentState<ActivityRecord[]>('ovara.activities', []);
  const [water] = usePersistentState<WaterEntry[]>('ovara.waterLog', []);
  const [journals] = usePersistentState<JournalEntry[]>('ovara.journalEntries', []);
  const [completions] = usePersistentState<RoutineCompletion[]>('ovara.routineCompletions', []);
  const [preferences] = usePersistentState('ovara.preferences', { distanceUnit:'km', energyUnit:'kcal', waterUnit:'ml', dailyWaterTargetMl:2000, dailyStepTarget:7000, weekStartsOn:1 as 0|1 });
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('activity_minutes');
  const [target, setTarget] = useState('150');
  const [period, setPeriod] = useState<GoalPeriod>('weekly');
  const data = useMemo(() => ({ activities, water, journals, completions }), [activities, water, journals, completions]);
  function addGoal(event: FormEvent) {
    event.preventDefault();
    const amount = Math.max(1, Number(target) || 1);
    setGoals(current => [{ id: Date.now(), title: title.trim() || labels[category], category, target: amount, period, createdAt: new Date().toISOString() }, ...current]);
    setTitle(''); setShowForm(false);
  }
  return <div className="stack">
    <Header tag="PERSONAL TARGETS" title="Goals that fit your life." desc="Choose a few things you want to work towards. Your progress updates as you log them." action={<button className="btn dark" onClick={() => setShowForm(value => !value)}><Plus size={16}/> Add a goal</button>}/>
    {showForm && <form className="panel activity-form" onSubmit={addGoal}><div className="panel-title"><div><label>NEW GOAL</label><h3>What would you like to work towards?</h3></div><button type="button" className="btn outline small" onClick={() => setShowForm(false)}>Cancel</button></div><div className="form-grid"><label>Goal name<input value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Move more consistently"/></label><label>Measure<select value={category} onChange={event => setCategory(event.target.value as GoalCategory)}>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Target<input type="number" min="1" max="1000000" value={target} onChange={event => setTarget(event.target.value)} required/></label><label>Timeframe<select value={period} onChange={event => setPeriod(event.target.value as GoalPeriod)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label></div><button className="btn dark" type="submit">Save goal</button></form>}
    <article className="panel"><PanelTitle tag="YOUR GOALS" title="Progress so far"/>{goals.length ? <div className="goal-list">{goals.map(goal => { const current = getGoalValue(goal, data, new Date(), preferences.weekStartsOn); const percent = Math.min(100, Math.round(current / goal.target * 100)); return <div className="goal-item" key={goal.id}><div className="goal-top"><span className="metric-icon mint"><Target size={17}/></span><div><b>{goal.title}</b><small>{labels[goal.category]} · {goal.period}</small></div><button className="icon-button" aria-label={'Delete ' + goal.title} onClick={() => setGoals(items => items.filter(item => item.id !== goal.id))}><Trash2 size={15}/></button></div><div className="goal-progress-track"><i style={{ width: percent + '%' }}/></div><div className="goal-foot"><span>{current.toLocaleString()} / {goal.target.toLocaleString()} {units[goal.category]}</span><b>{percent}%</b></div></div> })}</div> : <div className="empty-state"><span className="metric-icon peach"><Flag size={18}/></span><b>Start with one meaningful goal.</b><p>Choose a daily, weekly or monthly target. Progress is calculated from your Ovara entries.</p><button className="btn outline small" onClick={() => setShowForm(true)}>Create a goal <Plus size={14}/></button></div>}</article>
    <p className="insight-footnote">Progress is based on records saved in Ovara for the selected timeframe. Goals are personal targets, not health recommendations.</p>
  </div>;
}
