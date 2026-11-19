import type { ActivityRecord, Habit, Meal } from '../data/seed';

export type WaterEntry = { id: number; date: string; ml: number; time: string };
export type JournalEntry = { id: number; date: string; mood: string; note: string; createdAt: string };
export type RoutineCompletion = { id: number; date: string; routineId: number; title: string };
export type GoalCategory = 'steps' | 'activity_minutes' | 'water_ml' | 'routine_completions' | 'journal_entries';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly';
export type WellbeingGoal = { id: number; title: string; category: GoalCategory; target: number; period: GoalPeriod; createdAt: string };
export type ReminderKind = 'routine' | 'hydration' | 'reflection' | 'movement' | 'custom';
export type WellbeingReminder = { id: number; title: string; kind: ReminderKind; time: string; enabled: boolean; days: number[] };
export type Preferences = { distanceUnit: 'km' | 'mi'; energyUnit: 'kcal' | 'kj'; waterUnit: 'ml' | 'oz'; dailyWaterTargetMl: number; dailyStepTarget: number; weekStartsOn: 0 | 1 };

export const defaultPreferences: Preferences = {
  distanceUnit: 'km', energyUnit: 'kcal', waterUnit: 'ml', dailyWaterTargetMl: 2000, dailyStepTarget: 7000, weekStartsOn: 1,
};

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

export function startOfPeriod(date: Date, period: GoalPeriod, weekStartsOn: 0 | 1 = 1) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  if (period === 'daily') return start;
  if (period === 'weekly') {
    const day = (start.getDay() - weekStartsOn + 7) % 7;
    start.setDate(start.getDate() - day);
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

export function collectEvents(data: {
  activities: ActivityRecord[];
  meals: Meal[];
  water: WaterEntry[];
  journals: JournalEntry[];
  completions: RoutineCompletion[];
}) {
  const events: { id: string; date: string; type: 'activity' | 'meal' | 'water' | 'journal' | 'routine'; title: string; detail: string }[] = [];
  data.activities.forEach(item => events.push({ id: 'activity-' + item.id, date: item.date, type: 'activity', title: item.name, detail: item.minutes + ' min movement' }));
  data.meals.forEach(item => events.push({ id: 'meal-' + item.id, date: getMealDate(item), type: 'meal', title: item.name, detail: item.kind }));
  data.water.forEach(item => events.push({ id: 'water-' + item.id, date: item.date, type: 'water', title: 'Water check-in', detail: item.ml + ' ml' }));
  data.journals.forEach(item => events.push({ id: 'journal-' + item.id, date: item.date, type: 'journal', title: 'Journal reflection', detail: item.mood }));
  data.completions.forEach(item => events.push({ id: 'routine-' + item.id, date: item.date, type: 'routine', title: item.title, detail: 'Routine completed' }));
  return events.sort((a, b) => b.date.localeCompare(a.date));
}

export function getGoalValue(goal: WellbeingGoal, data: {
  activities: ActivityRecord[]; water: WaterEntry[]; journals: JournalEntry[]; completions: RoutineCompletion[];
}, now = new Date(), weekStartsOn: 0 | 1 = 1) {
  const start = startOfPeriod(now, goal.period, weekStartsOn);
  const startKey = localDate(start);
  const endKey = localDate(now);
  const activities = data.activities.filter(item => item.date >= startKey && item.date <= endKey);
  if (goal.category === 'steps') return activities.reduce((sum, item) => sum + item.steps, 0);
  if (goal.category === 'activity_minutes') return activities.reduce((sum, item) => sum + item.minutes, 0);
  if (goal.category === 'water_ml') return data.water.filter(item => item.date >= startKey && item.date <= endKey).reduce((sum, item) => sum + item.ml, 0);
  if (goal.category === 'routine_completions') return data.completions.filter(item => item.date >= startKey && item.date <= endKey).length;
  return data.journals.filter(item => item.date >= startKey && item.date <= endKey).length;
}

export function getRangeStats(period: 'week' | 'month', data: {
  activities: ActivityRecord[]; meals: Meal[]; water: WaterEntry[]; journals: JournalEntry[]; completions: RoutineCompletion[];
}, now = new Date()) {
  const { start, end } = getDateRange(period, now);
  const inRange = (key: string) => dateInRange(key, start, end);
  const activities = data.activities.filter(item => inRange(item.date));
  const meals = data.meals.filter(item => inRange(getMealDate(item)));
  const water = data.water.filter(item => inRange(item.date));
  const journals = data.journals.filter(item => inRange(item.date));
  const completions = data.completions.filter(item => inRange(item.date));
  const activeDays = new Set(activities.map(item => item.date)).size;
  const waterByDay = new Map<string, number>();
  water.forEach(item => waterByDay.set(item.date, (waterByDay.get(item.date) || 0) + item.ml));
  const moodValues: Record<string, number> = { Low: 1, 'Not great': 1, 'A little low': 2, Okay: 3, Good: 4, Great: 5, Anxious: 2 };
  const moods = journals.map(item => moodValues[item.mood] || 0).filter(Boolean);
  return {
    activities, meals, water, journals, completions, activeDays,
    steps: activities.reduce((sum, item) => sum + item.steps, 0),
    minutes: activities.reduce((sum, item) => sum + item.minutes, 0),
    waterMl: water.reduce((sum, item) => sum + item.ml, 0),
    mealCount: meals.length,
    routineCount: completions.length,
    moodAverage: moods.length ? moods.reduce((sum, item) => sum + item, 0) / moods.length : null,
    waterByDay,
  };
}

export function buildLocalInsights(stats: ReturnType<typeof getRangeStats>, period: 'week' | 'month') {
  const label = period === 'week' ? 'this week' : 'this month';
  const insights: { title: string; body: string; tone: 'sage' | 'clay' | 'sand' }[] = [];
  if (stats.activities.length) {
    insights.push({ title: 'Movement is adding up', body: `You logged ${stats.minutes} active minutes across ${stats.activeDays} ${stats.activeDays === 1 ? 'day' : 'days'} ${label}. Small sessions count, too.`, tone: 'sage' });
  }
  if (stats.water.length) {
    const days = new Set(stats.water.map(item => item.date)).size;
    insights.push({ title: 'Hydration check-in', body: `You recorded ${(stats.waterMl / 1000).toFixed(1)} litres of water over ${days} ${days === 1 ? 'day' : 'days'}. Look for a rhythm that fits your day.`, tone: 'clay' });
  }
  if (stats.moodAverage !== null) {
    insights.push({ title: 'Make room for reflection', body: `You checked in ${stats.journals.length} ${stats.journals.length === 1 ? 'time' : 'times'} ${label}. Your recorded mood average is ${stats.moodAverage.toFixed(1)} out of 5; it is a prompt for reflection, not a score.`, tone: 'sand' });
  }
  if (stats.routineCount) {
    insights.push({ title: 'Consistency, on your terms', body: `You completed ${stats.routineCount} routine ${stats.routineCount === 1 ? 'check-in' : 'check-ins'} ${label}. Notice which routines feel easiest to return to.`, tone: 'sage' });
  }
  if (stats.mealCount) {
    insights.push({ title: 'Nourishment notes', body: `You noted ${stats.mealCount} meals or snacks ${label}. Patterns become more useful as you log at a pace that feels sustainable.`, tone: 'clay' });
  }
  if (!insights.length) insights.push({ title: 'Your picture is still taking shape', body: 'As you add movement, meals, water and reflections, Ovara will be able to surface patterns from your own records here.', tone: 'sand' });
  return insights;
}

export type { ActivityRecord, Habit, Meal };
