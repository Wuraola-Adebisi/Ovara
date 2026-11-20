import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOvaraData } from '../src/lib/backupValidation.js';
import { getGoalValueForRange } from '../src/lib/goalProgress.js';

const validBackup = () => ({
  exportedAt: '2026-11-20T10:00:00.000Z',
  data: {
    'ovara.profile': { name: 'Alex', email: '', goals: [], interests: [], createdAt: '2026-11-01T10:00:00.000Z' },
    'ovara.habits': [{ id: 1, title: 'Walk', detail: 'A short walk', time: '08:00' }],
    'ovara.routineCompletions': [{ id: 1, date: '2026-11-20', routineId: 1, title: 'Stretch' }],
    'ovara.waterLog': [{ id: 1, date: '2026-11-20', ml: 250, time: '09:00' }],
    'ovara.activities': [{ id: 1, name: 'Walk', kind: 'Walking', minutes: 20, steps: 2000, date: '2026-11-20' }],
    'ovara.meals': [{ id: 1, name: 'Breakfast', kind: 'Meal', time: '08:00', cal: 0, desc: '', date: '2026-11-20' }],
    'ovara.journalEntries': [{ id: 1, date: '2026-11-20', mood: 'Good', note: 'A good day', createdAt: '2026-11-20T09:00:00.000Z' }],
    'ovara.goals': [{ id: 1, title: 'Walk more', category: 'steps', target: 5000, period: 'daily', createdAt: '2026-11-01T10:00:00.000Z' }],
    'ovara.preferences': { distanceUnit: 'km', energyUnit: 'kcal', waterUnit: 'ml', dailyWaterTargetMl: 2000, dailyStepTarget: 7000, weekStartsOn: 1 },
    'ovara.reminders': [{ id: 1, title: 'Drink water', kind: 'hydration', time: '10:00', enabled: true, days: [0, 1, 2, 3, 4, 5, 6] }],
    'ovara.reminderSent.1': 'Fri Nov 20 2026',
  },
});

test('accepts a complete Ovara data download', () => {
  const result = validateOvaraData(validBackup());
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.entries.length, 11);
});

test('rejects malformed JSON payload structures', () => {
  assert.equal(validateOvaraData(null).ok, false);
  assert.equal(validateOvaraData({ data: [] }).ok, false);
  assert.equal(validateOvaraData({ data: { unrelated: true } }).ok, false);
});

test('rejects damaged records before they can be restored', () => {
  const backup = validBackup();
  backup.data['ovara.activities'][0].minutes = -4;
  const result = validateOvaraData(backup);
  assert.equal(result.ok, false);
});

test('rejects invalid preferences and reminder schedules', () => {
  const preferences = validBackup();
  preferences.data['ovara.preferences'].waterUnit = 'gallons';
  assert.equal(validateOvaraData(preferences).ok, false);

  const reminders = validBackup();
  reminders.data['ovara.reminders'][0].time = '29:80';
  assert.equal(validateOvaraData(reminders).ok, false);
});

test('sums each goal category over an inclusive date range', () => {
  const data = {
    activities: [
      { date: '2026-11-19', steps: 1000, minutes: 15 },
      { date: '2026-11-20', steps: 2500, minutes: 30 },
      { date: '2026-11-21', steps: 9000, minutes: 60 },
    ],
    water: [{ date: '2026-11-20', ml: 750 }, { date: '2026-11-21', ml: 500 }],
    completions: [{ date: '2026-11-19' }, { date: '2026-11-20' }, { date: '2026-11-21' }],
    journals: [{ date: '2026-11-20' }, { date: '2026-11-21' }],
  };
  const range = ['2026-11-19', '2026-11-20'];
  assert.equal(getGoalValueForRange({ category: 'steps' }, data, ...range), 3500);
  assert.equal(getGoalValueForRange({ category: 'activity_minutes' }, data, ...range), 45);
  assert.equal(getGoalValueForRange({ category: 'water_ml' }, data, ...range), 750);
  assert.equal(getGoalValueForRange({ category: 'routine_completions' }, data, ...range), 2);
  assert.equal(getGoalValueForRange({ category: 'journal_entries' }, data, ...range), 1);
});
