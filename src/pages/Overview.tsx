import { useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { habitsSeed, type ActivityRecord } from '../data/seed';
import { Link } from 'react-router-dom';
import { Activity, ArrowUpRight, Check, ChevronRight, Clock3, Droplets, Footprints, Heart, Plus, Target, Wind } from 'lucide-react';
import { Header, PanelTitle, Metric } from '../components/PagePrimitives';
import { defaultPreferences, localDate, type JournalEntry, type Preferences, type RoutineCompletion, type WaterEntry } from '../lib/wellbeing';

export default function Overview() {
  const [habits,setHabits]=usePersistentState('ovara.habits',habitsSeed);
  const [habitsDate,setHabitsDate]=usePersistentState('ovara.habitsDate',localDate());
  const [water,setWater]=usePersistentState('ovara.waterGlasses',0);
  const [waterLog,setWaterLog]=usePersistentState<WaterEntry[]>('ovara.waterLog',[]);
  const [mood,setMood]=usePersistentState('ovara.dailyMood','');
  const [journals,setJournals]=usePersistentState<JournalEntry[]>('ovara.journalEntries',[]);
  const [completions,setCompletions]=usePersistentState<RoutineCompletion[]>('ovara.routineCompletions',[]);
  const [preferences]=usePersistentState<Preferences>('ovara.preferences',defaultPreferences);
  const [activities]=usePersistentState<ActivityRecord[]>('ovara.activities',[]);
  useEffect(()=>{const today=localDate();if(habitsDate!==today){setHabits(old=>old.map(item=>({...item,done:false})));setHabitsDate(today);}},[habitsDate,setHabits,setHabitsDate]);
  const done=habits.filter(h=>h.done).length;
  const todayKey=localDate();
  const todayActivities=activities.filter(entry=>entry.date===todayKey);
  const todaySteps=todayActivities.reduce((sum,entry)=>sum+entry.steps,0);
  const todayMinutes=todayActivities.reduce((sum,entry)=>sum+entry.minutes,0);
  const todayWaterMl=waterLog.filter(item=>item.date===todayKey).reduce((sum,item)=>sum+item.ml,0);
  const todayGlasses=todayWaterMl ? Math.round(todayWaterMl/250) : water;
  const days=Array.from({length:7},(_,i)=>{const date=new Date();date.setDate(date.getDate()-(6-i));const key=localDate(date);return [date.toLocaleDateString(undefined,{weekday:'short'}),activities.filter(entry=>entry.date===key).reduce((sum,entry)=>sum+entry.steps,0)] as [string,number]});
  function toggleHabit(id:number,title:string,wasDone:boolean) {
    setHabits(old=>old.map(x=>x.id===id?{...x,done:!x.done}:x));
    if(wasDone) setCompletions(old=>old.filter(item=>!(item.routineId===id&&item.date===todayKey)));
    else setCompletions(old=>[...old,{id:Date.now(),date:todayKey,routineId:id,title}]);
  }
  function addWater() {
    setWaterLog(old=>[...old,{id:Date.now(),date:todayKey,ml:250,time:new Date().toISOString()}]);
    setWater(v=>v+1);
  }
  function saveMood(value:string) {
    setMood(value);
    setJournals(old=>[{id:Date.now(),date:todayKey,mood:value,note:'',createdAt:new Date().toISOString()},...old.filter(item=>item.date!==todayKey)]);
  }
  return <div className="stack">
    <Header tag="YOUR DAY, YOUR PACE" title="A little progress goes a long way." desc="Here's how your day is taking shape. Make it yours." action={<button className="btn dark" onClick={()=>window.dispatchEvent(new Event('ovara:add'))}><Plus size={16}/> Add an entry</button>}/>
    <section className="hero"><div className="hero-copy"><label><Heart size={13}/> YOUR DAILY CHECK-IN</label><h2>Make today count,<br/><em>at your own pace.</em></h2><p>There is no perfect routine. Just the small things that help you feel more like yourself.</p><Link className="btn light" to="/app/routines">View your routines <ArrowUpRight size={15}/></Link></div><div className="hero-orbit"><div><Wind size={42}/></div><i>•</i></div></section>
    <div className="section-head"><div><label>YOUR DAY</label><h2>The overview</h2></div><span>Today</span></div>
    <section className="metrics"><Metric label="Steps" value={todaySteps.toLocaleString()} note={"Daily target: "+preferences.dailyStepTarget.toLocaleString()} icon={Footprints} tone="mint"/><Metric label="Active time" value={String(todayMinutes)} unit="min" note="Movement logged today" icon={Clock3} tone="lilac"/><Metric label="Water" value={String(todayGlasses*250)} unit="ml" note={'Goal: '+preferences.dailyWaterTargetMl.toLocaleString()+' ml'} icon={Droplets} tone="peach"/><Metric label="Routines" value={done+'/'+habits.length} note="A few more to go" icon={Target} tone="butter"/></section>
    <section className="two-col"><article className="panel"><PanelTitle tag="KEEP MOVING" title="Your activity" action={<Link className="text-link" to="/app/activity">View activity <ChevronRight size={14}/></Link>}/><div className="chart-total"><b>{Math.round(days.reduce((sum,day)=>sum+day[1],0)/7).toLocaleString()}</b><span>average steps this week</span></div><div className="bars">{days.map(([day,num],i)=><div className="bar-col" key={i}><div className="bar-bg"><i style={{height:(Number(num)/Math.max(11000,...days.map(d=>d[1]))*100)+'%'}} className={i===6?'current':''}/></div><small>{day}</small></div>)}</div><div className="chart-foot"><span>● Steps</span><span>Daily movement, not a competition.</span></div></article><article className="panel"><PanelTitle tag="SHOW UP FOR YOU" title="Today's routines" action={<Link className="round-link" to="/app/routines"><ArrowUpRight size={16}/></Link>}/><div className="progress-line"><i style={{width:(habits.length?done/habits.length*100:0)+'%'}}/></div><div className="habit-list">{habits.slice(0,4).map(h=><button className="habit" key={h.id} onClick={()=>toggleHabit(h.id,h.title,h.done)}><span className={h.done?'check checked':'check'}>{h.done&&<Check size={12}/>}</span><span><b>{h.title}</b><small>{h.time}</small></span><ChevronRight size={14}/></button>)}</div><Link className="bottom-link" to="/app/routines">See all routines <ArrowUpRight size={14}/></Link></article></section>
    <section className="two-col"><article className="panel"><PanelTitle tag="A LITTLE HYDRATION" title="Water check-in" action={<span className="metric-icon peach"><Droplets size={17}/></span>}/><div className="water-total"><b>{(todayWaterMl/1000||todayGlasses*.25).toFixed(2)}</b><span> / {(preferences.dailyWaterTargetMl/1000).toFixed(1)} litres</span></div><div className="water-drops">{Array.from({length:Math.min(12,Math.max(8,Math.ceil(preferences.dailyWaterTargetMl/250)))},(_,i)=><span className={i<todayGlasses?'filled':''} key={i}><Droplets size={16}/></span>)}</div><div className="water-foot"><span>{todayGlasses} glasses logged</span><button className="btn outline small" onClick={addWater}><Plus size={13}/> Add glass</button></div></article><article className="panel"><PanelTitle tag="PAUSE FOR A MOMENT" title="A quick reflection" action={<span className="metric-icon lilac"><Heart size={17}/></span>}/><p className="prompt">How are you feeling about today so far?</p><div className="moods">{['Not great','A little low','Okay','Good','Great'].map((m,i)=><button onClick={()=>saveMood(m)} className={mood===m?'chosen':''} key={m}><span>{['☁','◒','◉','☀','♥'][i]}</span><small>{m}</small></button>)}</div><Link className="bottom-link" to="/app/journal">Open your journal <ArrowUpRight size={14}/></Link></article></section>
    <section className="insight-shortcut"><div><label>YOUR PATTERNS</label><h3>See how your days are adding up.</h3><p>Explore your history, goals and personal insights.</p></div><div><Link className="btn outline small" to="/app/insights">View insights</Link><Link className="btn outline small" to="/app/goals">Your goals</Link><Link className="btn outline small" to="/app/calendar">Open calendar</Link></div></section>
  </div>;
}
