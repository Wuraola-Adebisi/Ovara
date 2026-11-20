import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToday } from '../hooks/useToday';
import { hasEntryOn, lastDays } from '../lib/wellbeing';

// Seven days at a glance. A tick means something was logged that day, nothing more.
export default function WeekStrip() {
  const today = useToday();
  const [activities] = useStore('activities');
  const [meals] = useStore('meals');
  const [water] = useStore('water');
  const [journals] = useStore('journals');
  const [completions] = useStore('completions');
  const data = { activities, meals, water, journals, completions };
  return <ol className="week-strip" aria-label="Days with something logged, last 7 days">
    {lastDays(7).map(({ key, date }) => {
      const logged = hasEntryOn(key, data);
      return <li key={key} className={key === today ? 'is-today' : ''}>
        <Link to="/app/calendar" aria-label={date.toLocaleDateString(undefined, { weekday: 'long' }) + (logged ? ', something logged' : ', nothing logged')}>
          <span>{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
          <i className={logged ? 'is-logged' : ''}>{logged && <Check size={16} aria-hidden="true"/>}</i>
        </Link>
      </li>;
    })}
  </ol>;
}
