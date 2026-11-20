/** Calculate a goal's total over an inclusive YYYY-MM-DD date range. */
export function getGoalValueForRange(goal, data, startKey, endKey) {
  const within = items => items.filter(item => item.date >= startKey && item.date <= endKey);
  const activities = within(data.activities);
  if (goal.category === 'steps') return activities.reduce((sum, item) => sum + item.steps, 0);
  if (goal.category === 'activity_minutes') return activities.reduce((sum, item) => sum + item.minutes, 0);
  if (goal.category === 'water_ml') return within(data.water).reduce((sum, item) => sum + item.ml, 0);
  if (goal.category === 'routine_completions') return within(data.completions).length;
  if (goal.category === 'journal_entries') return within(data.journals).length;
  return 0;
}
