import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import type { UserProfile } from '../lib/types';
import Wordmark from './Wordmark';
import { usePageTitle } from './PagePrimitives';

const goals = ['Feel more balanced', 'Build consistent routines', 'Move more often', 'Eat more mindfully', 'Improve my sleep', 'Understand my wellbeing'];
const interests = ['Movement', 'Nutrition', 'Hydration', 'Routines', 'Reflection'];

function ChoiceGroup({ legend, options, selected, onToggle }: { legend: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <fieldset className="choice-group">
    <legend>{legend}</legend>
    <div className="choice-grid">
      {options.map(option => <label className="choice" key={option}><input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)}/><span>{option}</span></label>)}
    </div>
  </fieldset>;
}

export default function WelcomeFlow({ onComplete }: { onComplete: (profile: UserProfile) => void }) {
  usePageTitle('Set up your space');
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Movement', 'Nutrition', 'Routines']);
  const [error, setError] = useState('');

  const toggle = (value: string, list: string[], setList: (values: string[]) => void) => setList(list.includes(value) ? list.filter(item => item !== value) : [...list, value]);

  function next(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { setError('Enter a name so Ovara knows what to call you.'); return; }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) { setError('That email address looks incomplete. Fix it or leave the field empty.'); return; }
    setError('');
    setStep(1);
  }

  function finish(event: FormEvent) {
    event.preventDefault();
    onComplete({ name: name.trim(), email: email.trim().toLowerCase(), goals: selectedGoals, interests: selectedInterests, createdAt: new Date().toISOString() });
  }

  return <main className="welcome" id="main">
    <div className="welcome-card">
      <Wordmark/>
      {step === 0 ? <form key="step-details" onSubmit={next} noValidate>
        <h1>Set up your space</h1>
        <p className="muted">Your entries stay in this browser. Nothing is sent to a server.</p>
        <label className="field">What should we call you?<input value={name} onChange={event => setName(event.target.value)} autoComplete="given-name" aria-invalid={Boolean(error) && !name.trim()} aria-describedby={error ? 'welcome-error' : undefined} autoFocus/></label>
        <label className="field">Email (optional)<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" aria-describedby="email-help"/><small id="email-help">Only used to show your details here. Leave it empty if you prefer.</small></label>
        {error && <p className="form-error" id="welcome-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block">Continue<ArrowRight size={18} aria-hidden="true"/></button>
      </form> : <form key="step-focus" onSubmit={finish}>
        <h1>What do you want to focus on?</h1>
        <p className="muted">Pick anything that applies. You can skip this.</p>
        <ChoiceGroup legend="Your goals" options={goals} selected={selectedGoals} onToggle={value => toggle(value, selectedGoals, setSelectedGoals)}/>
        <ChoiceGroup legend="What you want to track" options={interests} selected={selectedInterests} onToggle={value => toggle(value, selectedInterests, setSelectedInterests)}/>
        <p className="muted small-print">The areas you pick lead on your Today page. Every page stays available.</p>
        <div className="btn-row">
          <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>Back</button>
          <button type="submit" className="btn btn-primary">Open my space<ArrowRight size={18} aria-hidden="true"/></button>
        </div>
      </form>}
    </div>
  </main>;
}
