import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { useUndoRemove } from '../hooks/useUndoRemove';
import { useToast } from '../components/Toast';
import { Card, EmptyState, PageFeature, PageHeader } from '../components/PagePrimitives';
import WaterCard from '../components/WaterCard';
import { displayToKcal, getMealDate, kcalToDisplay } from '../lib/wellbeing';

const kinds = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function NutritionPage() {
  const location = useLocation();
  const today = useToday();
  const toast = useToast();
  const [meals, setMeals] = useStore('meals');
  const [preferences] = useStore('preferences');
  const remove = useUndoRemove(meals, setMeals);
  const [showForm, setShowForm] = useState(Boolean((location.state as { add?: boolean } | null)?.add));
  const [mealName, setMealName] = useState('');
  const [mealKind, setMealKind] = useState('Breakfast');
  const [energy, setEnergy] = useState('');

  const todayMeals = meals.filter(meal => getMealDate(meal) === today);
  const energyTotal = todayMeals.reduce((sum, meal) => sum + kcalToDisplay(meal.cal, preferences.energyUnit), 0);

  function addMeal(event: FormEvent) {
    event.preventDefault();
    if (!mealName.trim()) return;
    setMeals(current => [...current, {
      id: Date.now(), name: mealName.trim(), kind: mealKind, date: today, desc: '',
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      // Stored as kcal whatever unit is shown, so switching units later never skews old entries.
      cal: energy.trim() ? Math.max(0, displayToKcal(Number(energy) || 0, preferences.energyUnit)) : 0,
    }]);
    setMealName(''); setEnergy(''); setShowForm(false);
    toast.show('Food note saved');
  }

  return <div className="stack">
    <PageHeader title="Food and water" desc="Note what you eat and drink. Energy estimates are optional." action={<button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => setShowForm(value => !value)}><Plus size={18} aria-hidden="true"/>Add a meal</button>}/>

    <PageFeature eyebrow="Nourishment without the scorekeeping" text="Food is more than a number. Keep simple notes about meals, notice what helps you feel cared for and make hydration part of your day in a way that works for you." image="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85" imageAlt="A colourful spread of fresh vegetables, grains and nourishing foods" />

    {showForm && <form className="card form-card" onSubmit={addMeal}>
      <div className="card-head"><h2>Add a food note</h2></div>
      <div className="form-grid">
        <label className="field">What did you have?<input value={mealName} onChange={event => setMealName(event.target.value)} placeholder="Rice, vegetables and fish" required autoComplete="off"/></label>
        <label className="field">Meal<select value={mealKind} onChange={event => setMealKind(event.target.value)}>{kinds.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field">Energy in {preferences.energyUnit === 'kj' ? 'kJ' : 'kcal'} (optional)<input type="number" inputMode="numeric" min="0" max="50000" value={energy} onChange={event => setEnergy(event.target.value)}/></label>
      </div>
      <div className="btn-row"><button type="submit" className="btn btn-primary">Save food note</button><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
    </form>}

    <div className="grid-2">
      <Card title="Today's food notes">
        {todayMeals.length === 0 ? <EmptyState title="No food notes today" body="Add a meal or snack when you want to keep a record." action={<button type="button" className="btn btn-secondary" onClick={() => setShowForm(true)}>Add a note</button>}/> : <>
          <ul className="rows">
            {todayMeals.map(meal => <li className="row" key={meal.id}>
              <div className="row-main"><b>{meal.name}</b><small>{meal.kind}, {meal.time}</small></div>
              {meal.cal > 0 && <div className="row-side"><b>{kcalToDisplay(meal.cal, preferences.energyUnit).toLocaleString()}</b><small>{preferences.energyUnit === 'kj' ? 'kJ' : 'kcal'}</small></div>}
              <button type="button" className="icon-btn" aria-label={'Remove ' + meal.name} onClick={() => remove(meal.id, meal.name)}><Trash2 size={18}/></button>
            </li>)}
          </ul>
          {energyTotal > 0 && <p className="muted">Energy you chose to record today: {energyTotal.toLocaleString()} {preferences.energyUnit === 'kj' ? 'kJ' : 'kcal'}. There is no target.</p>}
        </>}
      </Card>
      <WaterCard/>
    </div>
  </div>;
}
