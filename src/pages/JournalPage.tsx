import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Edit3, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { useUndoRemove } from '../hooks/useUndoRemove';
import { useToast } from '../components/Toast';
import { Card, EmptyState, PageFeature, PageHeader } from '../components/PagePrimitives';
import MoodPicker from '../components/MoodPicker';
import { formatDay, lastDays } from '../lib/wellbeing';

const prompts = [
  'What felt good today, even if it was small?',
  'What took more energy than you expected?',
  'What do you want to remember about this week?',
  'What would make tomorrow a little easier?',
  'Who or what helped you today?',
  'What are you putting off, and what is the smallest first step?',
  'What did you learn about yourself today?',
  'What would you like to give yourself permission to do?',
  'What is one thing you handled better than you expected?',
  'What do you need more of this week?',
  'What can you leave unfinished for now?',
  'When did you feel most like yourself today?',
  'What is taking up space in your mind?',
  'What is one small thing you are looking forward to?',
];

const dateLabel = (key: string) => formatDay(key, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export default function JournalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const today = useToday();
  const [entries, setEntries] = useStore('journals');
  const [selectedDate, setSelectedDate] = useState(() => (location.state as { calendarDate?: string } | null)?.calendarDate ?? today);
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const toast = useToast();
  const remove = useUndoRemove(entries, setEntries);
  const selectedEntry = entries.find(entry => entry.date === selectedDate);

  useEffect(() => {
    if (dirty) return;
    setMood(selectedEntry?.mood ?? '');
    setNote(selectedEntry?.note ?? '');
    setSaved(false);
  }, [selectedDate, selectedEntry?.id, selectedEntry?.mood, selectedEntry?.note, dirty]);

  useEffect(() => {
    const state = location.state as { calendarDate?: string; calendarEventId?: string } | null;
    if (state?.calendarDate) changeDate(state.calendarDate);
    if (state?.calendarEventId?.startsWith('journal-')) navigate(location.pathname, { replace: true, state: null });
  }, [location.key]);

  const sorted = useMemo(() => [...entries].sort((a, b) => b.date.localeCompare(a.date)), [entries]);
  const past = sorted.filter(entry => entry.date !== today);
  const visible = showAll ? past : past.slice(0, 7);
  const week = lastDays(7);
  const weekEntries = week.map(day => entries.find(entry => entry.date === day.key)).filter(Boolean);
  const promptIndex = Math.floor((new Date(selectedDate + 'T12:00:00').getTime() - new Date(new Date(selectedDate + 'T12:00:00').getFullYear(), 0, 0).getTime()) / 86400000) % prompts.length;
  const canSave = mood !== '' || note.trim() !== '';
  const isToday = selectedDate === today;

  function changeDate(value: string) {
    setDirty(false);
    setSaved(false);
    setSelectedDate(value);
  }

  function save() {
    if (!canSave) return;
    setEntries(current => [
      { id: selectedEntry?.id ?? Date.now(), date: selectedDate, mood, note: note.trim(), createdAt: selectedEntry?.createdAt ?? new Date().toISOString() },
      ...current.filter(entry => entry.date !== selectedDate),
    ]);
    setDirty(false);
    setSaved(true);
    toast.show('Journal entry saved');
  }

  function editEntry(date: string) {
    setDirty(false);
    setSaved(false);
    setSelectedDate(date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteEntry(id: number, date: string) {
    remove(id, 'journal entry');
    if (selectedEntry?.id === id) {
      setMood('');
      setNote('');
      setDirty(false);
      setSaved(false);
      setSelectedDate(today);
    }
    if (date === today) toast.show('Today’s entry removed');
  }

  return <div className="stack">
    <PageHeader title="Journal" desc="A place to record how your days feel and what you want to remember."/>
    <PageFeature eyebrow="Make room to reflect" text="A mood, a sentence or a longer entry can help you pause and make sense of the day. Come back to earlier entries whenever you want." image="https://images.unsplash.com/photo-1455390582262-044cdead8028?auto=format&fit=crop&w=1200&q=85" imageAlt="An open journal and pen on a softly lit desk" />

    <div className="grid-2 journal-layout">
      <Card title={isToday ? 'Today’s entry' : 'Edit journal entry'} action={<label className="journal-date-field"><span className="sr-only">Entry date</span><input type="date" value={selectedDate} max={today} onChange={event => changeDate(event.target.value)} aria-label="Choose journal date"/></label>}>
        {!isToday && <p className="muted small-print">{dateLabel(selectedDate)}</p>}
        <MoodPicker name="journal-mood" legend="How are you feeling?" value={mood} onChange={value => { setMood(value); setDirty(true); setSaved(false); }}/>
        <label className="field">What is on your mind?
          <textarea rows={7} value={note} onChange={event => { setNote(event.target.value); setDirty(true); setSaved(false); }} placeholder="Write as much or as little as you like."/>
        </label>
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={save} disabled={!canSave || (!dirty && Boolean(selectedEntry))}>{selectedEntry ? 'Update entry' : 'Save entry'}</button>
          {selectedEntry && <button type="button" className="btn btn-secondary" onClick={() => { setSelectedDate(today); setDirty(false); }}>Back to today</button>}
          <span className="save-state" role="status">{saved && <><Check size={16} aria-hidden="true"/>Saved</>}</span>
        </div>
      </Card>
      <div className="stack">
        <Card title="A prompt to get started"><p className="prompt">{prompts[promptIndex]}</p><p className="muted">Use it or ignore it. Your entry does not need to answer a question.</p></Card>
        <Card title="Your last seven days">
          <div className="journal-week">
            {week.map(day => {
              const entry = entries.find(item => item.date === day.key);
              return <button type="button" key={day.key} className={'journal-week-day' + (day.key === selectedDate ? ' is-selected' : '') + (entry ? ' has-entry' : '')} onClick={() => changeDate(day.key)} aria-label={dateLabel(day.key) + (entry ? ', entry recorded' : ', no entry')}>
                <small>{day.date.toLocaleDateString(undefined, { weekday: 'short' })}</small><b>{day.date.getDate()}</b><span>{entry ? 'Recorded' : '—'}</span>
              </button>;
            })}
          </div>
          <p className="muted small-print">{weekEntries.length} {weekEntries.length === 1 ? 'entry' : 'entries'} recorded this week</p>
        </Card>
      </div>
    </div>

    <Card title="Past entries">
      {past.length === 0 ? <EmptyState title="Your journal starts here" body="Once you save entries on earlier days, you can revisit and edit them here."/> : <>
        <ul className="rows">
          {visible.map(entry => <li className="row row-top" key={entry.id}>
            <div className="row-main"><b>{entry.mood || 'Note'}</b><small>{dateLabel(entry.date)}</small>{entry.note && <p className="entry-note">{entry.note}</p>}</div>
            <div className="row-actions">
              <button type="button" className="icon-btn" aria-label={'Edit entry from ' + dateLabel(entry.date)} onClick={() => editEntry(entry.date)}><Edit3 size={17}/></button>
              <button type="button" className="icon-btn" aria-label={'Remove entry from ' + dateLabel(entry.date)} onClick={() => deleteEntry(entry.id, entry.date)}><Trash2 size={18}/></button>
            </div>
          </li>)}
        </ul>
        {past.length > 7 && <button type="button" className="btn btn-secondary" onClick={() => setShowAll(value => !value)}>{showAll ? 'Show fewer' : 'Show all ' + past.length}</button>}
      </>}
    </Card>
  </div>;
}
