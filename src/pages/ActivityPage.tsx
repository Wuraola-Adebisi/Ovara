import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { useUndoRemove } from '../hooks/useUndoRemove';
import { useToast } from '../components/Toast';
import { Card, EmptyState, PageFeature, PageHeader } from '../components/PagePrimitives';
import BarChart from '../components/BarChart';
import { displayToKm, formatDay, kmToDisplay, lastDays, sumFor } from '../lib/wellbeing';
import type { ActivityRecord } from '../lib/types';

const kinds = ['Walking', 'Running', 'Cycling', 'Strength', 'Swimming', 'Yoga', 'Stretching', 'Other'];

export default function ActivityPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const today = useToday();
  const toast = useToast();
  const [entries, setEntries] = useStore('activities');
  const [preferences] = useStore('preferences');
  const remove = useUndoRemove(entries, setEntries);
  const [showForm, setShowForm] = useState(Boolean((location.state as { add?: boolean } | null)?.add));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState('Walking');
  const [minutes, setMinutes] = useState('30');
  const [steps, setSteps] = useState('');
  const [distance, setDistance] = useState('');
  const [date, setDate] = useState(today);

  const week = useMemo(() => lastDays(7).map(({ key, date: day }) => ({
    key, label: day.toLocaleDateString(undefined, { weekday: 'short' }), fullLabel: day.toLocaleDateString(undefined, { weekday: 'long' }),
    value: sumFor(entries, key, item => item.steps), highlight: key === today,
  })), [entries, today]);
  const weekKeys = new Set(week.map(day => day.key));
  const weekEntries = entries.filter(entry => weekKeys.has(entry.date));
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const visible = showAll ? sorted : sorted.slice(0, 10);
  const kindCounts = kinds.map(activityKind => ({
    kind: activityKind,
    count: weekEntries.filter(entry => entry.kind === activityKind).length,
    minutes: weekEntries.filter(entry => entry.kind === activityKind).reduce((sum, entry) => sum + entry.minutes, 0),
  })).filter(item => item.count > 0).sort((a, b) => b.minutes - a.minutes);

  function resetForm() {
    setName(''); setKind('Walking'); setMinutes('30'); setSteps(''); setDistance('');
    setDate(today); setEditingId(null); setShowForm(false);
  }

  function startEdit(entry: ActivityRecord) {
    setEditingId(entry.id);
    setName(entry.name);
    setKind(entry.kind);
    setMinutes(String(entry.minutes));
    setSteps(entry.steps ? String(entry.steps) : '');
    setDistance(entry.distanceKm !== undefined ? String(Number(kmToDisplay(entry.distanceKm, preferences.distanceUnit).toFixed(2))) : '');
    setDate(entry.date);
    setShowForm(true);
  }

  useEffect(() => {
    const eventId = (location.state as { calendarEventId?: string } | null)?.calendarEventId;
    if (!eventId?.startsWith('activity-')) return;
    const entryId = Number(eventId.slice('activity-'.length));
    const entry = entries.find(item => item.id === entryId);
    if (entry) startEdit(entry);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, entries]);

  function saveEntry(event: FormEvent) {
    event.preventDefault();
    const record: ActivityRecord = {
      id: editingId ?? Date.now(),
      name: name.trim() || kind,
      kind,
      date,
      minutes: Math.max(1, Math.min(1440, Math.round(Number(minutes) || 1))),
      steps: Math.max(0, Math.round(Number(steps) || 0)),
      ...(distance.trim() ? { distanceKm: Math.max(0, displayToKm(Number(distance) || 0, preferences.distanceUnit)) } : {}),
    };
    setEntries(current => editingId === null
      ? [record, ...current]
      : current.map(entry => entry.id === editingId ? record : entry));
    toast.show(editingId === null ? 'Activity saved' : 'Activity updated');
    resetForm();
  }

  return <div className="stack">
    <PageHeader title="Activity" desc="Log walks, workouts and stretches. Short sessions count." action={<button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}><Plus size={18} aria-hidden="true"/>Log activity</button>}/>
    <PageFeature eyebrow="Find your kind of movement" text="A walk, a stretch between tasks or a longer session all count. Keep a record of the movement that feels good and fits into your day." image="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=85" imageAlt="Runner moving along a green outdoor trail" />

    {showForm && <form className="card form-card" onSubmit={saveEntry}>
      <div className="card-head"><h2>{editingId === null ? 'Log an activity' : 'Edit activity'}</h2><button type="button" className="icon-btn" aria-label="Close form" onClick={resetForm}><X size={18}/></button></div>
      <div className="form-grid">
        <label className="field">Name<input value={name} onChange={event => setName(event.target.value)} placeholder="Morning walk" autoComplete="off"/></label>
        <label className="field">Type<select value={kind} onChange={event => setKind(event.target.value)}>{kinds.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field">Duration in minutes<input type="number" inputMode="numeric" min="1" max="1440" value={minutes} onChange={event => setMinutes(event.target.value)} required/></label>
        <label className="field">Steps (optional)<input type="number" inputMode="numeric" min="0" value={steps} onChange={event => setSteps(event.target.value)} placeholder="Leave blank if you do not track steps"/></label>
        <label className="field">Distance in {preferences.distanceUnit} (optional)<input type="number" inputMode="decimal" min="0" step="0.1" value={distance} onChange={event => setDistance(event.target.value)}/></label>
        <label className="field">Date<input type="date" value={date} max={today} onChange={event => setDate(event.target.value)} required/></label>
      </div>
      <div className="btn-row"><button type="submit" className="btn btn-primary">{editingId === null ? 'Save activity' : 'Save changes'}</button><button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button></div>
    </form>}

    <Card>
      <dl className="stat-strip">
        <div><dt>Steps today</dt><dd>{sumFor(entries, today, item => item.steps).toLocaleString()}</dd></div>
        <div><dt>Active minutes today</dt><dd>{sumFor(entries, today, item => item.minutes)}</dd></div>
        <div><dt>Sessions in 7 days</dt><dd>{weekEntries.length}</dd></div>
        <div><dt>Active days in 7 days</dt><dd>{new Set(weekEntries.map(entry => entry.date)).size}</dd></div>
      </dl>
    </Card>

    <div className="grid-2">
      <Card title="Steps, last 7 days"><BarChart bars={week} unit="steps" target={preferences.dailyStepTarget}/></Card>
      <Card title="Movement mix" >
        {kindCounts.length === 0 ? <EmptyState title="No movement logged this week" body="Your activity types and time will be summarised here."/> :
          <ul className="rows">{kindCounts.map(item => <li className="row" key={item.kind}><div className="row-main"><b>{item.kind}</b><small>{item.count} {item.count === 1 ? 'session' : 'sessions'}</small></div><div className="row-side"><b>{item.minutes} min</b><small>total</small></div></li>)}</ul>}
      </Card>
    </div>

    <Card title="Recent activity">
      {sorted.length === 0 ? <EmptyState title="Nothing logged yet" body="Your sessions will appear here once you log one." action={<button type="button" className="btn btn-secondary" onClick={() => setShowForm(true)}>Log your first activity</button>}/> : <>
        <ul className="rows">
          {visible.map(entry => <li className="row row-top" key={entry.id}>
            <div className="row-main"><b>{entry.name}</b><small>{entry.kind}, {formatDay(entry.date, { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>
            <div className="row-side"><b>{entry.minutes} min</b><small>{[entry.steps ? entry.steps.toLocaleString() + ' steps' : '', entry.distanceKm ? kmToDisplay(entry.distanceKm, preferences.distanceUnit).toFixed(1) + ' ' + preferences.distanceUnit : ''].filter(Boolean).join(', ') || 'Duration recorded'}</small></div>
            <button type="button" className="icon-btn" aria-label={'Edit ' + entry.name} onClick={() => startEdit(entry)}><Pencil size={17}/></button>
            <button type="button" className="icon-btn" aria-label={'Remove ' + entry.name} onClick={() => remove(entry.id, entry.name)}><Trash2 size={18}/></button>
          </li>)}
        </ul>
        {sorted.length > 10 && <button type="button" className="btn btn-secondary" onClick={() => setShowAll(value => !value)}>{showAll ? 'Show fewer' : 'Show all ' + sorted.length}</button>}
      </>}
    </Card>
  </div>;
}
