import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { Card, PageHeader } from '../components/PagePrimitives';
import BarChart from '../components/BarChart';
import { formatWater, getRangeStats, localDate, lastDays, sumFor } from '../lib/wellbeing';
import { getPersonalisedInsights } from '../services/insightsService';

export default function InsightsPage() {
  const today = useToday();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [activities] = useStore('activities');
  const [meals] = useStore('meals');
  const [water] = useStore('water');
  const [journals] = useStore('journals');
  const [completions] = useStore('completions');
  const [preferences] = useStore('preferences');

  const stats = useMemo(() => getRangeStats(period, { activities, meals, water, journals, completions }), [period, activities, meals, water, journals, completions, today]);
  const insights = useMemo(() => getPersonalisedInsights(stats, period, preferences), [stats, period, preferences]);
  const waterTotal = formatWater(stats.waterMl, preferences.waterUnit);

  const now = new Date();
  const days = period === 'week' ? lastDays(7) : Array.from({ length: now.getDate() }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
    return { key: localDate(date), date };
  });
  const bars = days.map(({ key, date }) => ({
    key,
    label: period === 'week' ? date.toLocaleDateString(undefined, { weekday: 'short' }) : String(date.getDate()),
    fullLabel: date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }),
    value: sumFor(activities, key, item => item.steps), highlight: key === today,
  }));

  return <div className="stack">
    <PageHeader title="Insights" desc="Patterns in what you have logged. Calculated on this device." action={<div className="segmented" role="group" aria-label="Time range">
      <button type="button" aria-pressed={period === 'week'} onClick={() => setPeriod('week')}>7 days</button>
      <button type="button" aria-pressed={period === 'month'} onClick={() => setPeriod('month')}>This month</button>
    </div>}/>

    <Card>
      <dl className="stat-strip four">
        <div><dt>Active minutes</dt><dd>{stats.minutes.toLocaleString()}</dd></div>
        <div><dt>Steps</dt><dd>{stats.steps.toLocaleString()}</dd></div>
        <div><dt>Water</dt><dd>{waterTotal.value}<small> {waterTotal.unit}</small></dd></div>
        <div><dt>Routine check-ins</dt><dd>{stats.routineCount}</dd></div>
      </dl>
    </Card>

    <Card title="Steps per day"><BarChart bars={bars} unit="steps" target={preferences.dailyStepTarget} labelEvery={period === 'week' ? 1 : 5}/></Card>

    <Card title="What your entries show">
      <ul className="insight-list">{insights.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.body}</p></li>)}</ul>
      <p className="muted small-print">These are observations from your own entries. They are not medical advice.</p>
    </Card>
  </div>;
}
