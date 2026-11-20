import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { useStore } from '../lib/store';
import { useProfile } from '../context/ProfileContext';
import { useToday } from '../hooks/useToday';
import { Card, EmptyState, Meter, PageHeader } from '../components/PagePrimitives';
import BarChart from '../components/BarChart';
import MoodPicker from '../components/MoodPicker';
import WaterCard from '../components/WaterCard';
import WeekStrip from '../components/WeekStrip';
import { collectEvents, formatDay, formatWater, getMealDate, greetingFor, lastDays, shiftDate, localDate, sumFor } from '../lib/wellbeing';

const timeOrder = ['Morning', 'Afternoon', 'Evening', 'Anytime'];
const typePaths = { activity: '/app/activity', meal: '/app/nutrition', water: '/app/nutrition', journal: '/app/journal', routine: '/app/routines' } as const;

export default function Overview() {
  const { profile } = useProfile();
  const today = useToday();
  const yesterday = localDate(shiftDate(new Date(today + 'T12:00:00'), -1));
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
  const stepsYesterday = sumFor(activities, yesterday, item => item.steps);
  const minutes = sumFor(activities, today, item => item.minutes);
  const waterMl = sumFor(water, today, item => item.ml);
  const waterYesterday = sumFor(water, yesterday, item => item.ml);
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
  const latest = collectEvents({ activities, meals, water, journals, completions }, preferences).slice(0, 6);
  const groups = timeOrder.map(time => ({ time, items: habits.filter(habit => (timeOrder.includes(habit.time) ? habit.time : 'Anytime') === time) })).filter(group => group.items.length);

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

    {profile && profile.goals.length > 0 && <p className="focus-line"><span>Your focus</span>{profile.goals.map(goal => <b className="chip" key={goal}>{goal}</b>)}</p>}

    <Card title="This week"><WeekStrip/></Card>

    <Card title="Today so far">
      <div className="glance">
        {shows('Movement') && <div className="glance-row">
          <div className="glance-top"><span>Steps</span><b>{steps.toLocaleString()}<small> of {preferences.dailyStepTarget.toLocaleString()}</small></b></div>
          <Meter value={steps} max={preferences.dailyStepTarget} label="Steps toward today's target"/>
          {stepsYesterday > 0 && <small className="glance-note">Yesterday: {stepsYesterday.toLocaleString()}</small>}
        </div>}
        {shows('Movement') && <div className="glance-row">
          <div className="glance-top"><span>Active time</span><b>{minutes}<small> min</small></b></div>
        </div>}
        {shows('Hydration', 'Nutrition') && <div className="glance-row">
          <div className="glance-top"><span>Water</span><b>{waterNow.value}<small> of {waterGoal.value} {waterGoal.unit}</small></b></div>
          <Meter value={waterMl} max={preferences.dailyWaterTargetMl} label="Water toward today's target"/>
          {waterYesterday > 0 && <small className="glance-note">Yesterday: {formatWater(waterYesterday, preferences.waterUnit).value} {waterGoal.unit}</small>}
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
      {shows('Routines') && <Card title="Routines" action={<Link className="text-link" to="/app/routines">Manage <ArrowRight size={16} aria-hidden="true"/></Link>}>
        {habits.length === 0 ? <EmptyState title="No routines yet" body="Add one on the routines page." action={<Link className="btn btn-secondary" to="/app/routines">Add a routine</Link>}/> : <div className="time-groups">
          {groups.map(group => <div key={group.time}>
            <h3 className="group-label">{group.time}</h3>
            <ul className="check-list">
              {group.items.map(habit => <li key={habit.id}>
                <label className="check-row">
                  <input type="checkbox" checked={doneIds.has(habit.id)} onChange={() => toggleHabit(habit.id, habit.title)}/>
                  <span className="check-box" aria-hidden="true"/>
                  <span className="check-text"><b>{habit.title}</b>{habit.detail && <small>{habit.detail}</small>}</span>
                </label>
              </li>)}
            </ul>
          </div>)}
        </div>}
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
        {todayEntry?.note && <p className="muted">Today's journal note is saved and stays as it is.</p>}
      </Card>}
    </div>

    <Card title="Latest entries" action={<Link className="text-link" to="/app/calendar">Calendar <ArrowRight size={16} aria-hidden="true"/></Link>}>
      {latest.length === 0 ? <EmptyState title="Nothing logged yet" body="Log a walk, a glass of water or a mood and it will show up here."/> :
        <ul className="rows">{latest.map(event => <li className="row" key={event.id}>
          <div className="row-main"><b>{event.title}</b><small>{formatDay(event.date, { weekday: 'short', day: 'numeric', month: 'short' })}, {event.detail}</small></div>
          <Link className="text-link" to={typePaths[event.type]}>Open</Link>
        </li>)}</ul>}
    </Card>
  </div>;
}
