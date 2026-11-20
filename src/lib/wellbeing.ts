import type {
  ActivityRecord, GoalCategory, GoalPeriod, JournalEntry, Meal, Preferences,
  RoutineCompletion, WaterEntry, WellbeingGoal,
} from './types';

export * from './types';

// ---------- Dates ----------

export function localDate(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function dateFromKey(key: string) {
  return new Date(key + 'T12:00:00');
}

export function shiftDate(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function formatDay(key: string, options: Intl.DateTimeFormatOptions) {
  return dateFromKey(key).toLocaleDateString(undefined, options);
}

/** The last `count` days ending today, oldest first. */
export function lastDays(count: number, now = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const date = shiftDate(now, index - (count - 1));
    return { key: localDate(date), date };
  });
}

export function startOfPeriod(date: Date, period: GoalPeriod, weekStartsOn: 0 | 1 = 1) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  if (period === 'daily') return start;
  if (period === 'weekly') {
    start.setDate(start.getDate() - ((start.getDay() - weekStartsOn + 7) % 7));
    return start;
  }
  start.setDate(1);
  return start;
}

export function getDateRange(period: 'week' | 'month', now = new Date()) {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (period === 'week') start.setDate(start.getDate() - 6);
  else start.setDate(1);
  return { start, end };
}

export function dateInRange(key: string, start: Date, end: Date) {
  const date = dateFromKey(key);
  return date >= start && date <= end;
}

export function getMealDate(meal: Meal) {
  return meal.date || localDate();
}

export function greetingFor(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// ---------- Units ----------

export const GLASS_ML = 250;
const ML_PER_OZ = 29.5735;
const KCAL_TO_KJ = 4.184;
const KM_PER_MILE = 1.60934;

export function formatWater(ml: number, unit: Preferences['waterUnit']) {
  if (unit === 'oz') return { value: (ml / ML_PER_OZ).toFixed(1).replace(/\.0$/, ''), unit: 'fl oz' };
  return { value: Math.round(ml).toLocaleString(), unit: 'ml' };
}

export function waterToMl(value: number, unit: Preferences['waterUnit']) {
  return unit === 'oz' ? Math.round(value * ML_PER_OZ) : Math.round(value);
}

/** Energy is always stored as kcal and converted for display. */
export function kcalToDisplay(kcal: number, unit: Preferences['energyUnit']) {
  return unit === 'kj' ? Math.round(kcal * KCAL_TO_KJ) : Math.round(kcal);
}

export function displayToKcal(value: number, unit: Preferences['energyUnit']) {
  return unit === 'kj' ? Math.round(value / KCAL_TO_KJ) : Math.round(value);
}

/** Distance is always stored as km and converted for display. */
export function kmToDisplay(km: number, unit: Preferences['distanceUnit']) {
  return unit === 'mi' ? km / KM_PER_MILE : km;
}

export function displayToKm(value: number, unit: Preferences['distanceUnit']) {
  return unit === 'mi' ? value * KM_PER_MILE : value;
}

// ---------- Mood ----------

// 'Anxious' is a feeling rather than a point on a low-to-high scale, so it has
// no score and is left out of averages. 'Low' is kept for older entries.
const moodScores: Record<string, number | null> = {
  Great: 5, Good: 4, Okay: 3, 'A little low': 2, 'Not great': 1, Low: 1, Anxious: null,
};

export function moodScore(label: string) {
  return moodScores[label] ?? null;
}

// ---------- Aggregates ----------

type Data = {
  activities: ActivityRecord[]; meals: Meal[]; water: WaterEntry[]; journals: JournalEntry[]; completions: RoutineCompletion[];
};

export function sumFor<T extends { date: string }>(items: T[], key: string, pick: (item: T) => number) {
  return items.filter(item => item.date === key).reduce((sum, item) => sum + pick(item), 0);
}

export function collectEvents(data: Data, preferences: Preferences) {
  const events: { id: string; date: string; type: 'activity' | 'meal' | 'water' | 'journal' | 'routine'; title: string; detail: string }[] = [];
  data.activities.forEach(item => events.push({ id: 'activity-' + item.id, date: item.date, type: 'activity', title: item.name, detail: item.minutes + ' min' }));
  data.meals.forEach(item => events.push({ id: 'meal-' + item.id, date: getMealDate(item), type: 'meal', title: item.name, detail: item.kind }));
  const waterByDay = new Map<string, number>();
  data.water.forEach(item => waterByDay.set(item.date, (waterByDay.get(item.date) || 0) + item.ml));
  waterByDay.forEach((ml, date) => {
    const { value, unit } = formatWater(ml, preferences.waterUnit);
    events.push({ id: 'water-' + date, date, type: 'water', title: 'Water', detail: value + ' ' + unit });
  });
  data.journals.forEach(item => events.push({ id: 'journal-' + item.id, date: item.date, type: 'journal', title: 'Journal', detail: item.mood }));
  data.completions.forEach(item => events.push({ id: 'routine-' + item.id, date: item.date, type: 'routine', title: item.title, detail: 'Routine done' }));
  return events.sort((a, b) => b.date.localeCompare(a.date));
}

export function getGoalValueForRange(goal: WellbeingGoal, data: Pick<Data, 'activities' | 'water' | 'journals' | 'completions'>, startKey: string, endKey: string) {
  const within = <T extends { date: string }>(items: T[]) => items.filter(item => item.date >= startKey && item.date <= endKey);
  const activities = within(data.activities);
  if (goal.category === 'steps') return activities.reduce((sum, item) => sum + item.steps, 0);
  if (goal.category === 'activity_minutes') return activities.reduce((sum, item) => sum + item.minutes, 0);
  if (goal.category === 'water_ml') return within(data.water).reduce((sum, item) => sum + item.ml, 0);
  if (goal.category === 'routine_completions') return within(data.completions).length;
  return within(data.journals).length;
}

export function getGoalValue(goal: WellbeingGoal, data: Pick<Data, 'activities' | 'water' | 'journals' | 'completions'>, now = new Date(), weekStartsOn: 0 | 1 = 1) {
  return getGoalValueForRange(goal, data, localDate(startOfPeriod(now, goal.period, weekStartsOn)), localDate(now));
}

function statsForRange(data: Data, start: Date, end: Date) {
  const inRange = (key: string) => dateInRange(key, start, end);
  const activities = data.activities.filter(item => inRange(item.date));
  const meals = data.meals.filter(item => inRange(getMealDate(item)));
  const water = data.water.filter(item => inRange(item.date));
  const journals = data.journals.filter(item => inRange(item.date));
  const completions = data.completions.filter(item => inRange(item.date));
  const moods = journals.map(item => moodScore(item.mood)).filter((score): score is number => score !== null);
  return {
    activities, meals, water, journals, completions,
    activeDays: new Set(activities.map(item => item.date)).size,
    waterDays: new Set(water.map(item => item.date)).size,
    steps: activities.reduce((sum, item) => sum + item.steps, 0),
    minutes: activities.reduce((sum, item) => sum + item.minutes, 0),
    waterMl: water.reduce((sum, item) => sum + item.ml, 0),
    mealCount: meals.length,
    routineCount: completions.length,
    moodAverage: moods.length ? moods.reduce((sum, score) => sum + score, 0) / moods.length : null,
  };
}

export function getRangeStats(period: 'week' | 'month', data: Data, now = new Date()) {
  const { start, end } = getDateRange(period, now);
  return statsForRange(data, start, end);
}

/** Compare the current period with the immediately preceding period of equal elapsed length. */
export function getPreviousRangeStats(period: 'week' | 'month', data: Data, now = new Date()) {
  const current = getDateRange(period, now);
  const duration = Math.floor((current.end.getTime() - current.start.getTime()) / 86400000) + 1;
  const end = new Date(current.start);
  end.setDate(end.getDate() - 1);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - duration + 1);
  start.setHours(0, 0, 0, 0);
  return statsForRange(data, start, end);
}

export type RangeStats = ReturnType<typeof getRangeStats>;
export type InsightCard = { title: string; body: string };

export function buildLocalInsights(stats: RangeStats, period: 'week' | 'month', preferences: Preferences): InsightCard[] {
  const label = period === 'week' ? 'in the last 7 days' : 'this month';
  const plural = (count: number, one: string, many: string) => count === 1 ? one : many;
  const insights: InsightCard[] = [];
  if (stats.activities.length) {
    const byDay = new Map<string, number>();
    stats.activities.forEach(item => byDay.set(item.date, (byDay.get(item.date) || 0) + item.minutes));
    const [bestDay, bestMinutes] = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];
    insights.push({
      title: 'Movement',
      body: `You logged ${stats.minutes} active minutes on ${stats.activeDays} ${plural(stats.activeDays, 'day', 'days')} ${label}. Your longest day was ${formatDay(bestDay, { weekday: 'long' })}, with ${bestMinutes} minutes.`,
    });
  }
  if (stats.water.length) {
    const { value, unit } = formatWater(stats.waterMl, preferences.waterUnit);
    insights.push({ title: 'Water', body: `You recorded ${value} ${unit} across ${stats.waterDays} ${plural(stats.waterDays, 'day', 'days')} ${label}.` });
  }
  if (stats.moodAverage !== null) {
    insights.push({
      title: 'Mood',
      body: `You checked in ${stats.journals.length} ${plural(stats.journals.length, 'time', 'times')} ${label}. The average of your scored moods is ${stats.moodAverage.toFixed(1)} out of 5. Treat it as a prompt to reflect, not a grade.`,
    });
  }
  if (stats.routineCount) {
    insights.push({ title: 'Routines', body: `You completed ${stats.routineCount} routine ${plural(stats.routineCount, 'check-in', 'check-ins')} ${label}.` });
  }
  if (stats.mealCount) {
    insights.push({ title: 'Food notes', body: `You noted ${stats.mealCount} ${plural(stats.mealCount, 'meal or snack', 'meals and snacks')} ${label}.` });
  }
  if (!insights.length) {
    insights.push({ title: 'Nothing to show yet', body: 'Log some movement, water, food or a mood check-in and your patterns will show up here. Everything is calculated on this device from your own entries.' });
  }
  return insights;
}

export type { GoalCategory };
