import { useEffect, useState } from 'react';
import { Check, Search, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { useUndoRemove } from '../hooks/useUndoRemove';
import { Card, EmptyState, PageHeader } from '../components/PagePrimitives';
import MoodPicker from '../components/MoodPicker';
import { formatDay } from '../lib/wellbeing';

const prompts = [
  'What felt good today, even if it was small?',
  'What took more energy than you expected?',
  'What do you want to remember about this week?',
  'What would make tomorrow a little easier?',
  'Who or what helped you today?',
  'What are you putting off, and what is the smallest first step?',
  'What did your body ask for today?',
];

export default function JournalPage() {
  const today = useToday();
  const [entries, setEntries] = useStore('journals');
  const remove = useUndoRemove(entries, setEntries);
  const [date, setDate] = useState(today);
  const entry = entries.find(item => item.date === date);
  const [mood, setMood] = useState(entry?.mood ?? '');
  const [note, setNote] = useState(entry?.note ?? '');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');

  // Load the chosen day, and pick up a mood set elsewhere unless there are unsaved edits.
  useEffect(() => {
    if (dirty) return;
    setMood(entry?.mood ?? '');
    setNote(entry?.note ?? '');
  }, [entry?.mood, entry?.note, date, dirty]);

  const dayOfYear = Math.floor((new Date(date + 'T12:00:00').getTime() - new Date(new Date(date + 'T12:00:00').getFullYear(), 0, 0).getTime()) / 86400000);
  const prompt = prompts[dayOfYear % prompts.length];
  const needle = query.trim().toLowerCase();
  const others = [...entries].sort((a, b) => b.date.localeCompare(a.date)).filter(item => item.date !== date)
    .filter(item => !needle || item.note.toLowerCase().includes(needle) || item.mood.toLowerCase().includes(needle));
  const visible = showAll || needle ? others : others.slice(0, 6);
  const canSave = mood !== '' || note.trim() !== '';
  const isToday = date === today;
  const wordCount = note.trim() ? note.trim().split(/\s+/).length : 0;

  function changeDate(next: string) {
    if (!next || next > today) return;
    setDirty(false); setSaved(false); setDate(next);
  }
  function save() {
    setEntries(current => [
      { id: entry?.id ?? Date.now(), date, mood, note: note.trim(), createdAt: entry?.createdAt ?? new Date().toISOString() },
      ...current.filter(item => item.date !== date),
    ]);
    setDirty(false);
    setSaved(true);
  }

  return <div className="stack">
    <PageHeader title="Journal" desc="One entry a day. Everything stays on this device." action={<label className="inline-select">Entry for<input type="date" className="time-input" value={date} max={today} onChange={event => changeDate(event.target.value)}/></label>}/>
    <div className="grid-2 journal-layout">
      <Card title={isToday ? 'Today' : formatDay(date, { weekday: 'long', day: 'numeric', month: 'long' })}>
        <MoodPicker name="journal-mood" legend="How are you feeling?" value={mood} onChange={value => { setMood(value); setDirty(true); setSaved(false); }}/>
        <label className="field">What is on your mind?
          <textarea rows={8} value={note} onChange={event => { setNote(event.target.value); setDirty(true); setSaved(false); }} placeholder="Write as much or as little as you like."/>
          <small>{wordCount} {wordCount === 1 ? 'word' : 'words'}</small>
        </label>
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={save} disabled={!canSave || (!dirty && Boolean(entry))}>{entry ? 'Update entry' : 'Save entry'}</button>
          {!isToday && <button type="button" className="btn btn-secondary" onClick={() => changeDate(today)}>Back to today</button>}
          <span className="save-state" role="status">{saved && <><Check size={16} aria-hidden="true"/>Saved</>}</span>
        </div>
      </Card>
      <Card title="Prompt"><p className="prompt">{prompt}</p><p className="muted">Use it or ignore it. The prompt changes each day.</p></Card>
    </div>

    <Card title="Other entries" action={entries.length > 3 ? <label className="search-field"><Search size={18} aria-hidden="true"/><span className="sr-only">Search entries</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search entries"/></label> : undefined}>
      {others.length === 0 ? <EmptyState title={needle ? 'No matches' : 'No other entries yet'} body={needle ? 'Try a different word.' : 'Entries from other days will be listed here.'}/> : <>
        <ul className="rows">
          {visible.map(item => <li className="row row-top" key={item.id}>
            <div className="row-main"><b>{item.mood || 'Note'}</b><small>{formatDay(item.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</small>{item.note && <p className="entry-note">{item.note}</p>}</div>
            <button type="button" className="btn btn-secondary" onClick={() => changeDate(item.date)}>Open</button>
            <button type="button" className="icon-btn" aria-label={'Remove entry from ' + formatDay(item.date, { day: 'numeric', month: 'short' })} onClick={() => remove(item.id, 'journal entry')}><Trash2 size={18}/></button>
          </li>)}
        </ul>
        {!needle && others.length > 6 && <button type="button" className="btn btn-secondary" onClick={() => setShowAll(value => !value)}>{showAll ? 'Show fewer' : 'Show all ' + others.length}</button>}
      </>}
    </Card>
  </div>;
}
