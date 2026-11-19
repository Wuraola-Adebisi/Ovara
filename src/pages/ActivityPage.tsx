import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Activity, Clock3, Footprints, Plus, Trash2 } from 'lucide-react';
import { Header, PanelTitle, Metric } from '../components/PagePrimitives';
import type { ActivityRecord } from '../data/seed';
import { usePersistentState } from '../hooks/usePersistentState';
import { defaultPreferences, type Preferences } from '../lib/wellbeing';

function localDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export default function ActivityPage() {
  const [entries, setEntries] = usePersistentState<ActivityRecord[]>('ovara.activities',[]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState('Walking');
  const [minutes, setMinutes] = useState('30');
  const [steps, setSteps] = useState('3000');
  const [distance, setDistance] = useState('');
  const [preferences] = usePersistentState<Preferences>('ovara.preferences', defaultPreferences);
  const [date, setDate] = useState(localDate(new Date()));
  const today = localDate(new Date());
  const todayEntries = entries.filter(entry => entry.date === today);
  const todaySteps = todayEntries.reduce((sum, entry) => sum + entry.steps, 0);
  const todayMinutes = todayEntries.reduce((sum, entry) => sum + entry.minutes, 0);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weekEntries = entries.filter(entry => new Date(entry.date + 'T00:00:00') >= weekStart);
  const chartDays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const key = localDate(day);
    return { key, label: day.toLocaleDateString(undefined, { weekday: 'short' }), steps: entries.filter(entry => entry.date === key).reduce((sum, entry) => sum + entry.steps, 0) };
  }), [entries]);
  const maxSteps = Math.max(1000, ...chartDays.map(day => day.steps));

  function addEntry(event: FormEvent) {
    event.preventDefault();
    const record: ActivityRecord = { id: Date.now(), name: name.trim() || kind, kind, minutes: Math.max(1, Number(minutes) || 1), steps: Math.max(0, Number(steps) || 0), date, ...(distance.trim() ? { distanceKm: Math.max(0, Number(distance) || 0) * (preferences.distanceUnit === 'mi' ? 1.60934 : 1) } : {}) };
    setEntries(current => [record, ...current]);
    setName('');
    setDistance('');
    setShowForm(false);
  }

  return <div className="stack">
    <Header tag="MOVEMENT & EXERCISE" title="Keep moving in your own way." desc="Every walk, stretch and workout is worth counting." action={<button className="btn dark" onClick={() => setShowForm(value => !value)}><Plus size={16}/> Log activity</button>}/>
    {showForm && <form className="panel activity-form" onSubmit={addEntry}><div className="panel-title"><div><label>NEW RECORD</label><h3>Log an activity</h3></div><button type="button" className="btn outline small" onClick={() => setShowForm(false)}>Cancel</button></div><div className="form-grid"><label>Activity name<input value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Morning walk"/></label><label>Activity type<select value={kind} onChange={event => setKind(event.target.value)}><option>Walking</option><option>Running</option><option>Cycling</option><option>Strength</option><option>Swimming</option><option>Yoga</option><option>Stretching</option><option>Other</option></select></label><label>Duration (minutes)<input type="number" min="1" max="1440" value={minutes} onChange={event => setMinutes(event.target.value)} required/></label><label>Steps<input type="number" min="0" value={steps} onChange={event => setSteps(event.target.value)}/></label><label>Distance (${preferences.distanceUnit})<input type="number" min="0" step="0.1" value={distance} onChange={event => setDistance(event.target.value)} placeholder="Optional"/></label><label>Date<input type="date" value={date} max={today} onChange={event => setDate(event.target.value)} required/></label></div><button className="btn dark" type="submit">Save activity</button></form>}
    <section className="metrics three"><Metric label="Steps today" value={todaySteps.toLocaleString()} note="Across your logged activities" icon={Footprints} tone="mint"/><Metric label="Active minutes" value={String(todayMinutes)} unit="min" note="Movement logged today" icon={Clock3} tone="lilac"/><Metric label="Activities" value={String(weekEntries.length)} note="Records in the last 7 days" icon={Activity} tone="peach"/></section>
    <article className="panel"><PanelTitle tag="YOUR LAST 7 DAYS" title="Daily steps"/><div className="activity-bars">{chartDays.map(day=><div key={day.key}><b>{day.steps.toLocaleString()}</b><span><i style={{height: (day.steps / maxSteps * 100) + '%'}} className={day.key === today ? 'current' : ''}/></span><small>{day.label}</small></div>)}</div></article>
    <article className="panel"><PanelTitle tag="YOUR RECORDS" title="Recent activity"/><div className="activity-records">{entries.slice(0, 12).map(entry=><div className="activity-record" key={entry.id}><span className="metric-icon mint"><Activity size={17}/></span><div><b>{entry.name}</b><small>{entry.kind} · {new Date(entry.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</small></div><strong>{entry.minutes} min<small>{entry.steps.toLocaleString()} steps{entry.distanceKm ? ' · '+(entry.distanceKm/(preferences.distanceUnit==='mi'?1.60934:1)).toFixed(1)+' '+preferences.distanceUnit : ''}</small></strong><button aria-label={'Delete ' + entry.name} className="icon-button" onClick={() => setEntries(current => current.filter(item => item.id !== entry.id))}><Trash2 size={15}/></button></div>)}{entries.length === 0 && <p className="muted-copy">Your activity records will appear here when you log them.</p>}</div></article>
    
  </div>;
}
