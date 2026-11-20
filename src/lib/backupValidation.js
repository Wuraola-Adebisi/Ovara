const knownKeys = [
  'ovara.profile', 'ovara.habits', 'ovara.routineCompletions', 'ovara.waterLog',
  'ovara.activities', 'ovara.meals', 'ovara.journalEntries', 'ovara.goals',
  'ovara.preferences', 'ovara.reminders',
];
const arrayKeys = new Set(knownKeys.filter(key => key !== 'ovara.profile' && key !== 'ovara.preferences'));
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = value => typeof value === 'string';
const isNumber = value => typeof value === 'number' && Number.isFinite(value);
const isNonNegative = value => isNumber(value) && value >= 0;
const isPositive = value => isNumber(value) && value > 0;
const isDate = value => isText(value) && /^\\d{4}-\\d{2}-\\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + 'T12:00:00'));
const has = (value, fields) => isObject(value) && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
const every = (items, predicate) => Array.isArray(items) && items.every(predicate);

const validators = {
  'ovara.habits': item => has(item, ['id', 'title', 'detail', 'time']) && isNumber(item.id) && isText(item.title) && isText(item.detail) && isText(item.time),
  'ovara.routineCompletions': item => has(item, ['id', 'date', 'routineId', 'title']) && isNumber(item.id) && isDate(item.date) && isNumber(item.routineId) && isText(item.title),
  'ovara.waterLog': item => has(item, ['id', 'date', 'ml', 'time']) && isNumber(item.id) && isDate(item.date) && isPositive(item.ml) && isText(item.time),
  'ovara.activities': item => has(item, ['id', 'name', 'kind', 'minutes', 'steps', 'date']) && isNumber(item.id) && isText(item.name) && isText(item.kind) && isNonNegative(item.minutes) && isNonNegative(item.steps) && isDate(item.date) && (item.distanceKm === undefined || isNonNegative(item.distanceKm)),
  'ovara.meals': item => has(item, ['id', 'name', 'kind', 'time', 'cal', 'desc']) && isNumber(item.id) && isText(item.name) && isText(item.kind) && isText(item.time) && isNonNegative(item.cal) && isText(item.desc) && (item.date === undefined || isDate(item.date)),
  'ovara.journalEntries': item => has(item, ['id', 'date', 'mood', 'note', 'createdAt']) && isNumber(item.id) && isDate(item.date) && isText(item.mood) && isText(item.note) && isText(item.createdAt),
  'ovara.goals': item => has(item, ['id', 'title', 'category', 'target', 'period', 'createdAt']) && isNumber(item.id) && isText(item.title) && ['steps', 'activity_minutes', 'water_ml', 'routine_completions', 'journal_entries'].includes(item.category) && isPositive(item.target) && ['daily', 'weekly', 'monthly'].includes(item.period) && isText(item.createdAt),
  'ovara.reminders': item => has(item, ['id', 'title', 'kind', 'time', 'enabled', 'days']) && isNumber(item.id) && isText(item.title) && ['routine', 'hydration', 'reflection', 'movement', 'custom'].includes(item.kind) && isText(item.time) && /^\\d{2}:\\d{2}$/.test(item.time) && Number(item.time.slice(0, 2)) < 24 && Number(item.time.slice(3, 5)) < 60 && typeof item.enabled === 'boolean' && every(item.days, day => Number.isInteger(day) && day >= 0 && day <= 6) && item.days.length > 0,
};

function validateProfile(value) {
  return value === null || (has(value, ['name', 'email', 'goals', 'interests', 'createdAt']) && isText(value.name) && isText(value.email) && every(value.goals, isText) && every(value.interests, isText) && isText(value.createdAt));
}
function validatePreferences(value) {
  return has(value, ['distanceUnit', 'energyUnit', 'waterUnit', 'dailyWaterTargetMl', 'dailyStepTarget', 'weekStartsOn']) &&
    ['km', 'mi'].includes(value.distanceUnit) && ['kcal', 'kj'].includes(value.energyUnit) && ['ml', 'oz'].includes(value.waterUnit) &&
    isPositive(value.dailyWaterTargetMl) && isPositive(value.dailyStepTarget) && [0, 1].includes(value.weekStartsOn);
}

/** Validate and return only recognised Ovara data keys. */
export function validateOvaraData(parsed) {
  const data = parsed?.data;
  if (!isObject(data)) return { ok: false, error: 'That file does not look like an Ovara data download.' };
  const entries = Object.entries(data).filter(([key]) => knownKeys.includes(key) || key.startsWith('ovara.reminderSent.'));
  if (!entries.length) return { ok: false, error: 'That file has no Ovara data in it.' };
  for (const [key, value] of entries) {
    if (arrayKeys.has(key) && !every(value, validators[key])) {
      return { ok: false, error: 'The file contains an invalid ' + key.replace('ovara.', '').replace(/([A-Z])/g, ' $1').toLowerCase() + ' record.' };
    }
    if (key === 'ovara.profile' && !validateProfile(value)) return { ok: false, error: 'The profile information in this file is incomplete or damaged.' };
    if (key === 'ovara.preferences' && !validatePreferences(value)) return { ok: false, error: 'The preferences in this file are incomplete or damaged.' };
    if (key.startsWith('ovara.reminderSent.') && !isText(value)) return { ok: false, error: 'The reminder history in this file is damaged.' };
  }
  return { ok: true, entries };
}
