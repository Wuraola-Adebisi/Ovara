import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { Card, EmptyState, PageFeature, PageHeader } from '../components/PagePrimitives';
import BarChart from '../components/BarChart';
import { formatWater, getPreviousRangeStats, getRangeStats, localDate, lastDays, sumFor } from '../lib/wellbeing';
import { getPersonalisedInsights } from '../services/insightsService';

type Metric = { label: string; current: number; previous: number; format?: (value: number) => string };

function changeLabel(current: number, previous: number) {
  if (previous === 0 && current === 0) return 'No change';
  if (previous === 0) return 'New this period';
  const difference = current - previous;
  const percentage = Math.round(Math.abs(difference) / previous * 100);
  return difference === 0 ? 'No change' : (difference > 0 ? '+' : '−') + percentage + '% vs previous';
}

function MetricComparison({ metric }: { metric: Metric }) {
  const delta = metric.current - metric.previous;
  const change = changeLabel(metric.current, metric.previous);
  return <div className="comparison-metric">
    <span>{metric.label}</span>
    <strong>{metric.format ? metric.format(metric.current) : metric.current.toLocaleString()}</strong>
    <small>{change}</small>
    <div className="comparison-track" aria-label={metric.label + ': current ' + metric.current + ', previous ' + metric.previous}>
      <span style={{ width: Math.min(100, metric.current / Math.max(metric.current, metric.previous, 1) * 100) + '%' }}/>
    </div>
    <small className="comparison-previous">Previous: {metric.format ? metric.format(metric.previous) : metric.previous.toLocaleString()}{delta === 0 ? '' : delta > 0 ? ' · up' : ' · down'}</small>
  </div>;
}

export default function InsightsPage() {
  const today = useToday();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [activities] = useStore('activities');
  const [meals] = useStore('meals');
  const [water] = useStore('water');
  const [journals] = useStore('journals');
  const [completions] = useStore('completions');
  const [preferences] = useStore('preferences');
  const data = useMemo(() => ({ activities, meals, water, journals, completions }), [activities, meals, water, journals, completions]);
  const now = useMemo(() => new Date(today + 'T12:00:00'), [today]);
  const stats = useMemo(() => getRangeStats(period, data, now), [period, data, now]);
  const previous = useMemo(() => getPreviousRangeStats(period, data, now), [period, data, now]);
  const insights = useMemo(() => getPersonalisedInsights(stats, period, preferences), [stats, period, preferences]);
  const waterTotal = formatWater(stats.waterMl, preferences.waterUnit);
  const previousWater = formatWater(previous.waterMl, preferences.waterUnit);
  const hasRecords = stats.activities.length + stats.meals.length + stats.water.length + stats.journals.length + stats.completions.length > 0;

  const days = period === 'week' ? lastDays(7, now) : Array.from({ length: now.getDate() }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
    return { key: localDate(date), date };
  });
  const bars = days.map(({ key, date }) => ({
    key,
    label: period === 'week' ? date.toLocaleDateString(undefined, { weekday: 'short' }) : String(date.getDate()),
    fullLabel: date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }),
    value: sumFor(activities, key, item => item.steps), highlight: key === today,
  }));
  const metrics: Metric[] = [
    { label: 'Active minutes', current: stats.minutes, previous: previous.minutes },
    { label: 'Steps', current: stats.steps, previous: previous.steps },
    { label: 'Water', current: stats.waterMl, previous: previous.waterMl, format: value => formatWater(value, preferences.waterUnit).value + ' ' + formatWater(value, preferences.waterUnit).unit },
    { label: 'Routine check-ins', current: stats.routineCount, previous: previous.routineCount },
    { label: 'Food notes', current: stats.mealCount, previous: previous.mealCount },
    { label: 'Journal entries', current: stats.journals.length, previous: previous.journals.length },
  ];
  const rangeLabel = period === 'week' ? 'Last 7 days' : 'Month to date';
  const previousLabel = period === 'week' ? 'previous 7 days' : 'same number of days in the previous month';

  return <div className="stack">
    <PageHeader title="Insights" desc="Understand how your logged activity changes over time." action={<div className="segmented" role="group" aria-label="Time range">
      <button type="button" aria-pressed={period === 'week'} onClick={() => setPeriod('week')}>7 days</button>
      <button type="button" aria-pressed={period === 'month'} onClick={() => setPeriod('month')}>This month</button>
    </div>}/>
    <PageFeature eyebrow="Look for patterns, not perfection" text="Compare periods, review the details behind your totals and use your own records to decide what deserves your attention." image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85" imageAlt="A wide open landscape beneath a soft morning sky" />

    {!hasRecords ? <Card><EmptyState title="Your insights will build as you log" body="Record movement, water, meals, routines or a journal check-in. Once you have entries, this page will show how your activity is changing over time."/></Card> : <>
      <Card title={rangeLabel + ' compared'} action={<span className="muted small-print">Compared with {previousLabel}</span>}>
        <div className="comparison-grid">{metrics.map(metric => <MetricComparison key={metric.label} metric={metric}/>)}</div>
      </Card>
      <Card title="Steps per day"><BarChart bars={bars} unit="steps" target={preferences.dailyStepTarget} labelEvery={period === 'week' ? 1 : 5}/></Card>
      <Card title="Your activity at a glance">
        <dl className="stat-strip four">
          <div><dt>Active days</dt><dd>{stats.activeDays}<small> / {days.length}</small></dd></div>
          <div><dt>Water days</dt><dd>{stats.waterDays}<small> / {days.length}</small></dd></div>
          <div><dt>Water total</dt><dd>{waterTotal.value}<small> {waterTotal.unit}</small></dd></div>
          <div><dt>Average mood</dt><dd>{stats.moodAverage === null ? '—' : stats.moodAverage.toFixed(1)}<small>{stats.moodAverage === null ? ' not enough entries' : ' / 5'}</small></dd></div>
        </dl>
        {stats.waterMl > 0 && previous.waterMl > 0 && <p className="muted small-print">Water logged previously: {previousWater.value} {previousWater.unit}. These totals reflect entries you recorded, not necessarily everything you consumed.</p>}
      </Card>
      <Card title="What your entries show">
        <ul className="insight-list">{insights.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.body}</p></li>)}</ul>
        <p className="muted small-print">These are observations from your own entries. A difference between periods does not establish why a pattern changed.</p>
      </Card>
    </>}
  </div>;
}
