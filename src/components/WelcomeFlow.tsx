import { useState } from 'react';
import type { FormEvent } from 'react';
import { Activity, ArrowRight, Check } from 'lucide-react';
import type { UserProfile } from '../context/ProfileContext';

const goals = ['Feel more balanced', 'Build consistent routines', 'Move more often', 'Eat more mindfully', 'Improve my sleep', 'Understand my wellbeing'];
const interests = ['Movement', 'Nutrition', 'Hydration', 'Routines', 'Reflection', 'Rest'];

export default function WelcomeFlow({ onComplete }: { onComplete: (profile: UserProfile) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Movement', 'Nutrition', 'Routines']);
  const [error, setError] = useState('');

  function toggle(value: string, selected: string[], setter: (values: string[]) => void) {
    setter(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Add your name and email to continue.');
      return;
    }
    if (!/^\\S+@\\S+\\.\\S+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setStep(1);
  }

  function finish() {
    onComplete({ name: name.trim(), email: email.trim().toLowerCase(), goals: selectedGoals, interests: selectedInterests, createdAt: new Date().toISOString() });
  }

  return <main className="welcome-screen"><section className="welcome-card"><div className="welcome-brand"><span className="brand-icon"><Activity size={19}/></span><b>ovara<span>.</span></b></div>{step === 0 ? <form onSubmit={submit}><label className="welcome-eyebrow">A SPACE FOR YOUR WELLBEING</label><h1>Make room for a better everyday.</h1><p>Start by creating your personal space. You can update your details and preferences later.</p><label className="welcome-label" htmlFor="profile-name">What should we call you?</label><input id="profile-name" value={name} onChange={event => setName(event.target.value)} placeholder="Your name" autoComplete="name" required/><label className="welcome-label" htmlFor="profile-email">Email address</label><input id="profile-email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required/>{error && <p className="welcome-error">{error}</p>}<button className="btn dark welcome-submit" type="submit">Continue <ArrowRight size={16}/></button><small className="welcome-note">This early access build stores your profile in this browser. It does not create a secure account or send email.</small></form> : <div><label className="welcome-eyebrow">LET'S MAKE IT YOURS</label><h1>What would you like to focus on?</h1><p>Choose what matters to you. There are no right or wrong answers.</p><label className="welcome-label">Your wellbeing goals</label><div className="choice-grid">{goals.map(goal => <button type="button" key={goal} className={selectedGoals.includes(goal) ? 'choice selected' : 'choice'} onClick={() => toggle(goal, selectedGoals, setSelectedGoals)}><span>{selectedGoals.includes(goal) && <Check size={13}/>}</span>{goal}</button>)}</div><label className="welcome-label">Areas you want to track</label><div className="choice-grid">{interests.map(item => <button type="button" key={item} className={selectedInterests.includes(item) ? 'choice selected' : 'choice'} onClick={() => toggle(item, selectedInterests, setSelectedInterests)}><span>{selectedInterests.includes(item) && <Check size={13}/>}</span>{item}</button>)}</div><div className="welcome-actions"><button className="btn outline" onClick={() => setStep(0)}>Back</button><button className="btn dark" onClick={finish}>Enter Ovara <ArrowRight size={16}/></button></div></div>}</section><p className="welcome-footer">A more considered way to care for yourself.</p></main>;
}
