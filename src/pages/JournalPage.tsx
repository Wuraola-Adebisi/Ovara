import { useEffect, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
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
  const todayEntry = entries.find(entry => entry.date === today);
  const [mood, setMood] = useState(todayEntry?.mood ?? '');
  const [note, setNote] = useState(todayEntry?.note ?? '');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Pick up a mood chosen elsewhere (for example on the Today page) unless there are unsaved edits.
  useEffect(() => {
    if (dirty) return;
    setMood(todayEntry?.mood ?? '');
    setNote(todayEntry?.note ?? '');
  }, [todayEntry?.mood, todayEntry?.note, dirty]);

  const dayOfYear = Math.floor((new Date(today + 'T12:00:00').getTime() - new Date(new Date(today + 'T12:00:00').getFullYear(), 0, 0).getTime()) / 86400000);
  const prompt = prompts[dayOfYear % prompts.length];
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const past = sorted.filter(entry => entry.date !== today);
  const visible = showAll ? past : past.slice(0, 6);
  const canSave = mood !== '' || note.trim() !== '';

  function save() {
    setEntries(current => [
      { id: todayEntry?.id ?? Date.now(), date: today, mood, note: note.trim(), createdAt: todayEntry?.createdAt ?? new Date().toISOString() },
      ...current.filter(entry => entry.date !== today),
    ]);
    setDirty(false);
    setSaved(true);
  }

  return <div className="stack">
    <PageHeader title="Journal" desc="One entry a day. Everything stays on this device."/>
    <div className="grid-2 journal-layout">
      <Card title="Today">
        <MoodPicker name="journal-mood" legend="How are you feeling?" value={mood} onChange={value => { setMood(value); setDirty(true); setSaved(false); }}/>
        <label className="field">What is on your mind?
          <textarea rows={7} value={note} onChange={event => { setNote(event.target.value); setDirty(true); setSaved(false); }} placeholder="Write as much or as little as you like."/>
        </label>
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={save} disabled={!canSave || (!dirty && Boolean(todayEntry))}>{todayEntry ? 'Update entry' : 'Save entry'}</button>
          <span className="save-state" role="status">{saved && <><Check size={16} aria-hidden="true"/>Saved</>}</span>
        </div>
      </Card>
      <Card title="Prompt for today"><p className="prompt">{prompt}</p><p className="muted">Use it or ignore it.</p></Card>
    </div>

    <Card title="Past entries">
      {past.length === 0 ? <EmptyState title="No past entries yet" body="Entries from earlier days will be listed here."/> : <>
        <ul className="rows">
          {visible.map(entry => <li className="row row-top" key={entry.id}>
            <div className="row-main"><b>{entry.mood || 'Note'}</b><small>{formatDay(entry.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</small>{entry.note && <p className="entry-note">{entry.note}</p>}</div>
            <button type="button" className="icon-btn" aria-label={'Remove entry from ' + formatDay(entry.date, { day: 'numeric', month: 'short' })} onClick={() => remove(entry.id, 'journal entry')}><Trash2 size={18}/></button>
          </li>)}
        </ul>
        {past.length > 6 && <button type="button" className="btn btn-secondary" onClick={() => setShowAll(value => !value)}>{showAll ? 'Show fewer' : 'Show all ' + past.length}</button>}
      </>}
    </Card>
  </div>;
}
