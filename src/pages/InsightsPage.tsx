import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { Card, PageHeader } from '../components/PagePrimitives';
import BarChart from '../components/BarChart';
import { MOODS } from '../components/MoodPicker';
import { deltaText, formatWater, getPreviousStats, getRangeStats, lastDays, localDate, minutesByKind, sumFor, waterToDisplayNumber } from '../lib/wellbeing';
import { getPersonalisedInsights } from '../services/insightsService';

type Metric = 'steps' | 'minutes' | 'water';

export default function InsightsPage() {
  const today = useToday();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [metric, setMetric] = useState<Metric>('steps');
  const [activities] = useStore('activities');
  const [meals] = useStore('meals');
  const [water] = useStore('water');
  const [journals] = useStore('journals');
  const [completions] = useStore('completions');
  const [habits] = useStore('habits');
  const [preferences] = useStore('preferences');

  const data = useMemo(() => ({ activities, meals, water, journals, completions }), [activities, meals, water, journals, completions]);
  const stats = useMemo(() => getRangeStats(period, data), [period, data, today]);
  const previous = useMemo(() => getPreviousStats(period, data), [period, data, today]);
  const insights = useMemo(() => getPersonalisedInsights(stats, period, preferences), [stats, period, preferences]);
  const waterTotal = formatWater(stats.waterMl, preferences.waterUnit);
  const kinds = minutesByKind(stats.activities);
  const maxKind = Math.max(1, ...kinds.map(item => item[1]));
  const waterUnit = preferences.waterUnit === 'oz' ? 'fl oz' : 'ml';
  const periodName = period === 'week' ? 'the previous 7 days' : 'last month';

  const now = new Date();
  const days = period === 'week' ? lastDays(7) : Array.from({ length: now.getDate() }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
    return { key: localDate(date), date };
  });
  const bars = days.map(({ key, date }) => ({
    key,
    label: period === 'week' ? date.toLocaleDateString(undefined, { weekday: 'short' }) : String(date.getDate()),
    fullLabel: date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }),
    value: metric === 'steps' ? sumFor(activities, key, item => item.steps)
      : metric === 'minutes' ? sumFor(activities, key, item => item.minutes)
      : waterToDisplayNumber(sumFor(water, key, item => item.ml), preferences.waterUnit),
    highlight: key === today,
  }));
  const chartTarget = metric === 'steps' ? preferences.dailyStepTarget : metric === 'water' ? waterToDisplayNumber(preferences.dailyWaterTargetMl, preferences.waterUnit) : undefined;
  const chartUnit = metric === 'steps' ? 'steps' : metric === 'minutes' ? 'min' : waterUnit;

  const eligibleRoutineDays = habits.length * days.length;
  const routineRate = eligibleRoutineDays ? Math.round(stats.completions.length / eligibleRoutineDays * 100) : null;
  const moodByDay = days.map(({ key, date }) => ({ key, date, mood: journals.find(entry => entry.date === key)?.mood ?? '' }));
  const MoodIcon = (label: string) => MOODS.find(item => item.label === label)?.icon;

  return <div className="stack">
    <PageHeader title="Insights" desc="Patterns in what you have logged. Calculated on this device." action={<div className="segmented" role="group" aria-label="Time range">
      <button type="button" aria-pressed={period === 'week'} onClick={() => setPeriod('week')}>7 days</button>
      <button type="button" aria-pressed={period === 'month'} onClick={() => setPeriod('month')}>This month</button>
    </div>}/>

    <Card>
      <dl className="stat-strip four">
        <div><dt>Active minutes</dt><dd>{stats.minutes.toLocaleString()}</dd><small className="stat-note">{deltaText(stats.minutes, previous.minutes, 'min')}</small></div>
        <div><dt>Steps</dt><dd>{stats.steps.toLocaleString()}</dd><small className="stat-note">{deltaText(stats.steps, previous.steps, '')}</small></div>
        <div><dt>Water</dt><dd>{waterTotal.value}<small> {waterTotal.unit}</small></dd><small className="stat-note">{stats.waterDays} {stats.waterDays === 1 ? 'day' : 'days'} recorded</small></div>
        <div><dt>Routine check-ins</dt><dd>{stats.routineCount}</dd><small className="stat-note">{routineRate === null ? '' : routineRate + '% of possible check-ins'}</small></div>
      </dl>
      <p className="muted small-print">Comparisons are against {periodName}.</p>
    </Card>

    <Card title="Day by day" action={<div className="segmented" role="group" aria-label="Measure">
      <button type="button" aria-pressed={metric === 'steps'} onClick={() => setMetric('steps')}>Steps</button>
      <button type="button" aria-pressed={metric === 'minutes'} onClick={() => setMetric('minutes')}>Minutes</button>
      <button type="button" aria-pressed={metric === 'water'} onClick={() => setMetric('water')}>Water</button>
    </div>}><BarChart bars={bars} unit={chartUnit} target={chartTarget} labelEvery={period === 'week' ? 1 : 5}/></Card>

    <div className="grid-2">
      <Card title="Minutes by type">
        {kinds.length === 0 ? <p className="muted">No activity in this period.</p> : <ul className="hbars">
          {kinds.map(([type, total]) => <li key={type}><span>{type}</span><div className="meter" role="img" aria-label={type + ': ' + total + ' minutes'}><i style={{ width: (total / maxKind * 100) + '%' }}/></div><b>{total} min</b></li>)}
        </ul>}
      </Card>
      <Card title="Mood by day">
        {stats.journals.length === 0 ? <p className="muted">No mood check-ins in this period.</p> : <ol className="mood-strip">
          {moodByDay.map(({ key, date, mood }) => { const Icon = MoodIcon(mood); return <li key={key} title={mood || 'No entry'}>
            <span>{period === 'week' ? date.toLocaleDateString(undefined, { weekday: 'narrow' }) : date.getDate()}</span>
            {Icon ? <Icon size={20} aria-label={mood}/> : <i aria-label="No entry">&middot;</i>}
          </li>; })}
        </ol>}
        <p className="muted small-print">Each icon is the mood you picked that day.</p>
      </Card>
    </div>

    <Card title="What your entries show">
      <ul className="insight-list">{insights.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.body}</p></li>)}</ul>
      <p className="muted small-print">These are observations from your own entries. They are not medical advice.</p>
    </Card>
  </div>;
}
