import { useEffect, useState } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { habitsSeed } from '../data/seed';
import { Check, Droplets, Heart, Plus } from 'lucide-react';
import { Header } from '../components/PagePrimitives';
import { localDate, type RoutineCompletion } from '../lib/wellbeing';

export default function RoutinesPage() {
  const [items,setItems]=usePersistentState('ovara.habits',habitsSeed);
  const [habitsDate,setHabitsDate]=usePersistentState('ovara.habitsDate',localDate());
  const [completions,setCompletions]=usePersistentState<RoutineCompletion[]>('ovara.routineCompletions',[]);
  const [remaining,setRemaining]=useState(false);
  const [showForm,setShowForm]=useState(false);
  const [newTitle,setNewTitle]=useState('');
  useEffect(()=>{const today=localDate();if(habitsDate!==today){setItems(old=>old.map(item=>({...item,done:false})));setHabitsDate(today);}},[habitsDate,setItems,setHabitsDate]);
  const done=items.filter(x=>x.done).length;
  function toggleRoutine(id:number,title:string,wasDone:boolean) {
    setItems(old=>old.map(x=>x.id===id?{...x,done:!x.done}:x));
    if (wasDone) setCompletions(old=>old.filter(item=>!(item.routineId===id&&item.date===localDate())));
    else setCompletions(old=>[...old,{id:Date.now(),date:localDate(),routineId:id,title}]);
  }
  return <div className="stack">
    <Header tag="HABITS & SELF-CARE" title="Make room for what matters." desc="Create gentle structure around the things that help you feel good." action={<button className="btn dark" onClick={()=>setShowForm(value=>!value)}><Plus size={16}/> Add a routine</button>}/>
    {showForm&&<form className="panel activity-form" onSubmit={event=>{event.preventDefault();if(!newTitle.trim())return;setItems(old=>[...old,{id:Date.now(),title:newTitle.trim(),detail:'A routine you want to build',time:'Anytime',done:false}]);setNewTitle('');setShowForm(false)}}><div className="panel-title"><div><label>NEW ROUTINE</label><h3>What would you like to make time for?</h3></div><button type="button" className="btn outline small" onClick={()=>setShowForm(false)}>Cancel</button></div><div className="form-grid"><label>Routine name<input value={newTitle} onChange={event=>setNewTitle(event.target.value)} placeholder="e.g. Read for 15 minutes" required/></label></div><button className="btn dark" type="submit">Save routine</button></form>}
    <section className="routine-banner"><div><label>YOUR DAILY RHYTHM</label><h2>You're building consistency.</h2><p>Small actions, repeated with care, can become meaningful change.</p></div><strong>{done}<small>/{items.length}</small><span>completed today</span></strong></section>
    <div className="section-head"><div><label>YOUR ROUTINES</label><h2>Today's list</h2></div><button className="btn outline small" onClick={()=>setRemaining(v=>!v)}>{remaining?'Show all':'Show remaining'}</button></div>
    <article className="panel routine-full">{items.filter(x=>remaining?!x.done:true).map((h,i)=><button className="habit full-habit" key={h.id} onClick={()=>toggleRoutine(h.id,h.title,h.done)}><span className="metric-icon mint">{i%2===0?<Droplets size={18}/>:<Heart size={18}/>}</span><span><b>{h.title}</b><small>{h.detail}</small></span><small className="habit-time">{h.time}</small><span className={h.done?'check checked':'check'}>{h.done&&<Check size={12}/>}</span></button>)}</article>
  </div>;
}
