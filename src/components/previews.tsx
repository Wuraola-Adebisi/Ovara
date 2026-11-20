import { Check, Frown, Laugh, Meh, Smile } from 'lucide-react';
import type { ReactNode } from 'react';

// Static examples of real screens, used on the public pages. They reuse the app's own classes.

function Meter({ percent }: { percent: number }) {
  return <div className={percent >= 100 ? 'meter is-full' : 'meter'}><i style={{ width: percent + '%' }}/></div>;
}

export function PreviewFrame({ title, children }: { title: string; children: ReactNode }) {
  return <div className="preview" aria-hidden="true">
    <div className="preview-head"><b>{title}</b><span>Example</span></div>
    {children}
  </div>;
}

export function ActivityPreview() {
  const bars = [60, 75, 12, 92, 18, 55, 88];
  return <PreviewFrame title="Steps, last 7 days">
    <div className="chart"><div className="chart-plot" style={{ height: 120 }}>
      <div className="chart-target" style={{ bottom: '70%' }}><span>Target</span></div>
      {bars.map((value, index) => <div className="chart-col" key={index}><div className={index === 6 ? 'chart-bar is-today' : 'chart-bar'} style={{ height: value + '%' }}/></div>)}
    </div></div>
    <ul className="rows">
      <li className="row"><div className="row-main"><b>Morning walk</b><small>Walking, today</small></div><div className="row-side"><b>31 min</b><small>6,240 steps</small></div></li>
      <li className="row"><div className="row-main"><b>Home workout</b><small>Strength, Wednesday</small></div><div className="row-side"><b>35 min</b></div></li>
    </ul>
  </PreviewFrame>;
}

export function FoodPreview() {
  return <PreviewFrame title="Food and water">
    <ul className="rows">
      <li className="row"><div className="row-main"><b>Oatmeal with banana</b><small>Breakfast, 8:15 AM</small></div></li>
      <li className="row"><div className="row-main"><b>Rice bowl with vegetables</b><small>Lunch, 1:10 PM</small></div><div className="row-side"><b>560</b><small>kcal</small></div></li>
    </ul>
    <div className="glance-row"><div className="glance-top"><span>Water</span><b>1.5<small> of 2 L</small></b></div><Meter percent={75}/></div>
  </PreviewFrame>;
}

export function RoutinesPreview() {
  const rows = [['Drink a glass of water', 'Morning', true], ['Take a mindful pause', 'Anytime', true], ['Get some movement', 'Afternoon', false], ['Wind down for the evening', 'Evening', false]] as const;
  return <PreviewFrame title="Routines">
    <ul className="check-list">{rows.map(([title, time, done]) => <li key={title}><div className="check-row"><span className="check-box" style={done ? { background: 'var(--color-accent)', borderColor: 'var(--color-accent)', color: '#fff' } : undefined}>{done && <Check size={16}/>}</span><span className="check-text"><b>{title}</b><small>{time}</small></span></div></li>)}</ul>
  </PreviewFrame>;
}

export function JournalPreview() {
  const moods = [[Laugh, 'Great'], [Smile, 'Good'], [Meh, 'Okay'], [Frown, 'A little low']] as const;
  return <PreviewFrame title="Journal">
    <div className="mood-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>{moods.map(([Icon, label], index) => <span key={label} className="mood-option"><span style={index === 1 ? { background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent)' } : undefined}><Icon size={22}/>{label}</span></span>)}</div>
    <p className="entry-note" style={{ marginTop: 16 }}>Long day, but the evening walk helped.</p>
  </PreviewFrame>;
}

export function InsightsPreview() {
  return <PreviewFrame title="Insights, last 7 days">
    <dl className="stat-strip" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', marginBottom: 16 }}>
      <div><dt>Active minutes</dt><dd>210</dd><small className="stat-note">Up 45 min from the period before</small></div>
      <div><dt>Water</dt><dd>9.4<small> L</small></dd><small className="stat-note">6 days recorded</small></div>
    </dl>
    <ul className="hbars">
      <li><span>Walking</span><div className="meter"><i style={{ width: '100%' }}/></div><b>157 min</b></li>
      <li><span>Strength</span><div className="meter"><i style={{ width: '22%' }}/></div><b>35 min</b></li>
    </ul>
  </PreviewFrame>;
}

export function GoalsPreview() {
  return <PreviewFrame title="Goals">
    <div className="goal"><div className="goal-top"><div><b>Move most days</b><small>Active minutes per week</small></div></div><Meter percent={74}/><div className="goal-foot"><span>111 min of 150 min</span><b>74%</b></div></div>
    <div className="goal" style={{ marginTop: 16 }}><div className="goal-top"><div><b>Drink enough water</b><small>Water per day</small></div></div><Meter percent={100}/><div className="goal-foot"><span>2,000 ml of 2,000 ml</span><b>Reached</b></div></div>
  </PreviewFrame>;
}
