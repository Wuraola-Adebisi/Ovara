import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { usePageTitle } from '../components/PagePrimitives';
import { ActivityPreview, FoodPreview, GoalsPreview, InsightsPreview, JournalPreview, RoutinesPreview } from '../components/previews';

type Feature = { id: string; title: string; body: string; points: string[]; path: string; preview: ReactNode };

const features: Feature[] = [
  { id: 'activity', title: 'Movement', body: 'From a morning walk to a favourite class, keep a note of the ways you move. Add a duration and, if you like, steps or distance.', points: ['See your movement through the week', 'Explore time spent on different activities', 'Change or remove a note whenever you need to', 'Add something you did on an earlier day'], path: '/app/activity', preview: <ActivityPreview/> },
  { id: 'food', title: 'Food and water', body: 'Keep track of meals, snacks and water in a way that feels comfortable. Add a few words or a little more detail. It is entirely up to you.', points: ['Return to any earlier day', 'Add an optional energy estimate', 'Choose the units you prefer', 'No daily calorie target'], path: '/app/nutrition', preview: <FoodPreview/> },
  { id: 'routines', title: 'Routines', body: 'Give the little things you want to do a place in your day. Choose a time of day, check in as you go and look back over the week.', points: ['Morning, afternoon, evening or anytime', 'See how each routine has fitted into your week', 'Change your list whenever you like', 'A missed day is simply a missed day'], path: '/app/routines', preview: <RoutinesPreview/> },
  { id: 'journal', title: 'Journal', body: 'Take a moment to notice how you feel and write whatever is on your mind. You can return to an earlier day whenever you want.', points: ['Find an earlier note', 'Use a prompt when you need inspiration', 'Keep your thoughts and mood together', 'Write for today or a day gone by'], path: '/app/journal', preview: <JournalPreview/> },
  { id: 'goals', title: 'Personal goals', body: 'Choose something you would like to make time for, set a target that feels right and follow your progress as you go.', points: ['Choose a daily, weekly or monthly rhythm', 'Start with an idea and make it your own', 'Adjust your target as life changes', 'See how things are taking shape'], path: '/app/goals', preview: <GoalsPreview/> },
  { id: 'insights', title: 'Your weeks at a glance', body: 'Look back at recent days and months. Bring movement, water, routines and reflections together to see what stands out.', points: ['Compare recent weeks and months', 'See how your days add up', 'Explore your own patterns over time'], path: '/app/insights', preview: <InsightsPreview/> },
];

const extras = [
  ['Gentle reminders', 'Choose a time to remind yourself about water, a pause or anything else you would like to remember.'],
  ['Your preferences', 'Choose the units you are familiar with, set personal targets and pick the day your week begins.'],
  ['Keep a copy', 'Download a copy of your information whenever you like.'],
  ['Change your mind', 'Remove something you no longer want to keep. You can also undo a recent removal.'],
] as const;

export default function FeaturesPage() {
  usePageTitle('Explore Ovara');
  return <main id="main" className="features-page">
    <div className="container">
      <header className="page-intro">
        <span className="eyebrow">A little space for all of you</span>
        <h1>Made for the shape of your day.</h1>
        <p className="lead">Movement, nourishment, routines and reflection, all in one calm place. Choose what matters to you and leave the rest for another day.</p>
        <nav className="anchor-nav" aria-label="On this page">{features.map(item => <a key={item.id} href={'#' + item.id}>{item.title}</a>)}<a href="#more">A few more things</a></nav>
      </header>

      {features.map((item, index) => <section key={item.id} id={item.id} className={index % 2 ? 'feature-row is-reverse' : 'feature-row'}>
        <div className="feature-copy">
          <h2>{item.title}</h2>
          <p>{item.body}</p>
          <ul className="tick-list">{item.points.map(point => <li key={point}>{point}</li>)}</ul>
          <Link className="text-link" to={item.path}>Explore {item.title.toLowerCase()}<ArrowRight size={16} aria-hidden="true"/></Link>
        </div>
        {item.preview}
      </section>)}

      <section id="more" className="more-grid">
        <h2>A few thoughtful details</h2>
        <dl>{extras.map(([title, body]) => <div key={title}><dt>{title}</dt><dd>{body}</dd></div>)}</dl>
      </section>

      <div className="cta-inline"><Link to="/app" className="btn btn-primary btn-lg">Find your rhythm<ArrowRight size={20} aria-hidden="true"/></Link></div>
    </div>
  </main>;
}
