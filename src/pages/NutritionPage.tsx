import { useState } from 'react';
import type { FormEvent } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import type { Meal } from '../data/seed';
import { Coffee, Plus, Salad, Trash2, Utensils } from 'lucide-react';
import { Header, PanelTitle, Metric } from '../components/PagePrimitives';

export default function NutritionPage() {
  const [meals, setMeals] = usePersistentState<Meal[]>('ovara.meals', []);
  const [water, setWater] = usePersistentState('ovara.waterGlasses', 0);
  const [showForm, setShowForm] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealKind, setMealKind] = useState('Breakfast');
  const [energy, setEnergy] = useState('');
  const totalEnergy = meals.reduce((sum, meal) => sum + meal.cal, 0);

  function addMeal(event: FormEvent) {
    event.preventDefault();
    setMeals(current => [...current, { id: Date.now(), name: mealName.trim(), kind: mealKind, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), cal: Math.max(0, Number(energy) || 0), desc: 'Added to your food notes' }]);
    setMealName(''); setEnergy(''); setShowForm(false);
  }

  return <div className="stack">
    <Header tag="FOOD & NOURISHMENT" title="Nourish yourself well." desc="Notice what you eat and drink, without turning food into a maths problem." action={<button className="btn dark" onClick={() => setShowForm(value => !value)}><Plus size={16}/> Add a meal</button>}/>
    {showForm && <form className="panel activity-form" onSubmit={addMeal}><div className="panel-title"><div><label>A NOTE ABOUT YOUR FOOD</label><h3>What did you have?</h3></div><button type="button" className="btn outline small" onClick={() => setShowForm(false)}>Cancel</button></div><div className="form-grid"><label>Meal or food<input value={mealName} onChange={event => setMealName(event.target.value)} placeholder="e.g. Rice, vegetables and fish" required/></label><label>When<select value={mealKind} onChange={event => setMealKind(event.target.value)}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select></label><label>Energy estimate (optional)<input type="number" min="0" max="10000" value={energy} onChange={event => setEnergy(event.target.value)} placeholder="Leave blank if you prefer"/></label></div><button className="btn dark" type="submit">Save food note</button></form>}
    <section className="nutrition-hero"><div><label>YOUR FOOD NOTES</label><b>{meals.length} <small>{meals.length === 1 ? 'meal or snack noted' : 'meals & snacks noted'}</small></b><p>Food is nourishment, culture, pleasure and connection. Your notes can reflect that.</p></div><div className="nutrition-note"><span>Today</span><strong>{meals.length ? 'You made a note.' : 'Start wherever you are.'}</strong></div></section>
    <section className="metrics three"><Metric label="Meals & snacks" value={String(meals.length)} note="Notes added today" icon={Utensils} tone="mint"/><Metric label="Water" value={(water * 250).toLocaleString()} unit="ml" note="Water logged today" icon={Salad} tone="lilac"/><Metric label="Energy estimates" value={totalEnergy ? totalEnergy.toLocaleString() : '—'} unit={totalEnergy ? 'kcal' : ''} note="Optional, if useful to you" icon={Coffee} tone="peach"/></section>
    <section className="two-col nutrition-cols"><article className="panel"><PanelTitle tag="WHAT YOU'VE HAD" title="Today's food notes"/>{meals.length ? meals.map(meal => <div className="meal" key={meal.id}><span className="metric-icon mint">{meal.kind === 'Breakfast' ? <Coffee size={18}/> : <Salad size={18}/>}</span><span><b>{meal.name}</b><small>{meal.kind} · {meal.time}</small><small>{meal.desc}</small></span>{meal.cal > 0 && <strong>{meal.cal}<small>kcal</small></strong>}<button aria-label={'Delete ' + meal.name} className="icon-button" onClick={() => setMeals(current => current.filter(item => item.id !== meal.id))}><Trash2 size={14}/></button></div>) : <div className="empty-state"><span className="metric-icon peach"><Utensils size={19}/></span><b>Your food notes will live here.</b><p>Add a meal or snack whenever you feel like keeping track.</p><button className="btn outline small" onClick={() => setShowForm(true)}>Add your first note <Plus size={14}/></button></div>}</article><article className="panel"><PanelTitle tag="STAY HYDRATED" title="Water check-in"/><div className="water-total"><b>{(water * .25).toFixed(2)}</b><span> / 2 litres</span></div><div className="water-drops">{Array.from({ length: 8 }, (_, index) => <span className={index < water ? 'filled' : ''} key={index}><Salad size={15}/></span>)}</div><div className="water-foot"><span>{water} of 8 glasses</span><button className="btn outline small" onClick={() => setWater(value => Math.min(8, value + 1))} disabled={water === 8}><Plus size={13}/> Add a glass</button></div><button className="text-link water-reset" onClick={() => setWater(0)}>Reset today's count</button></article></section>
  </div>;
}
