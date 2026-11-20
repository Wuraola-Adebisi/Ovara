import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { usePageTitle } from '../components/PagePrimitives';
import { ActivityPreview, FoodPreview, GoalsPreview, InsightsPreview, JournalPreview, RoutinesPreview } from '../components/previews';

type Feature = { id: string; title: string; body: string; points: string[]; path: string; preview: ReactNode };

const features: Feature[] = [
  { id: 'activity', title: 'Activity', body: 'A log of walks, runs, rides, workouts, yoga and stretching. Each entry has a duration, and steps and distance if you want them. Steps are never required, so a yoga session does not need a made up number.', points: ['Chart of the last 7 days with your step target drawn on it', 'Minutes broken down by type of activity', 'Filter the history by type, and edit or remove any entry', 'Log an activity for an earlier date'], path: '/app/activity', preview: <ActivityPreview/> },
  { id: 'food', title: 'Food and water', body: 'Note meals and snacks in your own words, grouped by meal. Energy is optional, and you can choose kilocalories or kilojoules. Water is counted in glasses with a daily target you set.', points: ['Step back through earlier days and add notes for them', 'Energy stored once and converted, so changing units never distorts old entries', 'Water history for 7 days in millilitres or fluid ounces', 'No calorie target anywhere in the app'], path: '/app/nutrition', preview: <FoodPreview/> },
  { id: 'routines', title: 'Routines', body: 'A short list of things you want to do regularly, each with a time of day. Tick them off on the Today page or here. Ticks reset each day and the history stays.', points: ['Morning, afternoon, evening or anytime', 'A grid of the last 7 days for every routine', 'Rename, re-time or remove routines whenever you like', 'No streak counter, so a missed day costs nothing'], path: '/app/routines', preview: <RoutinesPreview/> },
  { id: 'journal', title: 'Journal', body: 'A mood from six options and a free text note, one entry per day. Choose any past date to write or update that day.', points: ['Search across all your entries', 'A prompt each day if you want a starting point', 'A mood chosen on the Today page never overwrites your note', 'Anxious is kept as a feeling and left out of mood averages'], path: '/app/journal', preview: <JournalPreview/> },
  { id: 'goals', title: 'Goals', body: 'Pick a measure (steps, active minutes, water, routine check-ins or journal entries), a target and a time frame. Progress is calculated from what you have already logged.', points: ['Daily, weekly or monthly, with your choice of week start', 'Ready made suggestions you can edit after adding', 'Water goals typed in your chosen unit', 'A goal is marked as reached once and then left alone'], path: '/app/goals', preview: <GoalsPreview/> },
  { id: 'insights', title: 'Insights and calendar', body: 'Totals for the last 7 days or the current month, set against the period before. A day by day chart can show steps, minutes or water, and a mood strip shows each day at a glance. The calendar lists everything logged on any day.', points: ['Comparison with the previous week or month', 'Minutes by activity type', 'Month summary on the calendar', 'Plain observations calculated on your device'], path: '/app/insights', preview: <InsightsPreview/> },
];

const extras = [
  ['Reminders', 'Set reminders for water, a pause or anything else, with times and days of the week. They appear while Ovara is open in a browser tab.'],
  ['Units and targets', 'Kilometres or miles, kcal or kJ, millilitres or fluid ounces, plus your daily step and water targets and the first day of your week.'],
  ['Download and restore', 'Save everything as a file, restore it on another device or after clearing your browser, or delete it all from this device.'],
  ['Undo', 'Removing an entry never asks "are you sure". It removes it and shows an Undo button for a few seconds.'],
] as const;

export default function FeaturesPage() {
  usePageTitle('Features');
  return <main id="main" className="features-page">
    <div className="container">
      <header className="page-intro">
        <h1>Everything Ovara does</h1>
        <p className="lead">Six areas that work together, plus the settings that make them fit your day. All of it runs in your browser.</p>
        <nav className="anchor-nav" aria-label="On this page">{features.map(item => <a key={item.id} href={'#' + item.id}>{item.title}</a>)}<a href="#more">More</a></nav>
      </header>

      {features.map((item, index) => <section key={item.id} id={item.id} className={index % 2 ? 'feature-row is-reverse' : 'feature-row'}>
        <div className="feature-copy">
          <h2>{item.title}</h2>
          <p>{item.body}</p>
          <ul className="tick-list">{item.points.map(point => <li key={point}>{point}</li>)}</ul>
          <Link className="text-link" to={item.path}>Open {item.title.toLowerCase()}<ArrowRight size={16} aria-hidden="true"/></Link>
        </div>
        {item.preview}
      </section>)}

      <section id="more" className="more-grid">
        <h2>And the details around them</h2>
        <dl>{extras.map(([title, body]) => <div key={title}><dt>{title}</dt><dd>{body}</dd></div>)}</dl>
      </section>

      <div className="cta-inline"><Link to="/app" className="btn btn-primary btn-lg">Open your space<ArrowRight size={20} aria-hidden="true"/></Link></div>
    </div>
  </main>;
}
