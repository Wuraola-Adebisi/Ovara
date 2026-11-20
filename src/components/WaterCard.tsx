import { Minus, Plus } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { Card, Meter } from './PagePrimitives';
import { GLASS_ML, formatWater, sumFor } from '../lib/wellbeing';

// One water log feeds the Today page, the food page, goals, insights and the calendar.
export default function WaterCard() {
  const today = useToday();
  const [water, setWater] = useStore('water');
  const [preferences] = useStore('preferences');
  const ml = sumFor(water, today, item => item.ml);
  const now = formatWater(ml, preferences.waterUnit);
  const goal = formatWater(preferences.dailyWaterTargetMl, preferences.waterUnit);
  const glasses = Math.round(ml / GLASS_ML);

  const addGlass = () => setWater(current => [...current, { id: Date.now(), date: today, ml: GLASS_ML, time: new Date().toISOString() }]);
  const removeLast = () => setWater(current => {
    const last = [...current].reverse().find(item => item.date === today);
    return last ? current.filter(item => item.id !== last.id) : current;
  });

  return <Card title="Water">
    <p className="big-number">{now.value}<small> / {goal.value} {goal.unit}</small></p>
    <Meter value={ml} max={preferences.dailyWaterTargetMl} label="Water toward today's target"/>
    <p className="muted">{glasses} {glasses === 1 ? 'glass' : 'glasses'} logged today ({GLASS_ML} ml each)</p>
    <div className="btn-row">
      <button type="button" className="btn btn-primary" onClick={addGlass}><Plus size={18} aria-hidden="true"/>Add a glass</button>
      <button type="button" className="btn btn-secondary" onClick={removeLast} disabled={ml === 0}><Minus size={18} aria-hidden="true"/>Remove last</button>
    </div>
  </Card>;
}
