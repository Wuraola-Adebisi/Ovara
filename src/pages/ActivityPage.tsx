import { useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { useUndoRemove } from '../hooks/useUndoRemove';
import { useToast } from '../components/Toast';
import { Card, EmptyState, PageHeader } from '../components/PagePrimitives';
import BarChart from '../components/BarChart';
import { displayToKm, formatDay, kmToDisplay, lastDays, minutesByKind, sumFor } from '../lib/wellbeing';
import type { ActivityRecord } from '../lib/types';

const kinds = ['Walking', 'Running', 'Cycling', 'Strength', 'Swimming', 'Yoga', 'Stretching', 'Other'];

export default function ActivityPage() {
  const location = useLocation();
  const today = useToday();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [entries, setEntries] = useStore('activities');
  const [preferences] = useStore('preferences');
  const remove = useUndoRemove(entries, setEntries);
  const [showForm, setShowForm] = useState(Boolean((location.state as { add?: boolean } | null)?.add));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState('All');
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
  const weekMinutes = weekEntries.reduce((sum, entry) => sum + entry.minutes, 0);
  const byKind = minutesByKind(weekEntries);
  const maxKind = Math.max(1, ...byKind.map(item => item[1]));
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).filter(entry => filter === 'All' || entry.kind === filter);
  const visible = showAll ? sorted : sorted.slice(0, 10);
  const usedKinds = ['All', ...kinds.filter(item => entries.some(entry => entry.kind === item))];

  function resetForm() {
    setEditingId(null); setName(''); setKind('Walking'); setMinutes('30'); setSteps(''); setDistance(''); setDate(today); setShowForm(false);
  }
  function startEdit(entry: ActivityRecord) {
    setEditingId(entry.id); setName(entry.name); setKind(entry.kind); setMinutes(String(entry.minutes));
    setSteps(entry.steps ? String(entry.steps) : '');
    setDistance(entry.distanceKm ? String(Math.round(kmToDisplay(entry.distanceKm, preferences.distanceUnit) * 10) / 10) : '');
    setDate(entry.date); setShowForm(true);
    window.setTimeout(() => formRef.current?.scrollIntoView({ block: 'start' }), 0);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const record: ActivityRecord = {
      id: editingId ?? Date.now(), name: name.trim() || kind, kind, date,
      minutes: Math.max(1, Math.round(Number(minutes) || 1)),
      steps: Math.max(0, Math.round(Number(steps) || 0)),
      ...(distance.trim() ? { distanceKm: Math.max(0, displayToKm(Number(distance) || 0, preferences.distanceUnit)) } : {}),
    };
    setEntries(current => editingId ? current.map(item => item.id === editingId ? record : item) : [record, ...current]);
    toast.show(editingId ? 'Activity updated' : 'Activity saved');
    resetForm();
  }

  return <div className="stack">
    <PageHeader title="Activity" desc="Log walks, workouts and stretches. Short sessions count." action={<button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => showForm ? resetForm() : setShowForm(true)}><Plus size={18} aria-hidden="true"/>Log activity</button>}/>

    {showForm && <form ref={formRef} className="card form-card" onSubmit={save}>
      <div className="card-head"><h2>{editingId ? 'Edit activity' : 'Log an activity'}</h2></div>
      <div className="form-grid">
        <label className="field">Name<input value={name} onChange={event => setName(event.target.value)} placeholder="Morning walk" autoComplete="off"/></label>
        <label className="field">Type<select value={kind} onChange={event => setKind(event.target.value)}>{kinds.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field">Duration in minutes<input type="number" inputMode="numeric" min="1" max="1440" value={minutes} onChange={event => setMinutes(event.target.value)} required/></label>
        <label className="field">Steps (optional)<input type="number" inputMode="numeric" min="0" value={steps} onChange={event => setSteps(event.target.value)} placeholder="Leave blank if you do not track steps"/></label>
        <label className="field">Distance in {preferences.distanceUnit} (optional)<input type="number" inputMode="decimal" min="0" step="0.1" value={distance} onChange={event => setDistance(event.target.value)}/></label>
        <label className="field">Date<input type="date" value={date} max={today} onChange={event => setDate(event.target.value)} required/></label>
      </div>
      <div className="btn-row"><button type="submit" className="btn btn-primary">{editingId ? 'Save changes' : 'Save activity'}</button><button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button></div>
    </form>}

    <Card>
      <dl className="stat-strip four">
        <div><dt>Steps today</dt><dd>{sumFor(entries, today, item => item.steps).toLocaleString()}</dd></div>
        <div><dt>Active minutes today</dt><dd>{sumFor(entries, today, item => item.minutes)}</dd></div>
        <div><dt>Minutes, last 7 days</dt><dd>{weekMinutes}</dd></div>
        <div><dt>Sessions, last 7 days</dt><dd>{weekEntries.length}</dd></div>
      </dl>
    </Card>

    <div className="grid-2">
      <Card title="Steps, last 7 days"><BarChart bars={week} unit="steps" target={preferences.dailyStepTarget}/></Card>
      <Card title="Minutes by type, last 7 days">
        {byKind.length === 0 ? <p className="muted">Nothing logged in the last 7 days.</p> : <ul className="hbars">
          {byKind.map(([type, total]) => <li key={type}><span>{type}</span><div className="meter" role="img" aria-label={type + ': ' + total + ' minutes'}><i style={{ width: (total / maxKind * 100) + '%' }}/></div><b>{total} min</b></li>)}
        </ul>}
      </Card>
    </div>

    <Card title="History" action={usedKinds.length > 2 ? <label className="inline-select">Show<select value={filter} onChange={event => { setFilter(event.target.value); setShowAll(false); }}>{usedKinds.map(item => <option key={item}>{item}</option>)}</select></label> : undefined}>
      {sorted.length === 0 ? <EmptyState title={entries.length ? 'No sessions of this type' : 'Nothing logged yet'} body={entries.length ? 'Pick another type to see more.' : 'Your sessions will appear here once you log one.'} action={entries.length ? undefined : <button type="button" className="btn btn-secondary" onClick={() => setShowForm(true)}>Log your first activity</button>}/> : <>
        <ul className="rows">
          {visible.map(entry => <li className="row" key={entry.id}>
            <div className="row-main"><b>{entry.name}</b><small>{entry.kind}, {formatDay(entry.date, { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>
            <div className="row-side"><b>{entry.minutes} min</b><small>{[entry.steps ? entry.steps.toLocaleString() + ' steps' : '', entry.distanceKm ? kmToDisplay(entry.distanceKm, preferences.distanceUnit).toFixed(1) + ' ' + preferences.distanceUnit : ''].filter(Boolean).join(', ')}</small></div>
            <button type="button" className="icon-btn" aria-label={'Edit ' + entry.name} onClick={() => startEdit(entry)}><Pencil size={18}/></button>
            <button type="button" className="icon-btn" aria-label={'Remove ' + entry.name} onClick={() => remove(entry.id, entry.name)}><Trash2 size={18}/></button>
          </li>)}
        </ul>
        {sorted.length > 10 && <button type="button" className="btn btn-secondary" onClick={() => setShowAll(value => !value)}>{showAll ? 'Show fewer' : 'Show all ' + sorted.length}</button>}
      </>}
    </Card>
  </div>;
}
