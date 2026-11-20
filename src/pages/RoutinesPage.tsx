import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { FormEvent } from 'react';
import { Edit3, Plus, Trash2, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { useToast } from '../components/Toast';
import { Card, EmptyState, Meter, PageFeature, PageHeader } from '../components/PagePrimitives';
import { formatDay, lastDays } from '../lib/wellbeing';
import type { Habit } from '../lib/types';

const times = ['Morning', 'Afternoon', 'Evening', 'Anytime'];

export default function RoutinesPage() {
  const location = useLocation();
  const today = useToday();
  const [habits, setHabits] = useStore('habits');
  const [completions, setCompletions] = useStore('completions');
  const [selectedDate, setSelectedDate] = useState(() => (location.state as { calendarDate?: string } | null)?.calendarDate ?? today);
  const toast = useToast();
  const [filter, setFilter] = useState<'all' | 'remaining'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [time, setTime] = useState('Anytime');

  const days = useMemo(() => lastDays(7), []);
  const doneIds = new Set(completions.filter(item => item.date === selectedDate).map(item => item.routineId));
  const doneCount = habits.filter(habit => doneIds.has(habit.id)).length;
  const visible = habits.filter(habit => filter === 'all' || !doneIds.has(habit.id));
  const weeklyDone = completions.filter(item => days.some(day => day.key === item.date));
  const activeDays = new Set(weeklyDone.map(item => item.date)).size;
  const weeklyTotal = weeklyDone.length;

  function resetForm() {
    setTitle('');
    setDetail('');
    setTime('Anytime');
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(habit: Habit) {
    setEditingId(habit.id);
    setTitle(habit.title);
    setDetail(habit.detail || '');
    setTime(habit.time || 'Anytime');
    setShowForm(true);
  }

  function saveRoutine(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    if (editingId !== null) {
      setHabits(current => current.map(habit => habit.id === editingId ? { ...habit, title: title.trim(), detail: detail.trim(), time } : habit));
      toast.show('Routine updated');
    } else {
      setHabits(current => [...current, { id: Date.now(), title: title.trim(), detail: detail.trim(), time }]);
      toast.show('Routine added');
    }
    resetForm();
  }

  function toggle(id: number, name: string) {
    if (doneIds.has(id)) setCompletions(current => current.filter(item => !(item.routineId === id && item.date === selectedDate)));
    else setCompletions(current => [...current, { id: Date.now(), date: selectedDate, routineId: id, title: name }]);
  }

  function deleteRoutine(habit: Habit) {
    const index = habits.findIndex(item => item.id === habit.id);
    if (index < 0) return;
    setHabits(current => current.filter(item => item.id !== habit.id));
    if (editingId === habit.id) resetForm();
    toast.show('Removed ' + habit.title, {
      label: 'Undo',
      run: () => setHabits(current => current.some(item => item.id === habit.id) ? current : [...current.slice(0, index), habit, ...current.slice(index)]),
    });
  }

  return <div className="stack">
    <PageHeader title="Routines" desc="Build a rhythm around the small things you want to do regularly." action={<button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => { if (showForm) resetForm(); else { setEditingId(null); setShowForm(true); } }}><Plus size={18} aria-hidden="true"/>Add a routine</button>}/>
    <PageFeature eyebrow="Make space for what matters" text="A routine should support your life, not become another source of pressure. Start with a few small actions and adjust them as your days change." image="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=85" imageAlt="A calm, sunlit room with a notebook and a plant" />

    {showForm && <form className="card form-card" onSubmit={saveRoutine}>
      <div className="card-head"><h2>{editingId === null ? 'Add a routine' : 'Edit routine'}</h2><button type="button" className="icon-btn" aria-label="Close form" onClick={resetForm}><X size={18}/></button></div>
      <div className="form-grid">
        <label className="field">Routine<input value={title} onChange={event => setTitle(event.target.value)} placeholder="Read for 15 minutes" required autoComplete="off" maxLength={80}/></label>
        <label className="field">Time of day<select value={time} onChange={event => setTime(event.target.value)}>{times.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field form-field-wide">A note (optional)<input value={detail} onChange={event => setDetail(event.target.value)} placeholder="A little context to help you get started" maxLength={120}/></label>
      </div>
      <div className="btn-row"><button type="submit" className="btn btn-primary">{editingId === null ? 'Save routine' : 'Save changes'}</button><button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button></div>
    </form>}

    <div className="grid-2 routine-overview">
      <Card>
        <p className="big-number">{doneCount}<small> of {habits.length} completed on {selectedDate === today ? 'today' : formatDay(selectedDate, { day: 'numeric', month: 'short' })}</small></p>
        <Meter value={doneCount} max={habits.length} label="Routines completed on selected day"/>
      </Card>
      <Card title="This week">
        <div className="routine-week-stats"><div><b>{weeklyTotal}</b><span>check-ins</span></div><div><b>{activeDays}/7</b><span>days with a check-in</span></div><div><b>{habits.length}</b><span>current routines</span></div></div>
        <div className="routine-week-dots" aria-label={activeDays + ' days with routine check-ins in the last seven days'}>
          {days.map(day => <span key={day.key} className={weeklyDone.some(item => item.date === day.key) ? 'is-active' : ''} title={formatDay(day.key, { weekday: 'long', day: 'numeric', month: 'short' })}/>)}
        </div>
      </Card>
    </div>

    <Card title={selectedDate === today ? "Today's list" : 'Routines for ' + formatDay(selectedDate, { day: 'numeric', month: 'long', year: 'numeric' })} action={<div className="btn-row"><label className="journal-date-field"><span className="sr-only">Routine date</span><input type="date" value={selectedDate} max={today} onChange={event => setSelectedDate(event.target.value)} aria-label="Choose routine date"/></label><div className="segmented" role="group" aria-label="Filter routines">
      <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All</button>
      <button type="button" aria-pressed={filter === 'remaining'} onClick={() => setFilter('remaining')}>Remaining</button>
    </div></div>}>
      {habits.length === 0 ? <EmptyState title="No routines yet" body="Add one to get started, such as a short walk or reading before bed."/> :
        visible.length === 0 ? <p className="muted">Everything on the list is done for this day.</p> :
        <ul className="rows">
          {visible.map(habit => <li className="row" key={habit.id}>
            <label className="check-row">
              <input type="checkbox" checked={doneIds.has(habit.id)} onChange={() => toggle(habit.id, habit.title)}/>
              <span className="check-box" aria-hidden="true"/>
              <span className="check-text"><b>{habit.title}</b><small>{[habit.time, habit.detail].filter(Boolean).join(' · ')}</small></span>
            </label>
            <div className="row-actions">
              <button type="button" className="icon-btn" aria-label={'Edit ' + habit.title} onClick={() => startEdit(habit)}><Edit3 size={17}/></button>
              <button type="button" className="icon-btn" aria-label={'Remove ' + habit.title} onClick={() => deleteRoutine(habit)}><Trash2 size={18}/></button>
            </div>
          </li>)}
        </ul>}
    </Card>

    <Card title="Your last seven days" >
      {habits.length === 0 ? <EmptyState title="Add a routine to see its history" body="Your daily check-ins will build a useful picture of your consistency over time."/> :
        <div className="routine-history-wrap">
          <table className="routine-history">
            <thead><tr><th scope="col">Routine</th>{days.map(day => <th scope="col" key={day.key}><span>{day.date.toLocaleDateString(undefined, { weekday: 'short' })}</span><b>{day.date.getDate()}</b></th>)}</tr></thead>
            <tbody>{habits.map(habit => {
              const count = weeklyDone.filter(item => item.routineId === habit.id).length;
              return <tr key={habit.id}><th scope="row"><span>{habit.title}</span><small>{count}/7 days</small></th>{days.map(day => <td key={day.key}><span className={completions.some(item => item.routineId === habit.id && item.date === day.key) ? 'routine-history-mark is-done' : 'routine-history-mark'} aria-label={completions.some(item => item.routineId === habit.id && item.date === day.key) ? 'Completed' : 'Not completed'}>{completions.some(item => item.routineId === habit.id && item.date === day.key) ? '✓' : '·'}</span></td>)}</tr>;
            })}</tbody>
          </table>
        </div>}
      <p className="muted small-print">Consistency counts recorded check-ins, not perfect streaks. A missed day does not erase your progress.</p>
    </Card>
  </div>;
}
