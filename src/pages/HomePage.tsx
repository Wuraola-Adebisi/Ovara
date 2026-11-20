import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageTitle } from '../components/PagePrimitives';

const features = [
  ['Activity', 'Log walks, workouts and stretches with duration, steps and distance. A weekly chart shows how your days compare with your step target.'],
  ['Food and water', 'Note what you ate and count glasses of water. Energy estimates are optional and there is no calorie goal.'],
  ['Routines', 'Make a short list of things you want to do regularly and tick them off each day. Your history stays after the list resets.'],
  ['Journal', 'Pick a mood and write a few lines once a day. Past entries are kept in a simple list.'],
  ['Goals', 'Set a daily, weekly or monthly target for steps, active time, water, routines or journal entries and watch progress fill in.'],
  ['Insights and calendar', 'See totals for the week or month, and open any day on the calendar to see everything you logged.'],
] as const;

const steps = [
  ['Set up in a minute', 'Enter a name and pick the areas you want to track. There is no account and no password.'],
  ['Log as you go', 'Add a walk, a glass of water or a mood from any page. Entries save on your device straight away.'],
  ['Look back', 'Charts, goals and the calendar show what you logged. Download everything as a file whenever you like.'],
] as const;

const principles = [
  ['No required calorie target', 'Energy estimates are optional. Ovara never tells you how much to eat.'],
  ['Your data stays on your device', 'There is no server holding your entries, so only people with access to your browser can read them.'],
  ['Use only what you need', 'Choose the areas you care about and the Today page leads with them. Every other page stays one tap away.'],
  ['Not medical care', 'Ovara is for everyday notes. It cannot diagnose or treat anything.'],
] as const;

const faq = [
  ['What can I keep track of?', 'Activity, meals, water, routines, mood and a daily journal entry. You can set goals for most of them.'],
  ['Where is my data stored?', 'In your browser on the device you use. Ovara has no accounts and does not send your entries anywhere.'],
  ['Can I use it on a second device?', 'Not yet. You can download your data as a file from the Preferences page, but importing that file on another device is not built.'],
  ['Is this a medical or fitness programme?', 'No. It is a personal log. It does not give medical advice or a training plan.'],
] as const;

export default function HomePage() {
  usePageTitle('Feel good in your own way');
  return <main id="main">
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1>Feel good in your own way.</h1>
          <p>Ovara is a daily tracker for movement, food, water, routines and mood. It keeps your entries on your device and does not ask you to hit a calorie target.</p>
          <div className="btn-row">
            <Link to="/app" className="btn btn-primary btn-lg">Open your space<ArrowRight size={20} aria-hidden="true"/></Link>
            <Link to="/#how-it-works" className="btn btn-secondary btn-lg">How it works</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="preview">
            <div className="preview-head"><b>Today so far</b><span>Example</span></div>
            <div className="glance-row"><div className="glance-top"><span>Steps</span><b>6,240<small> of 7,000</small></b></div><div className="meter"><i style={{ width: '89%' }}/></div></div>
            <div className="glance-row"><div className="glance-top"><span>Water</span><b>1.5<small> of 2 L</small></b></div><div className="meter"><i style={{ width: '75%' }}/></div></div>
            <div className="glance-row"><div className="glance-top"><span>Routines</span><b>3<small> of 4</small></b></div><div className="meter"><i style={{ width: '75%' }}/></div></div>
            <div className="preview-mood"><span>Mood</span><b>Good</b></div>
          </div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <h2 className="section-title">What Ovara keeps track of</h2>
        <dl className="feature-list">{features.map(([title, body]) => <div key={title}><dt>{title}</dt><dd>{body}</dd></div>)}</dl>
      </div>
    </section>

    <section className="section band" id="how-it-works">
      <div className="container">
        <h2 className="section-title">How it works</h2>
        <ol className="steps">{steps.map(([title, body], index) => <li key={title}><span className="step-number">{index + 1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <h2 className="section-title">What Ovara does differently</h2>
        <dl className="principles">{principles.map(([title, body]) => <div key={title}><dt>{title}</dt><dd>{body}</dd></div>)}</dl>
      </div>
    </section>

    <section className="section band">
      <div className="container faq-grid">
        <h2 className="section-title">Questions</h2>
        <div className="faq-list">{faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      </div>
    </section>

    <section className="section">
      <div className="container cta-block">
        <h2>Start with today.</h2>
        <p>Set up takes about a minute and you can change everything later.</p>
        <Link to="/app" className="btn btn-primary btn-lg">Open your space<ArrowRight size={20} aria-hidden="true"/></Link>
      </div>
    </section>
  </main>;
}
