export type UserProfile = {
  name: string;
  email: string;
  goals: string[];
  interests: string[];
  createdAt: string;
};

export type Habit = { id: number; title: string; detail: string; time: string };
export type Meal = { id: number; name: string; kind: string; time: string; cal: number; desc: string; date?: string };
export type ActivityRecord = { id: number; name: string; kind: string; minutes: number; steps: number; date: string; distanceKm?: number };
export type WaterEntry = { id: number; date: string; ml: number; time: string };
export type JournalEntry = { id: number; date: string; mood: string; note: string; createdAt: string };
export type RoutineCompletion = { id: number; date: string; routineId: number; title: string };

export type GoalCategory = 'steps' | 'activity_minutes' | 'water_ml' | 'routine_completions' | 'journal_entries';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly';
export type WellbeingGoal = { id: number; title: string; category: GoalCategory; target: number; period: GoalPeriod; createdAt: string };

export type ReminderKind = 'routine' | 'hydration' | 'reflection' | 'movement' | 'custom';
export type WellbeingReminder = { id: number; title: string; kind: ReminderKind; time: string; enabled: boolean; days: number[] };

export type Preferences = {
  distanceUnit: 'km' | 'mi';
  energyUnit: 'kcal' | 'kj';
  waterUnit: 'ml' | 'oz';
  dailyWaterTargetMl: number;
  dailyStepTarget: number;
  weekStartsOn: 0 | 1;
};
