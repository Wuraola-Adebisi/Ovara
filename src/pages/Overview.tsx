import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { useStore } from '../lib/store';
import { useProfile } from '../context/ProfileContext';
import { useToday } from '../hooks/useToday';
import { Card, Meter, PageFeature, PageHeader } from '../components/PagePrimitives';
import BarChart from '../components/BarChart';
import MoodPicker from '../components/MoodPicker';
import WaterCard from '../components/WaterCard';
import { GLASS_ML, formatDay, formatWater, getMealDate, greetingFor, lastDays, sumFor } from '../lib/wellbeing';

export default function Overview() {
  const { profile } = useProfile();
  const today = useToday();
  const [habits] = useStore('habits');
  const [completions, setCompletions] = useStore('completions');
  const [water] = useStore('water');
  const [activities] = useStore('activities');
  const [meals] = useStore('meals');
  const [journals, setJournals] = useStore('journals');
  const [preferences] = useStore('preferences');

  // Areas picked during setup decide which sections lead. With none picked, show everything.
  const interests = profile?.interests ?? [];
  const shows = (...areas: string[]) => interests.length === 0 || areas.some(area => interests.includes(area));

  const doneIds = new Set(completions.filter(item => item.date === today).map(item => item.routineId));
  const doneCount = habits.filter(habit => doneIds.has(habit.id)).length;
  const steps = sumFor(activities, today, item => item.steps);
  const minutes = sumFor(activities, today, item => item.minutes);
  const waterMl = sumFor(water, today, item => item.ml);
  const foodCount = meals.filter(meal => getMealDate(meal) === today).length;
  const waterNow = formatWater(waterMl, preferences.waterUnit);
  const waterGoal = formatWater(preferences.dailyWaterTargetMl, preferences.waterUnit);
  const todayEntry = journals.find(entry => entry.date === today);
  const week = lastDays(7).map(({ key, date }) => ({
    key, label: date.toLocaleDateString(undefined, { weekday: 'short' }),
    fullLabel: date.toLocaleDateString(undefined, { weekday: 'long' }),
    value: sumFor(activities, key, item => item.steps), highlight: key === today,
  }));
  const weekAverage = Math.round(week.reduce((sum, day) => sum + day.value, 0) / 7);

  function toggleHabit(id: number, title: string) {
    if (doneIds.has(id)) setCompletions(current => current.filter(item => !(item.routineId === id && item.date === today)));
    else setCompletions(current => [...current, { id: Date.now(), date: today, routineId: id, title }]);
  }
  // Picking a mood here updates today's entry and keeps any note already written in the journal.
  function saveMood(mood: string) {
    setJournals(current => todayEntry
      ? current.map(entry => entry.id === todayEntry.id ? { ...entry, mood } : entry)
      : [{ id: Date.now(), date: today, mood, note: '', createdAt: new Date().toISOString() }, ...current]);
  }

  return <div className="stack">
    <PageHeader
      title={greetingFor() + ', ' + (profile?.name.split(' ')[0] ?? '')}
      desc={formatDay(today, { weekday: 'long', day: 'numeric', month: 'long' })}
      action={<button type="button" className="btn btn-primary" onClick={() => window.dispatchEvent(new Event('ovara:add'))}><Plus size={18} aria-hidden="true"/>Add</button>}
    />

    <PageFeature eyebrow="Your day, your pace" text="Wellbeing is made up of small choices, changing needs and ordinary moments. Use this space to notice what matters today, then take it one step at a time." image="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85" imageAlt="Warm morning sunlight falling across a peaceful outdoor landscape" />

    {profile && profile.goals.length > 0 && <p className="focus-line"><span>Your focus</span>{profile.goals.map(goal => <b className="chip" key={goal}>{goal}</b>)}</p>}

    <Card title="Today so far">
      <div className="glance">
        {shows('Movement') && <div className="glance-row">
          <div className="glance-top"><span>Steps</span><b>{steps.toLocaleString()}<small> of {preferences.dailyStepTarget.toLocaleString()}</small></b></div>
          <Meter value={steps} max={preferences.dailyStepTarget} label="Steps toward today's target"/>
        </div>}
        {shows('Movement') && <div className="glance-row">
          <div className="glance-top"><span>Active time</span><b>{minutes}<small> min</small></b></div>
        </div>}
        {shows('Hydration', 'Nutrition') && <div className="glance-row">
          <div className="glance-top"><span>Water</span><b>{waterNow.value}<small> of {waterGoal.value} {waterGoal.unit}</small></b></div>
          <Meter value={waterMl} max={preferences.dailyWaterTargetMl} label="Water toward today's target"/>
        </div>}
        {shows('Routines') && <div className="glance-row">
          <div className="glance-top"><span>Routines</span><b>{doneCount}<small> of {habits.length}</small></b></div>
          <Meter value={doneCount} max={habits.length} label="Routines done today"/>
        </div>}
        {shows('Nutrition') && <div className="glance-row">
          <div className="glance-top"><span>Food notes</span><b>{foodCount}<small> today</small></b></div>
        </div>}
      </div>
    </Card>

    <div className="grid-2">
      {shows('Routines') && <Card title="Routines" action={<Link className="text-link" to="/app/routines">All routines <ArrowRight size={16} aria-hidden="true"/></Link>}>
        {habits.length === 0 ? <p className="muted">No routines yet. Add one on the routines page.</p> : <ul className="check-list">
          {habits.slice(0, 6).map(habit => <li key={habit.id}>
            <label className="check-row">
              <input type="checkbox" checked={doneIds.has(habit.id)} onChange={() => toggleHabit(habit.id, habit.title)}/>
              <span className="check-box" aria-hidden="true"/>
              <span className="check-text"><b>{habit.title}</b><small>{habit.time}</small></span>
            </label>
          </li>)}
        </ul>}
      </Card>}

      {shows('Hydration', 'Nutrition') && <WaterCard/>}
    </div>

    <div className="grid-2">
      {shows('Movement') && <Card title="Steps this week" action={<Link className="text-link" to="/app/activity">Activity <ArrowRight size={16} aria-hidden="true"/></Link>}>
        <p className="muted">Average {weekAverage.toLocaleString()} a day</p>
        <BarChart bars={week} unit="steps" target={preferences.dailyStepTarget}/>
      </Card>}
      {shows('Reflection') && <Card title="Check in" action={<Link className="text-link" to="/app/journal">Journal <ArrowRight size={16} aria-hidden="true"/></Link>}>
        <MoodPicker name="overview-mood" legend="How are you feeling today?" value={todayEntry?.mood ?? ''} onChange={saveMood}/>
      </Card>}
    </div>
  </div>;
}
