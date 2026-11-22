import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { Card, EmptyState, PageHeader } from '../components/PagePrimitives';
import { collectEvents, formatDay, localDate } from '../lib/wellbeing';

const typeLabels = { activity: 'Activity', meal: 'Food', water: 'Water', journal: 'Journal', routine: 'Routine' } as const;
const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const eventPaths = {
  activity: '/app/activity',
  meal: '/app/nutrition',
  water: '/app/nutrition',
  journal: '/app/journal',
  routine: '/app/routines',
} as const;

export default function CalendarPage() {
  const today = useToday();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(today);
  const [activities] = useStore('activities');
  const [meals] = useStore('meals');
  const [water] = useStore('water');
  const [journals] = useStore('journals');
  const [completions] = useStore('completions');
  const [preferences] = useStore('preferences');

  const eventsByDay = useMemo(() => {
    const map = new Map<string, ReturnType<typeof collectEvents>>();
    collectEvents({ activities, meals, water, journals, completions }, preferences).forEach(event => map.set(event.date, [...(map.get(event.date) ?? []), event]));
    return map;
  }, [activities, meals, water, journals, completions, preferences]);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const offset = (new Date(year, monthIndex, 1).getDay() - preferences.weekStartsOn + 7) % 7;
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    return day < 1 || day > count ? null : localDate(new Date(year, monthIndex, day));
  });
  const selectedEvents = eventsByDay.get(selected) ?? [];

  function changeMonth(amount: number) {
    const next = new Date(year, monthIndex + amount, 1);
    setMonth(next);
    setSelected(localDate(next));
  }

  function selectToday() {
    const date = new Date(today + 'T12:00:00');
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setSelected(today);
  }

  return <div className="stack">
    <PageHeader title="Calendar" desc="Everything you logged, by day."/>

    <div className="calendar-layout">
      <Card>
        <div className="calendar-head">
          <h2>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
          <div className="btn-row">
            <button type="button" className="btn btn-secondary calendar-today" onClick={selectToday}>Today</button>
            <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft size={20}/></button>
            <button type="button" className="icon-btn" aria-label="Next month" onClick={() => changeMonth(1)}><ChevronRight size={20}/></button>
          </div>
        </div>
        <div className="calendar-grid calendar-weekdays" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <span key={index}>{weekdayNames[(preferences.weekStartsOn + index) % 7]}</span>)}</div>
        <div className="calendar-grid">
          {cells.map((key, index) => {
            if (!key) return <span className="calendar-blank" key={'blank-' + index}/>;
            const dayEvents = eventsByDay.get(key) ?? [];
            const types = [...new Set(dayEvents.map(event => event.type))];
            return <button type="button" key={key} aria-pressed={key === selected} aria-label={formatDay(key, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + (dayEvents.length ? dayEvents.length + ' entries' : 'no entries')} className={['calendar-day', key === today ? 'is-today' : '', key === selected ? 'is-selected' : ''].filter(Boolean).join(' ')} onClick={() => setSelected(key)}>
              <b>{Number(key.slice(-2))}</b>
              <span className="dots" aria-hidden="true">{types.map(type => <i key={type} className={'dot dot-' + type}/>)}</span>
            </button>;
          })}
        </div>
        <ul className="legend">{Object.entries(typeLabels).map(([type, label]) => <li key={type}><i className={'dot dot-' + type} aria-hidden="true"/>{label}</li>)}</ul>
      </Card>
      <Card title={formatDay(selected, { weekday: 'long', day: 'numeric', month: 'long' })}>
        {selectedEvents.length === 0 ? <EmptyState title="Nothing logged" body="No entries for this day. Choose another date to look back at your records."/> :
          <ul className="rows">{selectedEvents.map(event => <li className="row calendar-event" key={event.id}>
            <i className={'dot dot-' + event.type} aria-hidden="true"/>
            <div className="row-main"><b>{event.title}</b><small>{typeLabels[event.type]}, {event.detail}</small></div>
            <Link className="calendar-event-link" to={eventPaths[event.type]} state={{ calendarDate: event.date, calendarEventId: event.id }} aria-label={'Open ' + event.title + ' in ' + typeLabels[event.type]}><ExternalLink size={17} aria-hidden="true"/></Link>
          </li>)}</ul>}
      </Card>
    </div>
  </div>;
}
