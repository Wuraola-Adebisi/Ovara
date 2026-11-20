import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { useUndoRemove } from '../hooks/useUndoRemove';
import { Card, EmptyState, Meter, PageFeature, PageHeader } from '../components/PagePrimitives';

const times = ['Morning', 'Afternoon', 'Evening', 'Anytime'];

export default function RoutinesPage() {
  const today = useToday();
  const [habits, setHabits] = useStore('habits');
  const [completions, setCompletions] = useStore('completions');
  const remove = useUndoRemove(habits, setHabits);
  const [filter, setFilter] = useState<'all' | 'remaining'>('all');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('Anytime');

  // Whether a routine is done is derived from today's completions. There is no
  // separate "done" flag to reset at midnight.
  const doneIds = new Set(completions.filter(item => item.date === today).map(item => item.routineId));
  const doneCount = habits.filter(habit => doneIds.has(habit.id)).length;
  const visible = habits.filter(habit => filter === 'all' || !doneIds.has(habit.id));

  function toggle(id: number, name: string) {
    if (doneIds.has(id)) setCompletions(current => current.filter(item => !(item.routineId === id && item.date === today)));
    else setCompletions(current => [...current, { id: Date.now(), date: today, routineId: id, title: name }]);
  }
  function addRoutine(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setHabits(current => [...current, { id: Date.now(), title: title.trim(), detail: '', time }]);
    setTitle(''); setTime('Anytime'); setShowForm(false);
  }

  return <div className="stack">
    <PageHeader title="Routines" desc="Small things you want to do regularly. Ticks reset each day and your history is kept." action={<button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => setShowForm(value => !value)}><Plus size={18} aria-hidden="true"/>Add a routine</button>}/>

    <PageFeature eyebrow="Make space for what matters" text="A routine should support your life, not become another source of pressure. Start with a few small actions and adjust them as your days change." image="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=85" imageAlt="A calm, sunlit room with a notebook and a plant" />

    {showForm && <form className="card form-card" onSubmit={addRoutine}>
      <div className="card-head"><h2>Add a routine</h2></div>
      <div className="form-grid">
        <label className="field">Routine<input value={title} onChange={event => setTitle(event.target.value)} placeholder="Read for 15 minutes" required autoComplete="off"/></label>
        <label className="field">Time of day<select value={time} onChange={event => setTime(event.target.value)}>{times.map(item => <option key={item}>{item}</option>)}</select></label>
      </div>
      <div className="btn-row"><button type="submit" className="btn btn-primary">Save routine</button><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
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
            <button type="button" className="icon-btn" aria-label={'Remove ' + habit.title} onClick={() => remove(habit.id, habit.title)}><Trash2 size={18}/></button>
          </li>)}
        </ul>}
    </Card>
  </div>;
}
