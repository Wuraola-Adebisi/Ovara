export type Habit = { id: number; title: string; detail: string; time: string; done: boolean };
export type Meal = { id: number; name: string; kind: string; time: string; cal: number; desc: string; date?: string };

export const habitsSeed: Habit[] = [
  { id: 1, title: 'Drink a glass of water', detail: 'Start the day hydrated', time: 'Morning', done: false },
  { id: 2, title: 'Take a mindful pause', detail: 'Give yourself a few quiet minutes', time: 'Anytime', done: false },
  { id: 3, title: 'Get some movement', detail: 'A walk, stretch or workout', time: 'Afternoon', done: false },
  { id: 4, title: 'Wind down for the evening', detail: 'Make space to rest', time: 'Evening', done: false },
];

export const mealsSeed: Meal[] = [
  { id: 1, name: 'Oatmeal with banana', kind: 'Breakfast', time: '8:15 AM', cal: 340, desc: 'Oats, banana and milk' },
  { id: 2, name: 'Rice bowl with vegetables', kind: 'Lunch', time: '1:10 PM', cal: 560, desc: 'Rice, vegetables and protein' },
  { id: 3, name: 'Apple and yoghurt', kind: 'Snack', time: '4:00 PM', cal: 180, desc: 'A simple afternoon snack' },
];

export type ActivityRecord = { id: number; name: string; kind: string; minutes: number; steps: number; date: string; distanceKm?: number };

function dateOffset(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export const activitySeed: ActivityRecord[] = [
  { id: 101, name: 'Morning walk', kind: 'Walking', minutes: 28, steps: 4200, date: dateOffset(-6) },
  { id: 102, name: 'Evening walk', kind: 'Walking', minutes: 32, steps: 5100, date: dateOffset(-5) },
  { id: 103, name: 'Stretch and mobility', kind: 'Stretching', minutes: 18, steps: 600, date: dateOffset(-4) },
  { id: 104, name: 'Neighbourhood walk', kind: 'Walking', minutes: 41, steps: 6300, date: dateOffset(-3) },
  { id: 105, name: 'Home workout', kind: 'Strength', minutes: 35, steps: 900, date: dateOffset(-2) },
  { id: 106, name: 'Afternoon walk', kind: 'Walking', minutes: 25, steps: 3800, date: dateOffset(-1) },
  { id: 107, name: 'Morning walk', kind: 'Walking', minutes: 31, steps: 6240, date: dateOffset(0) },
];
