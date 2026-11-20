import { useState } from 'react';
import type { FormEvent } from 'react';
import { Bell, Download, Trash2 } from 'lucide-react';
import { exportAllData, resetAllData, useStore } from '../lib/store';
import { useProfile } from '../context/ProfileContext';
import { useUndoRemove } from '../hooks/useUndoRemove';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { Card, PageHeader } from '../components/PagePrimitives';
import type { Preferences, WellbeingReminder } from '../lib/types';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsPage() {
  const { profile, setProfile } = useProfile();
  const toast = useToast();
  const [preferences, setPreferences] = useStore('preferences');
  const [reminders, setReminders] = useStore('reminders');
  const removeReminder = useUndoRemove(reminders, setReminders);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
  const [notice, setNotice] = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [confirmReset, setConfirmReset] = useState(false);
  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');

  const setPref = <K extends keyof Preferences>(key: K, value: Preferences[K]) => setPreferences(current => ({ ...current, [key]: value }));
  const clampNumber = (raw: string, min: number, max: number) => Math.min(max, Math.max(min, Number(raw) || min));

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setProfile(current => current ? { ...current, name: name.trim(), email: email.trim().toLowerCase() } : current);
    toast.show('Profile saved');
  }

  async function requestPermission() {
    if (typeof Notification === 'undefined') { setNotice('This browser does not support notifications.'); return 'unsupported' as const; }
    const result = await Notification.requestPermission();
    setPermission(result);
    setNotice(result === 'granted' ? 'Notifications are on for this browser.' : 'Notifications were not allowed, so reminders will not appear. You can change this in your browser settings.');
    return result;
  }

  async function updateReminder(id: number, patch: Partial<WellbeingReminder>) {
    // A reminder that can never show is worse than no reminder, so ask for permission when one is switched on.
    if (patch.enabled && permission !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') return;
    }
    setReminders(items => items.map(item => item.id === id ? { ...item, ...patch } : item));
  }

  function addReminder(event: FormEvent) {
    event.preventDefault();
    if (!reminderTitle.trim()) return;
    setReminders(items => [...items, { id: Date.now(), title: reminderTitle.trim(), kind: 'custom', time: reminderTime, enabled: false, days: [0, 1, 2, 3, 4, 5, 6] }]);
    setReminderTitle('');
  }

  function download() {
    const blob = new Blob([exportAllData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ovara-data-' + new Date().toISOString().slice(0, 10) + '.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    resetAllData();
    window.location.assign('/app');
  }

  return <div className="stack">
    <PageHeader title="Preferences" desc="Units, targets, reminders and your data."/>

    <Card title="Your details">
      <form onSubmit={saveProfile}>
        <div className="form-grid">
          <label className="field">Name<input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required/></label>
          <label className="field">Email (optional)<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email"/></label>
        </div>
        <div className="btn-row"><button type="submit" className="btn btn-primary">Save details</button></div>
      </form>
    </Card>

    <div className="grid-2">
      <Card title="Units and targets">
        <div className="form-grid single">
          <label className="field">Distance<select value={preferences.distanceUnit} onChange={event => setPref('distanceUnit', event.target.value as Preferences['distanceUnit'])}><option value="km">Kilometres</option><option value="mi">Miles</option></select></label>
          <label className="field">Energy<select value={preferences.energyUnit} onChange={event => setPref('energyUnit', event.target.value as Preferences['energyUnit'])}><option value="kcal">Kilocalories</option><option value="kj">Kilojoules</option></select></label>
          <label className="field">Water<select value={preferences.waterUnit} onChange={event => setPref('waterUnit', event.target.value as Preferences['waterUnit'])}><option value="ml">Millilitres</option><option value="oz">Fluid ounces</option></select></label>
          <label className="field">Daily water target in ml<input type="number" inputMode="numeric" min="250" max="10000" step="250" value={preferences.dailyWaterTargetMl} onChange={event => setPref('dailyWaterTargetMl', clampNumber(event.target.value, 250, 10000))}/></label>
          <label className="field">Daily step target<input type="number" inputMode="numeric" min="500" max="50000" step="500" value={preferences.dailyStepTarget} onChange={event => setPref('dailyStepTarget', clampNumber(event.target.value, 500, 50000))}/></label>
          <label className="field">Week starts on<select value={preferences.weekStartsOn} onChange={event => setPref('weekStartsOn', Number(event.target.value) as 0 | 1)}><option value={1}>Monday</option><option value={0}>Sunday</option></select></label>
        </div>
        <p className="muted small-print">Changes save automatically on this device.</p>
      </Card>

      <Card title="Reminders">
        <p className="muted">Reminders only appear while Ovara is open in a browser tab.</p>
        <div className="btn-row">
          <button type="button" className="btn btn-secondary" onClick={requestPermission} disabled={permission === 'granted' || permission === 'unsupported'}><Bell size={18} aria-hidden="true"/>{permission === 'granted' ? 'Notifications are on' : 'Allow notifications'}</button>
        </div>
        <p className="muted small-print" role="status">{notice}</p>
        <ul className="rows reminder-list">
          {reminders.map(item => <li className="reminder" key={item.id}>
            <div className="reminder-top">
              <label className="switch"><input type="checkbox" checked={item.enabled} onChange={event => updateReminder(item.id, { enabled: event.target.checked })}/><span className="switch-track" aria-hidden="true"/><span className="switch-label">{item.title}</span></label>
              <button type="button" className="icon-btn" aria-label={'Remove reminder ' + item.title} onClick={() => removeReminder(item.id, item.title)}><Trash2 size={18}/></button>
            </div>
            <div className="reminder-bottom">
              <input className="time-input" aria-label={'Time for ' + item.title} type="time" value={item.time} onChange={event => updateReminder(item.id, { time: event.target.value })}/>
              <div className="day-toggles" role="group" aria-label={'Days for ' + item.title}>
                {dayNames.map((day, index) => <button type="button" key={day} aria-label={day} aria-pressed={item.days.includes(index)} onClick={() => updateReminder(item.id, { days: item.days.includes(index) ? item.days.filter(value => value !== index) : [...item.days, index] })}>{day[0]}</button>)}
              </div>
            </div>
          </li>)}
        </ul>
        <form className="add-reminder" onSubmit={addReminder}>
          <label className="field">New reminder<input value={reminderTitle} onChange={event => setReminderTitle(event.target.value)} placeholder="Stretch"/></label>
          <label className="field">Time<input type="time" value={reminderTime} onChange={event => setReminderTime(event.target.value)}/></label>
          <button type="submit" className="btn btn-secondary">Add</button>
        </form>
      </Card>
    </div>

    <Card title="Your data">
      <p className="muted">Everything in Ovara is stored in this browser. There is no account and no backup, so download a copy before clearing browser data or switching devices.</p>
      <div className="btn-row">
        <button type="button" className="btn btn-secondary" onClick={download}><Download size={18} aria-hidden="true"/>Download my data</button>
        <button type="button" className="btn btn-danger-outline" onClick={() => setConfirmReset(true)}><Trash2 size={18} aria-hidden="true"/>Reset my space</button>
      </div>
    </Card>

    <ConfirmDialog open={confirmReset} title="Reset your space?" confirmLabel="Delete everything" danger onConfirm={reset} onCancel={() => setConfirmReset(false)}>
      <p>This deletes your profile, entries, goals and reminders from this browser. It cannot be undone. Download your data first if you want a copy.</p>
    </ConfirmDialog>
  </div>;
}
