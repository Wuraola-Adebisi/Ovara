import { useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ActivityPreview, FoodPreview, GoalsPreview, InsightsPreview, JournalPreview, RoutinesPreview } from './previews';

type Tab = { id: string; label: string; title: string; body: string; points: string[]; path: string; preview: ReactNode };

const tabs: Tab[] = [
  { id: 'activity', label: 'Movement', title: 'Make space for movement', body: 'Keep a note of walks, workouts, stretches and all the ways you move. Add the details that matter to you, then look back over your week.', points: ['Add or change a past activity', 'See how your week is taking shape', 'Track time, steps or distance'], path: '/app/activity', preview: <ActivityPreview/> },
  { id: 'food', label: 'Food and water', title: 'Nourish yourself, your way', body: 'Keep simple notes about meals, snacks and water. Add as much or as little detail as feels useful to you.', points: ['Look back at any day', 'Add an optional energy estimate', 'Choose the units that feel familiar'], path: '/app/nutrition', preview: <FoodPreview/> },
  { id: 'routines', label: 'Routines', title: 'Make room for the little things', body: 'Choose a few things you would like to make time for. Keep them visible through the day and see how they fit into your week.', points: ['Group things by time of day', 'Look back at your week', 'Change your list whenever life changes'], path: '/app/routines', preview: <RoutinesPreview/> },
  { id: 'journal', label: 'Journal', title: 'Give your thoughts somewhere to go', body: 'Check in with how you feel and write whatever is on your mind. Your journal is yours to revisit whenever you need it.', points: ['Find an earlier note', 'Use a daily prompt when you need a start', 'Write for today or a day gone by'], path: '/app/journal', preview: <JournalPreview/> },
  { id: 'goals', label: 'Goals', title: 'Choose what matters to you', body: 'Set a personal target for movement, water, routines or reflection. Your progress follows what you already record.', points: ['Choose a daily, weekly or monthly rhythm', 'Adjust your target as you go', 'See how things are changing over time'], path: '/app/goals', preview: <GoalsPreview/> },
  { id: 'insights', label: 'Insights', title: 'Notice the shape of your weeks', body: 'Look back at recent days and months. See your activity, routines, water and reflections together, and notice what stands out.', points: ['Compare one week with the one before', 'See your days at a glance', 'Explore patterns in your own notes'], path: '/app/insights', preview: <InsightsPreview/> },
];

export default function ProductTour() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const next = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (index === last ? 0 : index + 1)
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (index === 0 ? last : index - 1)
      : event.key === 'Home' ? 0 : event.key === 'End' ? last : -1;
    if (next < 0) return;
    event.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  }

  const tab = tabs[active];
  return <div className="tour">
    <div className="tour-tabs" role="tablist" aria-label="Ways to use Ovara" aria-orientation="vertical">
      {tabs.map((item, index) => <button key={item.id} ref={element => { refs.current[index] = element; }} type="button" role="tab" id={'tour-tab-' + item.id} aria-selected={active === index} aria-controls="tour-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => onKeyDown(event, index)}>{item.label}</button>)}
    </div>
    <div className="tour-panel" role="tabpanel" id="tour-panel" aria-labelledby={'tour-tab-' + tab.id}>
      <div className="tour-copy">
        <h3>{tab.title}</h3>
        <p>{tab.body}</p>
        <ul className="tick-list">{tab.points.map(point => <li key={point}>{point}</li>)}</ul>
        <Link className="text-link" to={tab.path}>Explore {tab.label.toLowerCase()}<ArrowRight size={16} aria-hidden="true"/></Link>
      </div>
      {tab.preview}
    </div>
  </div>;
}
