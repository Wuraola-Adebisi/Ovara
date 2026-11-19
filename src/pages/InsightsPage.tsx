import { useMemo, useState } from 'react';
import { Activity, BookHeart, Droplets, Footprints, Salad, Target } from 'lucide-react';
import { Header, Metric, PanelTitle } from '../components/PagePrimitives';
import { usePersistentState } from '../hooks/usePersistentState';
import { getRangeStats, localDate, shiftDate, type JournalEntry, type RoutineCompletion, type WaterEntry } from '../lib/wellbeing';
import { getPersonalisedInsights } from '../services/insightsService';
import type { ActivityRecord, Meal, Habit } from '../data/seed';

export default function InsightsPage() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [activities] = usePersistentState<ActivityRecord[]>('ovara.activities', []);
  const [meals] = usePersistentState<Meal[]>('ovara.meals', []);
  const [water] = usePersistentState<WaterEntry[]>('ovara.waterLog', []);
  const [journals] = usePersistentState<JournalEntry[]>('ovara.journalEntries', []);
  const [completions] = usePersistentState<RoutineCompletion[]>('ovara.routineCompletions', []);
  const [habits] = usePersistentState<Habit[]>('ovara.habits', []);
  const data = useMemo(() => ({ activities, meals, water, journals, completions }), [activities, meals, water, journals, completions]);
  const stats = useMemo(() => getRangeStats(period, data), [period, data]);
  const insights = useMemo(() => getPersonalisedInsights(stats, period), [stats, period]);
  const days = period === 'week' ? 7 : new Date().getDate();
  const series = Array.from({ length: days }, (_, index) => {
    const date = period === 'week' ? shiftDate(new Date(), index - 6) : new Date(new Date().getFullYear(), new Date().getMonth(), index + 1);
    const key = localDate(date);
    const steps = activities.filter(item => item.date === key).reduce((sum, item) => sum + item.steps, 0);
    const waterMl = water.filter(item => item.date === key).reduce((sum, item) => sum + item.ml, 0);
    const minutes = activities.filter(item => item.date === key).reduce((sum, item) => sum + item.minutes, 0);
    return { key, label: period === 'week' ? date.toLocaleDateString(undefined, { weekday: 'short' }) : String(date.getDate()), steps, waterMl, minutes };
  });
  const maxSteps = Math.max(1, ...series.map(item => item.steps));
  const completedToday = habits.filter(item => item.done).length;
  return <div className="stack">
    <Header tag="YOUR PATTERNS" title="A clearer picture, over time." desc="Notice what is changing across your movement, nourishment and everyday wellbeing."/>
    <div className="insight-toolbar"><div><label>LOOKING AT</label><p>{period === 'week' ? 'The last 7 days' : 'This month so far'}</p></div><div className="segmented"><button className={period === 'week' ? 'selected' : ''} onClick={() => setPeriod('week')}>Week</button><button className={period === 'month' ? 'selected' : ''} onClick={() => setPeriod('month')}>Month</button></div></div>
    <section className="metrics">
      <Metric label="Active time" value={String(stats.minutes)} unit="min" note={stats.activeDays + ' active days'} icon={Activity} tone="mint"/>
      <Metric label="Steps" value={stats.steps.toLocaleString()} note="Across logged movement" icon={Footprints} tone="lilac"/>
      <Metric label="Water" value={(stats.waterMl / 1000).toFixed(1)} unit="L" note="Recorded hydration" icon={Droplets} tone="peach"/>
      <Metric label="Food notes" value={String(stats.mealCount)} note="Meals and snacks recorded" icon={Salad} tone="butter"/>
    </section>
    <section className="two-col">
      <article className="panel"><PanelTitle tag="MOVEMENT OVER TIME" title="Daily steps"/><div className="insight-chart">{series.map(day => <div className="insight-chart-col" key={day.key}><b>{day.steps ? day.steps.toLocaleString() : '—'}</b><span><i style={{ height: (day.steps / maxSteps * 100) + '%' }}/></span><small>{day.label}</small></div>)}</div><p className="insight-footnote">A record of what you logged, not a measure of your worth.</p></article>
      <article className="panel"><PanelTitle tag="YOUR ROUTINES" title="Showing up counts"/><div className="insight-big-number">{stats.routineCount}<small> completed check-ins</small></div><p className="muted-copy">{completedToday} of {habits.length} routines currently marked complete today. Your history grows as you check them off.</p><div className="insight-stat-row"><span>Journal reflections</span><b>{stats.journals.length}</b></div><div className="insight-stat-row"><span>Days with movement</span><b>{stats.activeDays}</b></div><div className="insight-stat-row"><span>Meals and snacks</span><b>{stats.mealCount}</b></div></article>
    </section>
    <article className="panel"><PanelTitle tag="A FEW THINGS TO NOTICE" title="Your wellbeing notes"/><div className="insight-cards">{insights.map((item, index) => <div className={'insight-card ' + item.tone} key={index}><span>{['01','02','03','04','05'][index]}</span><h3>{item.title}</h3><p>{item.body}</p></div>)}</div><p className="insight-footnote">These observations are based on your saved entries. They are intended to help you notice patterns, not provide medical advice.</p></article>
  </div>;
}
