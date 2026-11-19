import { useState } from 'react';
import { Bell, Check, Droplets, Footprints, Settings2 } from 'lucide-react';
import { Header, PanelTitle } from '../components/PagePrimitives';
import { usePersistentState } from '../hooks/usePersistentState';
import { defaultPreferences, type Preferences, type WellbeingReminder } from '../lib/wellbeing';

const starterReminders: WellbeingReminder[] = [
  { id: 1, title: 'Time for a glass of water', kind: 'hydration', time: '10:00', enabled: false, days: [0,1,2,3,4,5,6] },
  { id: 2, title: 'Take a mindful pause', kind: 'routine', time: '14:00', enabled: false, days: [1,2,3,4,5] },
  { id: 3, title: 'Check in with yourself', kind: 'reflection', time: '20:00', enabled: false, days: [0,1,2,3,4,5,6] },
];

export default function SettingsPage() {
  const [preferences, setPreferences] = usePersistentState<Preferences>('ovara.preferences', defaultPreferences);
  const [reminders, setReminders] = usePersistentState<WellbeingReminder[]>('ovara.reminders', starterReminders);
  const [permission, setPermission] = useState(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
  const [notice, setNotice] = useState('');
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('09:00');
  async function enableNotifications() {
    if (typeof Notification === 'undefined') { setNotice('This browser does not support notifications.'); return; }
    const result = await Notification.requestPermission();
    setPermission(result);
    setNotice(result === 'granted' ? 'Notifications are enabled for this browser.' : 'Notification permission was not granted.');
  }
  function addReminder() {
    if (!newReminderTitle.trim()) return;
    setReminders(items => [...items, { id: Date.now(), title: newReminderTitle.trim(), kind: 'custom', time: newReminderTime, enabled: false, days: [0,1,2,3,4,5,6] }]);
    setNewReminderTitle('');
  }
  function updateReminder(id: number, patch: Partial<WellbeingReminder>) {
    setReminders(items => items.map(item => item.id === id ? { ...item, ...patch } : item));
  }
  return <div className="stack">
    <Header tag="MAKE OVARA YOURS" title="Your preferences." desc="Set the units, targets and gentle reminders that work for your day."/>
    <section className="settings-grid">
      <article className="panel"><PanelTitle tag="HOW YOU TRACK" title="Your preferences"/><div className="settings-fields">
        <label>Distance units<select value={preferences.distanceUnit} onChange={e => setPreferences(p => ({ ...p, distanceUnit: e.target.value as Preferences['distanceUnit'] }))}><option value="km">Kilometres (km)</option><option value="mi">Miles (mi)</option></select></label>
        <label>Energy units<select value={preferences.energyUnit} onChange={e => setPreferences(p => ({ ...p, energyUnit: e.target.value as Preferences['energyUnit'] }))}><option value="kcal">Kilocalories (kcal)</option><option value="kj">Kilojoules (kJ)</option></select></label>
        <label>Water display<select value={preferences.waterUnit} onChange={e => setPreferences(p => ({ ...p, waterUnit: e.target.value as Preferences['waterUnit'] }))}><option value="ml">Millilitres (ml)</option><option value="oz">Fluid ounces (fl oz)</option></select></label>
        <label>Daily water target (ml)<input type="number" min="250" max="10000" step="250" value={preferences.dailyWaterTargetMl} onChange={e => setPreferences(p => ({ ...p, dailyWaterTargetMl: Math.max(250, Number(e.target.value) || 250) }))}/></label>
        <label>Daily step target<input type="number" min="500" max="50000" step="500" value={preferences.dailyStepTarget} onChange={e => setPreferences(p => ({ ...p, dailyStepTarget: Math.max(500, Number(e.target.value) || 500) }))}/></label>
        <label>Week starts on<select value={preferences.weekStartsOn} onChange={e => setPreferences(p => ({ ...p, weekStartsOn: Number(e.target.value) as 0 | 1 }))}><option value={1}>Monday</option><option value={0}>Sunday</option></select></label>
      </div><p className="settings-note"><Settings2 size={15}/> Changes are saved automatically on this device.</p></article>
      <article className="panel"><PanelTitle tag="GENTLE NUDGES" title="Reminders"/><p className="muted-copy">Choose when Ovara should remind you. Notifications are checked while the workspace is open in this browser.</p><button className="btn outline small notification-button" onClick={enableNotifications}><Bell size={14}/> {permission === 'granted' ? 'Notifications enabled' : 'Enable browser notifications'}</button>{notice && <p className="settings-note"><Check size={14}/>{notice}</p>}<div className="add-reminder"><input aria-label="New reminder name" value={newReminderTitle} onChange={e=>setNewReminderTitle(e.target.value)} placeholder="Add a reminder"/><input aria-label="New reminder time" type="time" value={newReminderTime} onChange={e=>setNewReminderTime(e.target.value)}/><button className="btn outline small" onClick={addReminder} type="button">Add</button></div><div className="reminder-list">{reminders.map(item => <div className="reminder-item" key={item.id}><div><b>{item.title}</b><small>{item.kind[0].toUpperCase() + item.kind.slice(1)}</small><input aria-label={'Reminder time for ' + item.title} type="time" value={item.time} onChange={e => updateReminder(item.id, { time: e.target.value })}/><div className="reminder-days">{['S','M','T','W','T','F','S'].map((day,index)=><button type="button" key={index} aria-label={'Toggle ' + ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][index]} className={item.days.includes(index)?'active':''} onClick={()=>updateReminder(item.id,{days:item.days.includes(index)?item.days.filter(value=>value!==index):[...item.days,index]})}>{day}</button>)}</div></div><label className="switch"><input type="checkbox" checked={item.enabled} onChange={e => updateReminder(item.id, { enabled: e.target.checked })}/><span/></label></div>)}</div><p className="settings-note"><Droplets size={14}/> Reminder alerts do not run after the browser is closed. Background reminders can be added with push infrastructure later.</p></article>
    </section>
  </div>;
}
