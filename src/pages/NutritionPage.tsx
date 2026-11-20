import { useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { useUndoRemove } from '../hooks/useUndoRemove';
import { useToast } from '../components/Toast';
import { Card, EmptyState, PageHeader } from '../components/PagePrimitives';
import WaterCard from '../components/WaterCard';
import BarChart from '../components/BarChart';
import { displayToKcal, formatDay, getMealDate, kcalToDisplay, lastDays, localDate, shiftDate, sumFor, waterToDisplayNumber } from '../lib/wellbeing';
import type { Meal } from '../lib/types';

const kinds = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function NutritionPage() {
  const location = useLocation();
  const today = useToday();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [meals, setMeals] = useStore('meals');
  const [water] = useStore('water');
  const [preferences] = useStore('preferences');
  const remove = useUndoRemove(meals, setMeals);
  const [day, setDay] = useState(today);
  const [showForm, setShowForm] = useState(Boolean((location.state as { add?: boolean } | null)?.add));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mealName, setMealName] = useState('');
  const [mealKind, setMealKind] = useState('Breakfast');
  const [energy, setEnergy] = useState('');
  const [note, setNote] = useState('');

  const energyLabel = preferences.energyUnit === 'kj' ? 'kJ' : 'kcal';
  const dayMeals = meals.filter(meal => getMealDate(meal) === day);
  const energyTotal = dayMeals.reduce((sum, meal) => sum + kcalToDisplay(meal.cal, preferences.energyUnit), 0);
  const isToday = day === today;
  const waterUnitLabel = preferences.waterUnit === 'oz' ? 'fl oz' : 'ml';
  const waterBars = useMemo(() => lastDays(7).map(({ key, date }) => ({
    key, label: date.toLocaleDateString(undefined, { weekday: 'short' }), fullLabel: date.toLocaleDateString(undefined, { weekday: 'long' }),
    value: waterToDisplayNumber(sumFor(water, key, item => item.ml), preferences.waterUnit), highlight: key === today,
  })), [water, preferences.waterUnit, today]);

  const moveDay = (amount: number) => setDay(current => {
    const next = localDate(shiftDate(new Date(current + 'T12:00:00'), amount));
    return next > today ? current : next;
  });
  function resetForm() { setEditingId(null); setMealName(''); setEnergy(''); setNote(''); setMealKind('Breakfast'); setShowForm(false); }
  function startEdit(meal: Meal) {
    setEditingId(meal.id); setMealName(meal.name); setMealKind(meal.kind); setNote(meal.desc);
    setEnergy(meal.cal ? String(kcalToDisplay(meal.cal, preferences.energyUnit)) : '');
    setShowForm(true);
    window.setTimeout(() => formRef.current?.scrollIntoView({ block: 'start' }), 0);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!mealName.trim()) return;
    // Energy is stored as kcal whatever unit is shown, so switching units later never skews old entries.
    const cal = energy.trim() ? Math.max(0, displayToKcal(Number(energy) || 0, preferences.energyUnit)) : 0;
    if (editingId) {
      setMeals(current => current.map(meal => meal.id === editingId ? { ...meal, name: mealName.trim(), kind: mealKind, cal, desc: note.trim() } : meal));
      toast.show('Food note updated');
    } else {
      setMeals(current => [...current, { id: Date.now(), name: mealName.trim(), kind: mealKind, date: day, desc: note.trim(), time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), cal }]);
      toast.show('Food note saved');
    }
    resetForm();
  }

  return <div className="stack">
    <PageHeader title="Food and water" desc="Note what you eat and drink. Energy estimates are optional." action={<button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => showForm ? resetForm() : setShowForm(true)}><Plus size={18} aria-hidden="true"/>Add a meal</button>}/>

    <div className="day-nav">
      <button type="button" className="icon-btn" aria-label="Previous day" onClick={() => moveDay(-1)}><ChevronLeft size={20}/></button>
      <div><b>{isToday ? 'Today' : formatDay(day, { weekday: 'long' })}</b><small>{formatDay(day, { day: 'numeric', month: 'long', year: 'numeric' })}</small></div>
      <button type="button" className="icon-btn" aria-label="Next day" onClick={() => moveDay(1)} disabled={isToday}><ChevronRight size={20}/></button>
      {!isToday && <button type="button" className="btn btn-secondary" onClick={() => setDay(today)}>Back to today</button>}
    </div>

    {showForm && <form ref={formRef} className="card form-card" onSubmit={save}>
      <div className="card-head"><h2>{editingId ? 'Edit food note' : 'Add a food note for ' + (isToday ? 'today' : formatDay(day, { day: 'numeric', month: 'short' }))}</h2></div>
      <div className="form-grid">
        <label className="field">What did you have?<input value={mealName} onChange={event => setMealName(event.target.value)} placeholder="Rice, vegetables and fish" required autoComplete="off"/></label>
        <label className="field">Meal<select value={mealKind} onChange={event => setMealKind(event.target.value)}>{kinds.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field">Energy in {energyLabel} (optional)<input type="number" inputMode="numeric" min="0" max="50000" value={energy} onChange={event => setEnergy(event.target.value)}/></label>
        <label className="field">Note (optional)<input value={note} onChange={event => setNote(event.target.value)} placeholder="Made at home" autoComplete="off"/></label>
      </div>
      <div className="btn-row"><button type="submit" className="btn btn-primary">{editingId ? 'Save changes' : 'Save food note'}</button><button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button></div>
    </form>}

    <div className="grid-2">
      <Card title={isToday ? "Today's food notes" : 'Food notes'}>
        {dayMeals.length === 0 ? <EmptyState title="No food notes" body={isToday ? 'Add a meal or snack when you want to keep a record.' : 'Nothing was noted on this day. You can add a note for it.'} action={<button type="button" className="btn btn-secondary" onClick={() => setShowForm(true)}>Add a note</button>}/> : <>
          {kinds.filter(kind => dayMeals.some(meal => meal.kind === kind)).map(kind => <div key={kind}>
            <h3 className="group-label">{kind}</h3>
            <ul className="rows">
              {dayMeals.filter(meal => meal.kind === kind).map(meal => <li className="row" key={meal.id}>
                <div className="row-main"><b>{meal.name}</b><small>{[meal.time, meal.desc].filter(Boolean).join(', ')}</small></div>
                {meal.cal > 0 && <div className="row-side"><b>{kcalToDisplay(meal.cal, preferences.energyUnit).toLocaleString()}</b><small>{energyLabel}</small></div>}
                <button type="button" className="icon-btn" aria-label={'Edit ' + meal.name} onClick={() => startEdit(meal)}><Pencil size={18}/></button>
                <button type="button" className="icon-btn" aria-label={'Remove ' + meal.name} onClick={() => remove(meal.id, meal.name)}><Trash2 size={18}/></button>
              </li>)}
            </ul>
          </div>)}
          {energyTotal > 0 && <p className="muted">Energy you chose to record: {energyTotal.toLocaleString()} {energyLabel}. There is no target.</p>}
        </>}
      </Card>
      <div className="stack">
        <WaterCard/>
        <Card title="Water, last 7 days"><BarChart bars={waterBars} unit={waterUnitLabel} target={waterToDisplayNumber(preferences.dailyWaterTargetMl, preferences.waterUnit)}/></Card>
      </div>
    </div>
  </div>;
}
