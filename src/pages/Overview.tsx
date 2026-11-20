import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, BookHeart, CalendarDays, Clock3, Droplets,
  Footprints, ListChecks, Plus, Utensils,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { useProfile } from '../context/ProfileContext';
import { useToday } from '../hooks/useToday';
import { Card, EmptyState, Meter, PageHeader } from '../components/PagePrimitives';
import BarChart from '../components/BarChart';
import MoodPicker from '../components/MoodPicker';
import WaterCard from '../components/WaterCard';
import {
  GLASS_ML, formatDay, formatWater, getMealDate, greetingFor, lastDays, sumFor,
} from '../lib/wellbeing';

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
  const hasAnyEntry = steps > 0 || minutes > 0 || waterMl > 0 || foodCount > 0 || doneCount > 0 || Boolean(todayEntry);
  const week = lastDays(7).map(({ key, date }) => ({
    key,
    label: date.toLocaleDateString(undefined, { weekday: 'short' }),
    fullLabel: date.toLocaleDateString(undefined, { weekday: 'long' }),
    value: sumFor(activities, key, item => item.steps),
    highlight: key === today,
  }));
  const daysWithMovement = week.filter(day => day.value > 0).length;
  const weekTotal = week.reduce((sum, day) => sum + day.value, 0);
  const weekAverage = Math.round(weekTotal / 7);
  const waterPercent = preferences.dailyWaterTargetMl > 0
    ? Math.min(100, Math.round(waterMl / preferences.dailyWaterTargetMl * 100)) : 0;
  const stepPercent = preferences.dailyStepTarget > 0
    ? Math.min(100, Math.round(steps / preferences.dailyStepTarget * 100)) : 0;

  function toggleHabit(id: number, title: string) {
    if (doneIds.has(id)) setCompletions(current => current.filter(item => !(item.routineId === id && item.date === today)));
    else setCompletions(current => [...current, { id: Date.now(), date: today, routineId: id, title }]);
  }

  function saveMood(mood: string) {
    setJournals(current => todayEntry
      ? current.map(entry => entry.id === todayEntry.id ? { ...entry, mood } : entry)
      : [{ id: Date.now(), date: today, mood, note: '', createdAt: new Date().toISOString() }, ...current]);
  }

  const recentEntries = [
    ...activities.map(item => ({
      id: 'activity-' + item.id, date: item.date, label: 'Movement', title: item.name,
      detail: [item.minutes ? item.minutes + ' min' : '', item.steps ? item.steps.toLocaleString() + ' steps' : ''].filter(Boolean).join(' · '),
      icon: Footprints,
    })),
    ...meals.map(item => ({
      id: 'meal-' + item.id, date: getMealDate(item), label: 'Food', title: item.name,
      detail: item.kind || 'Meal note', icon: Utensils,
    })),
    ...water.map(item => ({
      id: 'water-' + item.id, date: item.date, label: 'Hydration', title: 'Water logged',
      detail: formatWater(item.ml, preferences.waterUnit).value + ' ' + formatWater(item.ml, preferences.waterUnit).unit,
      icon: Droplets,
    })),
    ...completions.map(item => ({
      id: 'routine-' + item.id, date: item.date, label: 'Routine', title: item.title,
      detail: 'Completed', icon: ListChecks,
    })),
    ...journals.map(item => ({
      id: 'journal-' + item.id, date: item.date, label: 'Reflection',
      title: item.mood ? 'Mood: ' + item.mood : 'Journal entry',
      detail: item.note.trim() ? item.note.trim() : 'A moment to check in',
      icon: BookHeart,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return <div className="stack dashboard">
    <PageHeader
      title={greetingFor() + ', ' + (profile?.name.split(' ')[0] ?? '')}
      desc={formatDay(today, { weekday: 'long', day: 'numeric', month: 'long' })}
      action={<button type="button" className="btn btn-primary" onClick={() => window.dispatchEvent(new Event('ovara:add'))}><Plus size={18} aria-hidden="true"/>Add to today</button>}
    />

    <section className="dashboard-hero">
      <div className="dashboard-hero-copy">
        <span className="eyebrow">A little space for yourself</span>
        <h2>Your wellbeing, at your own pace.</h2>
        <p>{hasAnyEntry
          ? 'You have started showing up for yourself today. Take a look at what you have logged, or choose one small thing to do next.'
          : 'There is no perfect way to begin. Check in with how you feel, make a note, or choose one small thing that would support you today.'}</p>
        <div className="dashboard-hero-actions">
          <Link className="btn btn-primary" to="/app/journal">Check in <ArrowUpRight size={17} aria-hidden="true"/></Link>
          <Link className="dashboard-text-link" to="/app/insights">See your progress <ArrowRight size={16} aria-hidden="true"/></Link>
        </div>
      </div>
      <div className="dashboard-hero-photo">
        <img src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85" alt="Soft morning light across a green landscape" fetchPriority="high"/>
        <span>Make today your own</span>
      </div>
    </section>

    {profile && profile.goals.length > 0 && <div className="dashboard-focus">
      <span>Your focus</span>
      {profile.goals.map(goal => <b className="chip" key={goal}>{goal}</b>)}
      <Link to="/app/settings" aria-label="Update your focus"><ArrowUpRight size={16}/></Link>
    </div>}

    <section className="dashboard-section">
      <div className="dashboard-section-heading">
        <div><span className="eyebrow">A quick look</span><h2>Your day so far</h2></div>
        <span className="muted small-print">A snapshot, not a score</span>
      </div>
      <div className="dashboard-stat-grid">
        {shows('Movement') && <article className="dashboard-stat">
          <div className="dashboard-stat-icon movement"><Footprints size={19}/></div>
          <span>Steps</span>
          <strong>{steps.toLocaleString()}</strong>
          <Meter value={steps} max={preferences.dailyStepTarget} label="Steps toward your daily target"/>
          <small>{stepPercent}% of {preferences.dailyStepTarget.toLocaleString()} step target</small>
        </article>}
        {shows('Hydration', 'Nutrition') && <article className="dashboard-stat">
          <div className="dashboard-stat-icon hydration"><Droplets size={19}/></div>
          <span>Water</span>
          <strong>{waterNow.value}<small> {waterNow.unit}</small></strong>
          <Meter value={waterMl} max={preferences.dailyWaterTargetMl} label="Water toward your daily target"/>
          <small>{waterPercent}% of {waterGoal.value} {waterGoal.unit} target</small>
        </article>}
        {shows('Routines') && <article className="dashboard-stat">
          <div className="dashboard-stat-icon routines"><ListChecks size={19}/></div>
          <span>Routines</span>
          <strong>{doneCount}<small> / {habits.length}</small></strong>
          <Meter value={doneCount} max={habits.length} label="Routines completed today"/>
          <small>{habits.length ? (doneCount === habits.length ? 'All routines checked off' : 'Keep your own pace') : 'Add a routine to begin'}</small>
        </article>}
        {shows('Nutrition') && <article className="dashboard-stat">
          <div className="dashboard-stat-icon nutrition"><Utensils size={19}/></div>
          <span>Food notes</span>
          <strong>{foodCount}</strong>
          <div className="dashboard-stat-note">{foodCount === 0 ? 'Nothing logged yet' : foodCount === 1 ? 'One meal or snack noted' : 'Meals and snacks noted today'}</div>
          <Link to="/app/nutrition" className="dashboard-stat-link">View food log <ArrowRight size={14}/></Link>
        </article>}
      </div>
    </section>

    <section className="dashboard-section">
      <div className="dashboard-section-heading">
        <div><span className="eyebrow">Start anywhere</span><h2>What would support you today?</h2></div>
      </div>
      <div className="dashboard-shortcuts">
        <Link to="/app/activity" state={{ add: true }} className="dashboard-shortcut">
          <span className="dashboard-shortcut-icon movement"><Footprints size={20}/></span>
          <span><b>Move a little</b><small>Log a walk or workout</small></span><ArrowUpRight size={17}/>
        </Link>
        <Link to="/app/nutrition" state={{ add: true }} className="dashboard-shortcut">
          <span className="dashboard-shortcut-icon nutrition"><Utensils size={20}/></span>
          <span><b>Nourish yourself</b><small>Note a meal or snack</small></span><ArrowUpRight size={17}/>
        </Link>
        <Link to="/app/routines" className="dashboard-shortcut">
          <span className="dashboard-shortcut-icon routines"><ListChecks size={20}/></span>
          <span><b>Keep a routine</b><small>See what is on your list</small></span><ArrowUpRight size={17}/>
        </Link>
        <Link to="/app/journal" className="dashboard-shortcut">
          <span className="dashboard-shortcut-icon reflection"><BookHeart size={20}/></span>
          <span><b>Pause and reflect</b><small>Check in with yourself</small></span><ArrowUpRight size={17}/>
        </Link>
      </div>
    </section>

    <div className="grid-2 dashboard-main-grid">
      {shows('Routines') && <Card title="Your daily rhythm" action={<Link className="text-link" to="/app/routines">All routines <ArrowRight size={16} aria-hidden="true"/></Link>}>
        {habits.length === 0 ? <EmptyState title="Create a rhythm that works for you" body="Add a few small routines you would like to make space for." action={<Link className="text-link" to="/app/routines">Set up routines <ArrowRight size={16}/></Link>}/> : <>
          <div className="dashboard-card-intro">{doneCount} of {habits.length} routines completed today</div>
          <ul className="check-list">
            {habits.slice(0, 5).map(habit => <li key={habit.id}>
              <label className="check-row">
                <input type="checkbox" checked={doneIds.has(habit.id)} onChange={() => toggleHabit(habit.id, habit.title)}/>
                <span className="check-box" aria-hidden="true"/>
                <span className="check-text"><b>{habit.title}</b><small>{habit.detail || habit.time}</small></span>
                <span className="routine-time">{habit.time}</span>
              </label>
            </li>)}
          </ul>
        </>}
      </Card>}

      {shows('Hydration', 'Nutrition') && <WaterCard/>}
    </div>

    <div className="grid-2 dashboard-main-grid">
      {shows('Movement') && <Card title="Your movement this week" action={<Link className="text-link" to="/app/activity">Activity <ArrowRight size={16} aria-hidden="true"/></Link>}>
        <div className="dashboard-week-summary">
          <div><strong>{weekTotal.toLocaleString()}</strong><span>steps in the last 7 days</span></div>
          <div><strong>{daysWithMovement}<small>/7</small></strong><span>days with movement logged</span></div>
        </div>
        <BarChart bars={week} unit="steps" target={preferences.dailyStepTarget}/>
        <p className="muted small-print">Daily average: {weekAverage.toLocaleString()} steps. Your target is a guide, not a requirement.</p>
      </Card>}

      {shows('Reflection') && <Card title="A moment to check in" action={<Link className="text-link" to="/app/journal">Open journal <ArrowRight size={16} aria-hidden="true"/></Link>}>
        <p className="dashboard-card-intro">How are you feeling right now? There is no right answer.</p>
        <MoodPicker name="overview-mood" legend="Choose what feels closest" value={todayEntry?.mood ?? ''} onChange={saveMood}/>
        {todayEntry?.note && <p className="dashboard-note-preview">“{todayEntry.note}”</p>}
      </Card>}
    </div>

    <Card title="Recently added" action={<Link className="text-link" to="/app/calendar">View calendar <CalendarDays size={16} aria-hidden="true"/></Link>}>
      {recentEntries.length === 0
        ? <EmptyState title="Your activity will appear here" body="When you log movement, meals, water, routines or a reflection, you will find your recent entries here."/>
        : <div className="dashboard-recent-list">{recentEntries.map(entry => {
          const Icon = entry.icon;
          return <div className="dashboard-recent-item" key={entry.id}>
            <span className="dashboard-recent-icon"><Icon size={18} aria-hidden="true"/></span>
            <div><small>{entry.label} · {formatDay(entry.date, { day: 'numeric', month: 'short' })}</small><b>{entry.title}</b><p>{entry.detail}</p></div>
            <Clock3 size={15} className="dashboard-recent-clock" aria-hidden="true"/>
          </div>;
        })}</div>}
    </Card>
  </div>;
}
