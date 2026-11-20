import type { Habit } from '../lib/types';

export type { ActivityRecord, Habit, Meal } from '../lib/types';

export const habitsSeed: Habit[] = [
  { id: 1, title: 'Drink a glass of water', detail: 'Start the day hydrated', time: 'Morning' },
  { id: 2, title: 'Take a mindful pause', detail: 'A few quiet minutes', time: 'Anytime' },
  { id: 3, title: 'Get some movement', detail: 'A walk, stretch or workout', time: 'Afternoon' },
  { id: 4, title: 'Wind down for the evening', detail: 'Make space to rest', time: 'Evening' },
];
