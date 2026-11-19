import { useEffect } from 'react';

// Reads the saved schedule on each check so changes made in Preferences are picked up.
export default function ReminderScheduler() {
  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    const check = () => {
      let reminders: { id: number; title: string; time: string; enabled: boolean; days: number[] }[] = [];
      try {
        reminders = JSON.parse(window.localStorage.getItem('ovara.reminders') || '[]');
      } catch {
        reminders = [];
      }
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
  }, []);
  return null;
}
