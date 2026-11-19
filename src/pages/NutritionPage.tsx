import { useState } from 'react';
import type { FormEvent } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import type { Meal } from '../data/seed';
import { Coffee, Droplets, Plus, Salad, Trash2, Utensils } from 'lucide-react';
import { Header, PanelTitle, Metric } from '../components/PagePrimitives';
import { defaultPreferences, localDate, type Preferences, type WaterEntry } from '../lib/wellbeing';

export default function NutritionPage() {
  const [meals, setMeals] = usePersistentState<Meal[]>('ovara.meals', []);
  const [water, setWater] = usePersistentState('ovara.waterGlasses', 0);
  const [waterLog, setWaterLog] = usePersistentState<WaterEntry[]>('ovara.waterLog', []);
  const [preferences] = usePersistentState<Preferences>('ovara.preferences', defaultPreferences);
  const [showForm, setShowForm] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealKind, setMealKind] = useState('Breakfast');
  const [energy, setEnergy] = useState('');
  const today = localDate();
  const todayMeals = meals.filter(meal => !meal.date || meal.date === today);
  const todayWaterMl = waterLog.filter(item => item.date === today).reduce((sum,item)=>sum+item.ml,0);
  const todayGlasses = todayWaterMl ? Math.round(todayWaterMl / 250) : water;
  const toDisplayEnergy = (value:number) => preferences.energyUnit === 'kj' ? Math.round(value * 4.184) : value;
  const totalEnergy = todayMeals.reduce((sum, meal) => sum + toDisplayEnergy(meal.cal), 0);
  function addMeal(event: FormEvent) {
    event.preventDefault();
    setMeals(current => [...current, { id: Date.now(), name: mealName.trim(), kind: mealKind, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), cal: Math.max(0, Number(energy) || 0), desc: 'Added to your food notes', date: today }]);
    setMealName(''); setEnergy(''); setShowForm(false);
  }
  function addWater() {
    setWaterLog(current=>[...current,{id:Date.now(),date:today,ml:250,time:new Date().toISOString()}]);
    setWater(value=>value+1);
  }
  function resetWater() {
    setWaterLog(current=>current.filter(item=>item.date!==today));
    setWater(0);
  }
  const waterValue = preferences.waterUnit === 'oz' ? (todayGlasses * 250 / 29.5735).toFixed(1) : String(todayGlasses * 250);
  const waterTarget = preferences.waterUnit === 'oz' ? (preferences.dailyWaterTargetMl / 29.5735).toFixed(0) : String(preferences.dailyWaterTargetMl);
  return <div className="stack">
    <Header tag="FOOD & NOURISHMENT" title="Nourish yourself well." desc="Notice what you eat and drink, without turning food into a maths problem." action={<button className="btn dark" onClick={() => setShowForm(value => !value)}><Plus size={16}/> Add a meal</button>}/>
    {showForm && <form className="panel activity-form" onSubmit={addMeal}><div className="panel-title"><div><label>A NOTE ABOUT YOUR FOOD</label><h3>What did you have?</h3></div><button type="button" className="btn outline small" onClick={() => setShowForm(false)}>Cancel</button></div><div className="form-grid"><label>Meal or food<input value={mealName} onChange={event => setMealName(event.target.value)} placeholder="e.g. Rice, vegetables and fish" required/></label><label>When<select value={mealKind} onChange={event => setMealKind(event.target.value)}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select></label><label>Energy estimate (optional)<input type="number" min="0" max="10000" value={energy} onChange={event => setEnergy(event.target.value)} placeholder="Leave blank if you prefer"/></label></div><button className="btn dark" type="submit">Save food note</button></form>}
    <section className="nutrition-hero"><div><label>YOUR FOOD NOTES</label><b>{todayMeals.length} <small>{todayMeals.length === 1 ? 'meal or snack noted today' : 'meals & snacks noted today'}</small></b><p>Food is nourishment, culture, pleasure and connection. Your notes can reflect that.</p></div><div className="nutrition-note"><span>Today</span><strong>{todayMeals.length ? 'You made a note.' : 'Start wherever you are.'}</strong></div></section>
    <section className="metrics three"><Metric label="Meals & snacks" value={String(todayMeals.length)} note="Notes added today" icon={Utensils} tone="mint"/><Metric label="Water" value={waterValue} unit={preferences.waterUnit} note="Water logged today" icon={Salad} tone="lilac"/><Metric label="Energy estimates" value={totalEnergy ? totalEnergy.toLocaleString() : '—'} unit={totalEnergy ? preferences.energyUnit : ''} note="Optional, if useful to you" icon={Coffee} tone="peach"/></section>
    <section className="two-col nutrition-cols"><article className="panel"><PanelTitle tag="WHAT YOU'VE HAD" title="Today's food notes"/>{todayMeals.length ? todayMeals.map(meal => <div className="meal" key={meal.id}><span className="metric-icon mint">{meal.kind === 'Breakfast' ? <Coffee size={18}/> : <Salad size={18}/>}</span><span><b>{meal.name}</b><small>{meal.kind} · {meal.time}</small><small>{meal.desc}</small></span>{meal.cal > 0 && <strong>{toDisplayEnergy(meal.cal)}<small>{preferences.energyUnit}</small></strong>}<button aria-label={'Delete ' + meal.name} className="icon-button" onClick={() => setMeals(current => current.filter(item => item.id !== meal.id))}><Trash2 size={14}/></button></div>) : <div className="empty-state"><span className="metric-icon peach"><Utensils size={19}/></span><b>Your food notes will live here.</b><p>Add a meal or snack whenever you feel like keeping track.</p><button className="btn outline small" onClick={() => setShowForm(true)}>Add your first note <Plus size={14}/></button></div>}</article><article className="panel"><PanelTitle tag="STAY HYDRATED" title="Water check-in"/><div className="water-total"><b>{(todayWaterMl / 1000 || todayGlasses * .25).toFixed(2)}</b><span> / {(preferences.dailyWaterTargetMl / 1000).toFixed(1)} litres</span></div><div className="water-drops">{Array.from({ length: Math.min(12, Math.max(8, Math.ceil(preferences.dailyWaterTargetMl / 250))) }, (_, index) => <span className={index < todayGlasses ? 'filled' : ''} key={index}><Droplets size={15}/></span>)}</div><div className="water-foot"><span>{todayGlasses} glasses logged</span><button className="btn outline small" onClick={addWater}><Plus size={13}/> Add a glass</button></div><button className="text-link water-reset" onClick={resetWater}>Reset today's count</button></article></section>
  </div>;
}
