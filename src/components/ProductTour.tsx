import { useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ActivityPreview, FoodPreview, GoalsPreview, InsightsPreview, JournalPreview, RoutinesPreview } from './previews';

type Tab = { id: string; label: string; title: string; body: string; points: string[]; path: string; preview: ReactNode };

const tabs: Tab[] = [
  { id: 'activity', label: 'Activity', title: 'Log movement in a few taps', body: 'Record a walk, a workout or a stretch with duration, and steps or distance if you track them. A weekly chart shows each day against your step target.', points: ['Edit or remove any entry later', 'Break down minutes by type of activity', 'Distance in kilometres or miles'], path: '/app/activity', preview: <ActivityPreview/> },
  { id: 'food', label: 'Food and water', title: 'Note food, count water', body: 'Add what you ate, grouped by meal. Energy estimates are optional and there is never a calorie target. Water is counted in glasses of 250 ml.', points: ['Look back at any earlier day', 'Energy in kcal or kJ, stored once and converted', 'A 7 day water chart in ml or fluid ounces'], path: '/app/nutrition', preview: <FoodPreview/> },
  { id: 'routines', label: 'Routines', title: 'A short list that resets each day', body: 'Make a list of things you want to do regularly, give each a time of day, and tick them off. Your history stays, so you can see how a routine has gone.', points: ['Grouped into morning, afternoon and evening', 'A 7 day grid per routine, with no streak counter', 'Rename or remove routines at any time'], path: '/app/routines', preview: <RoutinesPreview/> },
  { id: 'journal', label: 'Journal', title: 'A mood and a few lines', body: 'Pick how you feel and write as much as you like. One entry a day, and you can go back and write for an earlier day too.', points: ['Search your past entries', 'A new prompt every day, if you want one', 'Moods are not scored unless they sit on a scale'], path: '/app/journal', preview: <JournalPreview/> },
  { id: 'goals', label: 'Goals', title: 'Targets that fill in on their own', body: 'Choose a measure and a time frame, such as 150 active minutes a week. Progress comes from what you already logged, so there is nothing extra to update.', points: ['Daily, weekly or monthly', 'Start from a suggestion and edit it', 'Hitting a target is marked once, with no pressure after'], path: '/app/goals', preview: <GoalsPreview/> },
  { id: 'insights', label: 'Insights', title: 'See how a week compares', body: 'Totals for the last 7 days or the month, compared with the period before, with a day by day chart and a mood timeline. All calculated on your device.', points: ['Switch between steps, minutes and water', 'A calendar showing everything by day', 'Plain observations, never medical advice'], path: '/app/insights', preview: <InsightsPreview/> },
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
    <div className="tour-tabs" role="tablist" aria-label="Parts of Ovara" aria-orientation="vertical">
      {tabs.map((item, index) => <button key={item.id} ref={element => { refs.current[index] = element; }} type="button" role="tab" id={'tour-tab-' + item.id} aria-selected={active === index} aria-controls="tour-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => onKeyDown(event, index)}>{item.label}</button>)}
    </div>
    <div className="tour-panel" role="tabpanel" id="tour-panel" aria-labelledby={'tour-tab-' + tab.id}>
      <div className="tour-copy">
        <h3>{tab.title}</h3>
        <p>{tab.body}</p>
        <ul className="tick-list">{tab.points.map(point => <li key={point}>{point}</li>)}</ul>
        <Link className="text-link" to={tab.path}>Open {tab.label.toLowerCase()}<ArrowRight size={16} aria-hidden="true"/></Link>
      </div>
      {tab.preview}
    </div>
  </div>;
}
