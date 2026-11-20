import type { WellbeingGoal, ActivityRecord, WaterEntry, RoutineCompletion, JournalEntry } from './types';
type GoalData = { activities: ActivityRecord[]; water: WaterEntry[]; completions: RoutineCompletion[]; journals: JournalEntry[] };
export function getGoalValueForRange(goal: WellbeingGoal, data: GoalData, startKey: string, endKey: string): number;
