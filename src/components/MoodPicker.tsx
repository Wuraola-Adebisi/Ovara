import { Annoyed, Frown, Laugh, Meh, Smile, Waves } from 'lucide-react';

export const MOODS = [
  { label: 'Great', icon: Laugh },
  { label: 'Good', icon: Smile },
  { label: 'Okay', icon: Meh },
  { label: 'A little low', icon: Frown },
  { label: 'Not great', icon: Annoyed },
  { label: 'Anxious', icon: Waves },
] as const;

export default function MoodPicker({ value, onChange, legend, name }: { value: string; onChange: (mood: string) => void; legend: string; name: string }) {
  return <fieldset className="mood-picker">
    <legend>{legend}</legend>
    <div className="mood-grid">
      {MOODS.map(({ label, icon: Icon }) => <label className="mood-option" key={label}>
        <input type="radio" name={name} value={label} checked={value === label} onChange={() => onChange(label)}/>
        <span><Icon size={22} aria-hidden="true"/>{label}</span>
      </label>)}
    </div>
  </fieldset>;
}
