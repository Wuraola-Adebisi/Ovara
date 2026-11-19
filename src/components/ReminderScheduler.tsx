import { useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import type { WellbeingReminder } from '../lib/wellbeing';

// Mounted at the workspace shell so reminders remain active across every app section.
export default function ReminderScheduler() {
  const [reminders] = usePersistentState<WellbeingReminder[]>('ovara.reminders', []);
  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    const check = () => {
      const now = new Date();
      const day = now.getDay();
      const time = [String(now.getHours()).padStart(2, '0'), String(now.getMinutes()).padStart(2, '0')].join(':');
      reminders.filter(item => item.enabled && item.time === time && item.days.includes(day)).forEach(item => {
        const key = 'ovara.reminder.last.' + item.id;
        if (window.sessionStorage.getItem(key) === now.toDateString()) return;
        if (Notification.permission === 'granted') {
          new Notification('Ovara · ' + item.title, { body: 'A gentle reminder, at a time you chose.' });
          window.sessionStorage.setItem(key, now.toDateString());
        }
      });
    };
    check();
    const timer = window.setInterval(check, 30000);
    return () => window.clearInterval(timer);
  }, [reminders]);
  return null;
}
