import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { useUndoRemove } from '../hooks/useUndoRemove';
import { useToast } from '../components/Toast';
import { Card, EmptyState, Meter, PageHeader } from '../components/PagePrimitives';
import { lastDays } from '../lib/wellbeing';
import type { Habit } from '../lib/types';

const times = ['Morning', 'Afternoon', 'Evening', 'Anytime'];

export default function RoutinesPage() {
  const today = useToday();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [habits, setHabits] = useStore('habits');
  const [completions, setCompletions] = useStore('completions');
  const remove = useUndoRemove(habits, setHabits);
  const [filter, setFilter] = useState<'all' | 'remaining'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [time, setTime] = useState('Anytime');

  // Whether a routine is done is derived from the day's completions. There is no
  // separate "done" flag to reset at midnight.
  const doneIds = new Set(completions.filter(item => item.date === today).map(item => item.routineId));
  const doneCount = habits.filter(habit => doneIds.has(habit.id)).length;
  const visible = habits.filter(habit => filter === 'all' || !doneIds.has(habit.id));
  const days = lastDays(7);
  const doneOn = (id: number, key: string) => completions.some(item => item.routineId === id && item.date === key);

  function resetForm() { setEditingId(null); setTitle(''); setDetail(''); setTime('Anytime'); setShowForm(false); }
  function startEdit(habit: Habit) {
    setEditingId(habit.id); setTitle(habit.title); setDetail(habit.detail); setTime(habit.time); setShowForm(true);
    window.setTimeout(() => formRef.current?.scrollIntoView({ block: 'start' }), 0);
  }
  function toggle(id: number, name: string) {
    if (doneIds.has(id)) setCompletions(current => current.filter(item => !(item.routineId === id && item.date === today)));
    else setCompletions(current => [...current, { id: Date.now(), date: today, routineId: id, title: name }]);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    if (editingId) { setHabits(current => current.map(habit => habit.id === editingId ? { ...habit, title: title.trim(), detail: detail.trim(), time } : habit)); toast.show('Routine updated'); }
    else setHabits(current => [...current, { id: Date.now(), title: title.trim(), detail: detail.trim(), time }]);
    resetForm();
  }

  return <div className="stack">
    <PageHeader title="Routines" desc="Small things you want to do regularly. Ticks reset each day and your history is kept." action={<button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => showForm ? resetForm() : setShowForm(true)}><Plus size={18} aria-hidden="true"/>Add a routine</button>}/>

    {showForm && <form ref={formRef} className="card form-card" onSubmit={save}>
      <div className="card-head"><h2>{editingId ? 'Edit routine' : 'Add a routine'}</h2></div>
      <div className="form-grid">
        <label className="field">Routine<input value={title} onChange={event => setTitle(event.target.value)} placeholder="Read for 15 minutes" required autoComplete="off"/></label>
        <label className="field">Time of day<select value={time} onChange={event => setTime(event.target.value)}>{times.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field">Detail (optional)<input value={detail} onChange={event => setDetail(event.target.value)} placeholder="Before bed, phone away" autoComplete="off"/></label>
      </div>
      <div className="btn-row"><button type="submit" className="btn btn-primary">{editingId ? 'Save changes' : 'Save routine'}</button><button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button></div>
    </form>}

    <Card>
      <p className="big-number">{doneCount}<small> of {habits.length} done today</small></p>
      <Meter value={doneCount} max={habits.length} label="Routines done today"/>
    </Card>

    <Card title="Today's list" action={<div className="segmented" role="group" aria-label="Filter routines">
      <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All</button>
      <button type="button" aria-pressed={filter === 'remaining'} onClick={() => setFilter('remaining')}>Remaining</button>
    </div>}>
      {habits.length === 0 ? <EmptyState title="No routines yet" body="Add one above, for example a short walk or reading before bed."/> :
        visible.length === 0 ? <p className="muted">Everything on the list is done for today.</p> :
        <ul className="rows">
          {visible.map(habit => <li className="row" key={habit.id}>
            <label className="check-row">
              <input type="checkbox" checked={doneIds.has(habit.id)} onChange={() => toggle(habit.id, habit.title)}/>
              <span className="check-box" aria-hidden="true"/>
              <span className="check-text"><b>{habit.title}</b><small>{[habit.time, habit.detail].filter(Boolean).join(', ')}</small></span>
            </label>
            <button type="button" className="icon-btn" aria-label={'Edit ' + habit.title} onClick={() => startEdit(habit)}><Pencil size={18}/></button>
            <button type="button" className="icon-btn" aria-label={'Remove ' + habit.title} onClick={() => remove(habit.id, habit.title)}><Trash2 size={18}/></button>
          </li>)}
        </ul>}
    </Card>

    {habits.length > 0 && <Card title="Last 7 days">
      <div className="table-scroll">
        <table className="grid-table">
          <caption className="sr-only">Which routines were done on each of the last 7 days</caption>
          <thead><tr><th scope="col">Routine</th>{days.map(({ key, date }) => <th scope="col" key={key}>{date.toLocaleDateString(undefined, { weekday: 'narrow' })}<span className="sr-only">{date.toLocaleDateString(undefined, { weekday: 'long' })}</span></th>)}<th scope="col">Done</th></tr></thead>
          <tbody>{habits.map(habit => {
            const count = days.filter(({ key }) => doneOn(habit.id, key)).length;
            return <tr key={habit.id}><th scope="row">{habit.title}</th>{days.map(({ key }) => <td key={key}>{doneOn(habit.id, key) ? <span className="cell-done"><span aria-hidden="true">&#10003;</span><span className="sr-only">Done</span></span> : <span className="cell-empty"><span aria-hidden="true">&middot;</span><span className="sr-only">Not done</span></span>}</td>)}<td>{count} of 7</td></tr>;
          })}</tbody>
        </table>
      </div>
      <p className="muted small-print">This is a record, not a streak. Missing a day changes nothing.</p>
    </Card>}
  </div>;
}
