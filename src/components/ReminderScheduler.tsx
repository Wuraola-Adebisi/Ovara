import { useEffect } from 'react';
import type { WellbeingReminder } from '../lib/types';

const GRACE_MINUTES = 10;

// Runs only while Ovara is open in a browser tab. Browsers slow down timers in
// background tabs, so a reminder fires if its time passed within the last few
// minutes instead of requiring an exact minute match.
export default function ReminderScheduler() {
  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    const check = () => {
      if (Notification.permission !== 'granted') return;
      let reminders: WellbeingReminder[] = [];
      try { reminders = JSON.parse(window.localStorage.getItem('ovara.reminders') || '[]'); } catch { reminders = []; }
      const now = new Date();
      const minutesNow = now.getHours() * 60 + now.getMinutes();
      reminders.filter(item => item.enabled && item.days.includes(now.getDay()) && /^\d{2}:\d{2}$/.test(item.time)).forEach(item => {
        const [hours, minutes] = item.time.split(':').map(Number);
        const late = minutesNow - (hours * 60 + minutes);
        if (late < 0 || late > GRACE_MINUTES) return;
        const key = 'ovara.reminderSent.' + item.id;
        if (window.localStorage.getItem(key) === now.toDateString()) return;
        try {
          new Notification('Ovara: ' + item.title, { body: 'Your reminder was scheduled for ' + item.time + '.' });
          window.localStorage.setItem(key, now.toDateString());
        } catch {
          // Notification delivery can fail if browser or operating-system settings change.
        }
      });
    };
    check();
    const timer = window.setInterval(check, 30000);
    const onWake = () => { if (document.visibilityState === 'visible') check(); };
    window.addEventListener('focus', onWake);
    document.addEventListener('visibilitychange', onWake);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onWake);
      document.removeEventListener('visibilitychange', onWake);
    };
  }, []);
  return null;
}
