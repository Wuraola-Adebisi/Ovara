import { useEffect, useState } from 'react';
import { localDate } from '../lib/wellbeing';

/** Today's date key. Updates when the day changes while the app is open or the tab comes back into focus. */
export function useToday() {
  const [today, setToday] = useState(() => localDate());
  useEffect(() => {
    const refresh = () => setToday(localDate());
    const timer = window.setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return today;
}
