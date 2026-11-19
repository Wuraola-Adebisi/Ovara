import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Header, PanelTitle } from '../components/PagePrimitives';
import { usePersistentState } from '../hooks/usePersistentState';
import { collectEvents, localDate, type JournalEntry, type RoutineCompletion, type WaterEntry } from '../lib/wellbeing';
import type { ActivityRecord, Meal } from '../data/seed';

const colors: Record<string, string> = { activity: 'activity', meal: 'meal', water: 'water', journal: 'journal', routine: 'routine' };

export default function CalendarPage() {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(localDate());
  const [activities] = usePersistentState<ActivityRecord[]>('ovara.activities', []);
  const [meals] = usePersistentState<Meal[]>('ovara.meals', []);
  const [water] = usePersistentState<WaterEntry[]>('ovara.waterLog', []);
  const [journals] = usePersistentState<JournalEntry[]>('ovara.journalEntries', []);
  const [completions] = usePersistentState<RoutineCompletion[]>('ovara.routineCompletions', []);
  const events = useMemo(() => collectEvents({ activities, meals, water, journals, completions }), [activities, meals, water, journals, completions]);
  const year = month.getFullYear(), monthIndex = month.getMonth();
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    if (day < 1 || day > count) return null;
    return localDate(new Date(year, monthIndex, day));
  });
  const selectedEvents = events.filter(event => event.date === selected);
  function changeMonth(amount: number) { setMonth(current => new Date(current.getFullYear(), current.getMonth() + amount, 1)); }
  return <div className="stack">
    <Header tag="YOUR WELLBEING, IN ONE PLACE" title="A view of your days." desc="See movement, meals, routines, hydration and reflections together."/>
    <section className="calendar-layout">
      <article className="panel calendar-panel">
        <div className="calendar-heading"><div><label>YOUR CALENDAR</label><h3>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3></div><div className="calendar-nav"><button aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft size={17}/></button><button aria-label="Next month" onClick={() => changeMonth(1)}><ChevronRight size={17}/></button></div></div>
        <div className="calendar-grid calendar-weekdays">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">{cells.map((key, index) => { const dayEvents = key ? events.filter(event => event.date === key) : []; return <button key={key || 'empty-' + index} disabled={!key} className={'calendar-day ' + (key === selected ? 'selected' : '') + (key === localDate() ? ' today' : '')} onClick={() => key && setSelected(key)}><b>{key ? Number(key.slice(-2)) : ''}</b><span>{dayEvents.slice(0, 4).map(event => <i key={event.id} className={colors[event.type]} title={event.title}/>)}</span>{dayEvents.length > 4 && <small>+{dayEvents.length - 4}</small>}</button> })}</div>
        <div className="calendar-legend">{Object.entries(colors).map(([type, color]) => <span key={type}><i className={color}/>{type === 'meal' ? 'Meals' : type[0].toUpperCase() + type.slice(1)}</span>)}</div>
      </article>
      <aside className="panel calendar-events"><PanelTitle tag="SELECTED DAY" title={new Date(selected + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}/>{selectedEvents.length ? selectedEvents.map(event => <div className="calendar-event" key={event.id}><i className={colors[event.type]}/><div><b>{event.title}</b><small>{event.detail}</small></div></div>) : <div className="empty-state"><b>A little breathing room.</b><p>There are no entries saved for this day.</p></div>}</aside>
    </section>
  </div>;
}
