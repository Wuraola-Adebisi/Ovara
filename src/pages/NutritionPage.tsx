import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { useUndoRemove } from '../hooks/useUndoRemove';
import { useToast } from '../components/Toast';
import { Card, EmptyState, PageFeature, PageHeader } from '../components/PagePrimitives';
import WaterCard from '../components/WaterCard';
import { displayToKcal, formatDay, getMealDate, kcalToDisplay, lastDays } from '../lib/wellbeing';
import type { Meal } from '../lib/types';

const kinds = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function currentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function NutritionPage() {
  const location = useLocation();
  const today = useToday();
  const toast = useToast();
  const [meals, setMeals] = useStore('meals');
  const [preferences] = useStore('preferences');
  const remove = useUndoRemove(meals, setMeals);
  const [showForm, setShowForm] = useState(Boolean((location.state as { add?: boolean } | null)?.add));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [mealName, setMealName] = useState('');
  const [mealKind, setMealKind] = useState('Breakfast');
  const [energy, setEnergy] = useState('');
  const [mealTime, setMealTime] = useState(currentTime());
  const [description, setDescription] = useState('');

  const selectedMeals = useMemo(
    () => meals.filter(meal => getMealDate(meal) === selectedDate).sort((a, b) => b.id - a.id),
    [meals, selectedDate],
  );
  const week = useMemo(() => lastDays(7).map(({ key, date }) => ({
    key,
    label: date.toLocaleDateString(undefined, { weekday: 'short' }),
    count: meals.filter(meal => getMealDate(meal) === key).length,
    energy: meals.filter(meal => getMealDate(meal) === key).reduce((sum, meal) => sum + (meal.cal || 0), 0),
  })), [meals]);
  const weekMealCount = week.reduce((sum, day) => sum + day.count, 0);
  const weekEnergy = week.reduce((sum, day) => sum + day.energy, 0);
  const energyTotal = selectedMeals.reduce((sum, meal) => sum + kcalToDisplay(meal.cal || 0, preferences.energyUnit), 0);

  function resetForm() {
    setMealName(''); setMealKind('Breakfast'); setEnergy(''); setMealTime(currentTime());
    setDescription(''); setEditingId(null); setShowForm(false);
  }

  function startEdit(meal: Meal) {
    setEditingId(meal.id);
    setSelectedDate(getMealDate(meal));
    setMealName(meal.name);
    setMealKind(meal.kind);
    setEnergy(meal.cal ? String(kcalToDisplay(meal.cal, preferences.energyUnit)) : '');
    setMealTime(meal.time || currentTime());
    setDescription(meal.desc || '');
    setShowForm(true);
  }

  function saveMeal(event: FormEvent) {
    event.preventDefault();
    if (!mealName.trim()) return;
    const record: Meal = {
      id: editingId ?? Date.now(),
      name: mealName.trim(),
      kind: mealKind,
      date: selectedDate,
      time: mealTime,
      desc: description.trim(),
      // Store energy in kcal so changing display units never alters saved records.
      cal: energy.trim() ? Math.max(0, displayToKcal(Number(energy) || 0, preferences.energyUnit)) : 0,
    };
    setMeals(current => editingId === null
      ? [...current, record]
      : current.map(meal => meal.id === editingId ? record : meal));
    toast.show(editingId === null ? 'Food note saved' : 'Food note updated');
    resetForm();
  }

  function changeDate(amount: number) {
    const date = new Date(selectedDate + 'T12:00:00');
    date.setDate(date.getDate() + amount);
    const next = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    setSelectedDate(next);
  }

  return <div className="stack">
    <PageHeader title="Food and water" desc="Keep a flexible record of meals and hydration." action={<button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => { if (showForm) resetForm(); else { setSelectedDate(today); setShowForm(true); } }}><Plus size={18} aria-hidden="true"/>Add a meal</button>}/>
    <PageFeature eyebrow="Nourishment without the scorekeeping" text="Food is more than a number. Keep simple notes about meals, notice what helps you feel cared for and make hydration part of your day in a way that works for you." image="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85" imageAlt="A colourful spread of fresh vegetables, grains and nourishing foods" />

    {showForm && <form className="card form-card" onSubmit={saveMeal}>
      <div className="card-head"><h2>{editingId === null ? 'Add a food note' : 'Edit food note'} </h2><button type="button" className="icon-btn" aria-label="Close form" onClick={resetForm}><X size={18}/></button></div>
      <div className="form-grid">
        <label className="field">What did you have?<input value={mealName} onChange={event => setMealName(event.target.value)} placeholder="Rice, vegetables and fish" required autoComplete="off"/></label>
        <label className="field">Meal<select value={mealKind} onChange={event => setMealKind(event.target.value)}>{kinds.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field">Date<input type="date" value={selectedDate} max={today} onChange={event => setSelectedDate(event.target.value)} required/></label>
        <label className="field">Time<input type="time" value={mealTime} onChange={event => setMealTime(event.target.value)} required/></label>
        <label className="field">Energy in {preferences.energyUnit === 'kj' ? 'kJ' : 'kcal'} (optional)<input type="number" inputMode="numeric" min="0" max="50000" value={energy} onChange={event => setEnergy(event.target.value}/></label>
        <label className="field">Notes (optional)<input value={description} onChange={event => setDescription(event.target.value)} placeholder="Ingredients, portion or how it felt"/></label>
      </div>
      <div className="btn-row"><button type="submit" className="btn btn-primary">{editingId === null ? 'Save food note' : 'Save changes'}</button><button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button></div>
    </form>}

    <div className="grid-2">
      <Card title="Meal history" action={<div className="btn-row"><button type="button" className="icon-btn" aria-label="Previous day" onClick={() => changeDate(-1)}><ChevronLeft size={18}/></button><button type="button" className="icon-btn" aria-label="Next day" disabled={selectedDate >= today} onClick={() => changeDate(1)}><ChevronRight size={18}/></button></div>}>
        <label className="field">Choose a date<input type="date" value={selectedDate} max={today} onChange={event => setSelectedDate(event.target.value)}/></label>
        <p className="muted">{formatDay(selectedDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        {selectedMeals.length === 0 ? <EmptyState title="No food notes for this day" body="Add a meal or snack whenever you want to keep a record." action={<button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setShowForm(true); }}>Add a note</button>}/> : <>
          <ul className="rows">
            {selectedMeals.map(meal => <li className="row row-top" key={meal.id}>
              <div className="row-main"><b>{meal.name}</b><small>{meal.kind}, {meal.time}</small>{meal.desc && <p className="entry-note">{meal.desc}</p>}</div>
              {meal.cal > 0 && <div className="row-side"><b>{kcalToDisplay(meal.cal, preferences.energyUnit).toLocaleString()}</b><small>{preferences.energyUnit === 'kj' ? 'kJ' : 'kcal'}</small></div>}
              <button type="button" className="icon-btn" aria-label={'Edit ' + meal.name} onClick={() => startEdit(meal)}><Pencil size={17}/></button>
              <button type="button" className="icon-btn" aria-label={'Remove ' + meal.name} onClick={() => remove(meal.id, meal.name)}><Trash2 size={18}/></button>
            </li>)}
          </ul>
          {energyTotal > 0 && <p className="muted">Recorded energy: {energyTotal.toLocaleString()} {preferences.energyUnit === 'kj' ? 'kJ' : 'kcal'}. This is an optional log, not a target.</p>}
        </>}
      </Card>
      <div className="stack">
        <WaterCard/>
        <Card title="Last 7 days">
          <dl className="stat-strip">
            <div><dt>Food notes</dt><dd>{weekMealCount}</dd></div>
            <div><dt>Days recorded</dt><dd>{week.filter(day => day.count > 0).length} of 7</dd></div>
          </dl>
          <ul className="rows">{week.map(day => <li className="row" key={day.key}><div className="row-main"><b>{day.label}</b><small>{formatDay(day.key, { day: 'numeric', month: 'short' })}</small></div><div className="row-side"><b>{day.count}</b><small>{day.count === 1 ? 'food note' : 'food notes'}</small></div></li>)}</ul>
          {weekEnergy > 0 && <p className="muted">Optional energy recorded: {kcalToDisplay(weekEnergy, preferences.energyUnit).toLocaleString()} {preferences.energyUnit === 'kj' ? 'kJ' : 'kcal'}.</p>}
        </Card>
      </div>
    </div>
  </div>;
}
