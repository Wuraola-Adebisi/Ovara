import { usePersistentState } from '../hooks/usePersistentState';
import { BookHeart, Check, Heart } from 'lucide-react';
import { Header } from '../components/PagePrimitives';
import { localDate, type JournalEntry } from '../lib/wellbeing';

export default function JournalPage() {
  const [mood, setMood] = usePersistentState('ovara.journalMood', 'Good');
  const [note, setNote] = usePersistentState('ovara.journalNote', '');
  const [saved, setSaved] = usePersistentState('ovara.journalSaved', false);
  const [entries, setEntries] = usePersistentState<JournalEntry[]>('ovara.journalEntries', []);
  const today = localDate();
  const todayEntry = entries.find(entry => entry.date === today);
  function saveReflection() {
    const entry: JournalEntry = { id: todayEntry?.id || Date.now(), date: today, mood, note: note.trim(), createdAt: new Date().toISOString() };
    setEntries(current => [entry, ...current.filter(item => item.date !== today)]);
    setSaved(true);
  }
  return <div className="stack">
    <Header tag="PERSONAL REFLECTION" title="Check in with yourself." desc="A little space to notice how you're feeling and what's on your mind."/>
    <section className="journal-grid"><article className="panel editor">
      <div className="journal-date"><span className="metric-icon lilac"><BookHeart size={18}/></span><span><b>Today's reflection</b><small>Your private reflection</small></span></div>
      <label className="field-label">How are you feeling today?</label>
      <div className="journal-moods">{['Low','Okay','Good','Great','Anxious'].map((m,i)=><button className={mood===m?'chosen':''} key={m} onClick={()=>{setMood(m);setSaved(false)}}><span>{['☁','◒','☀','♥','〰'][i]}</span><small>{m}</small></button>)}</div>
      <label className="field-label" htmlFor="journal-note">What's on your mind?</label>
      <textarea id="journal-note" value={note} onChange={e=>{setNote(e.target.value);setSaved(false)}} placeholder="Start wherever you are. It doesn't have to be polished..." rows={7}/>
      <div className="journal-actions"><span>Your thoughts are yours. Take your time.</span><button className="btn dark" onClick={saveReflection}><Check size={15}/> Save reflection</button></div>
      {saved&&<p className="saved"><Check size={14}/> Saved to your journal.</p>}
    </article><aside className="panel journal-prompt"><span className="metric-icon peach"><Heart size={18}/></span><label>A GENTLE PROMPT</label><h3>What felt good today, even if it was something small?</h3><p>Sometimes the moments worth remembering are the quiet ones we almost overlook.</p><hr/><label>A SMALL REMINDER</label><p>You don't have to have it all figured out today.</p></aside></section>
    <article className="panel"><div className="panel-title"><div><label>LOOKING BACK</label><h3>Recent reflections</h3></div></div>{entries.length ? entries.slice(0,8).map(entry=><div className="journal-history" key={entry.id}><div><b>{entry.mood}</b><small>{new Date(entry.date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</small></div><p>{entry.note || 'A mood check-in, without a written note.'}</p></div>) : <p className="muted-copy">Your saved reflections will appear here.</p>}</article>
  </div>;
}
