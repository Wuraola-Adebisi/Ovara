export type Habit = { id: number; title: string; detail: string; time: string; done: boolean };
export type Meal = { id: number; name: string; kind: string; time: string; cal: number; desc: string };

export const habitsSeed: Habit[] = [
  { id: 1, title: 'Drink a glass of water', detail: 'Start the day hydrated', time: 'Morning', done: true },
  { id: 2, title: 'Take a mindful pause', detail: 'Give yourself a few quiet minutes', time: 'Anytime', done: false },
  { id: 3, title: 'Get some movement', detail: 'A walk, stretch or workout', time: 'Afternoon', done: false },
  { id: 4, title: 'Wind down for the evening', detail: 'Make space to rest', time: 'Evening', done: false },
];

export const mealsSeed: Meal[] = [
  { id: 1, name: 'Oatmeal with banana', kind: 'Breakfast', time: '8:15 AM', cal: 340, desc: 'Oats, banana and milk' },
  { id: 2, name: 'Rice bowl with vegetables', kind: 'Lunch', time: '1:10 PM', cal: 560, desc: 'Rice, vegetables and protein' },
  { id: 3, name: 'Apple and yoghurt', kind: 'Snack', time: '4:00 PM', cal: 180, desc: 'A simple afternoon snack' },
];
