import { usePersistentState } from '../hooks/usePersistentState';
import { habitsSeed } from '../data/seed';
import type {
  ActivityRecord, Habit, JournalEntry, Meal, Preferences, RoutineCompletion,
  UserProfile, WaterEntry, WellbeingGoal, WellbeingReminder,
} from './types';

export const defaultPreferences: Preferences = {
  distanceUnit: 'km', energyUnit: 'kcal', waterUnit: 'ml',
  dailyWaterTargetMl: 2000, dailyStepTarget: 7000, weekStartsOn: 1,
};

export const starterReminders: WellbeingReminder[] = [
  { id: 1, title: 'Time for a glass of water', kind: 'hydration', time: '10:00', enabled: false, days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 2, title: 'Take a mindful pause', kind: 'routine', time: '14:00', enabled: false, days: [1, 2, 3, 4, 5] },
  { id: 3, title: 'Check in with yourself', kind: 'reflection', time: '20:00', enabled: false, days: [0, 1, 2, 3, 4, 5, 6] },
];

// One place for every storage key and its default. Before this, each screen
// declared its own default, and a screen with a different one could overwrite
// the stored value on first visit.
export const stores = {
  profile: { key: 'ovara.profile', initial: null as UserProfile | null },
  habits: { key: 'ovara.habits', initial: habitsSeed as Habit[] },
  completions: { key: 'ovara.routineCompletions', initial: [] as RoutineCompletion[] },
  water: { key: 'ovara.waterLog', initial: [] as WaterEntry[] },
  activities: { key: 'ovara.activities', initial: [] as ActivityRecord[] },
  meals: { key: 'ovara.meals', initial: [] as Meal[] },
  journals: { key: 'ovara.journalEntries', initial: [] as JournalEntry[] },
  goals: { key: 'ovara.goals', initial: [] as WellbeingGoal[] },
  preferences: { key: 'ovara.preferences', initial: defaultPreferences },
  reminders: { key: 'ovara.reminders', initial: starterReminders },
} as const;

export type StoreName = keyof typeof stores;

export function useStore<K extends StoreName>(name: K) {
  const { key, initial } = stores[name];
  return usePersistentState<(typeof stores)[K]['initial']>(key, initial);
}


export function exportAllData() {
  const data: Record<string, unknown> = {};
  Object.keys(window.localStorage).filter(key => key.startsWith('ovara.')).forEach(key => {
    try { data[key] = JSON.parse(window.localStorage.getItem(key) || 'null'); } catch { /* skip unreadable keys */ }
  });
  return JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2);
}

export function resetAllData() {
  Object.keys(window.localStorage).filter(key => key.startsWith('ovara.')).forEach(key => window.localStorage.removeItem(key));
}

const knownKeys = new Set(Object.values(stores).map(store => store.key));

/** Validates a downloaded file. With apply set to true it also replaces the saved data. */
export function importAllData(text: string, apply: boolean): { ok: true; keys: number } | { ok: false; error: string } {
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { return { ok: false, error: 'That file is not valid JSON, so it cannot be an Ovara data file.' }; }
  const data = (parsed as { data?: Record<string, unknown> } | null)?.data;
  if (!data || typeof data !== 'object') return { ok: false, error: 'That file does not look like an Ovara data download.' };
  const entries = Object.entries(data).filter(([key]) => knownKeys.has(key as never) || key.startsWith('ovara.reminderSent.'));
  if (entries.length === 0) return { ok: false, error: 'That file has no Ovara data in it.' };
  const arrayKeys = new Set(Object.values(stores).filter(store => Array.isArray(store.initial)).map(store => store.key));
  for (const [key, value] of entries) {
    if (arrayKeys.has(key as never) && !Array.isArray(value)) return { ok: false, error: 'The file has damaged data for ' + key.replace('ovara.', '') + '.' };
  }
  if (apply) {
    resetAllData();
    entries.forEach(([key, value]) => window.localStorage.setItem(key, JSON.stringify(value)));
  }
  return { ok: true, keys: entries.length };
}
