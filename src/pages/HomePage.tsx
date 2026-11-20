import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { usePageTitle } from '../components/PagePrimitives';
import ProductTour from '../components/ProductTour';
import { homeFaq } from '../data/faq';

const scenarios = [
  ['Building a walking habit', 'Log each walk, watch the weekly chart against your step target, and set a weekly minutes goal that fills in by itself.', '/app/activity', 'Open activity'],
  ['Seeing how food and mood connect', 'Note meals without numbers, check in with a mood each day, and look at both side by side on the calendar.', '/app/calendar', 'Open the calendar'],
  ['Keeping a private journal', 'One entry a day, searchable, stored only in your browser. Download it any time as a file you own.', '/app/journal', 'Open the journal'],
  ['Making a routine stick', 'Put a few small things on a list, group them by time of day and see a 7 day grid with no streaks to protect.', '/app/routines', 'Open routines'],
] as const;

const is = ['A daily log for movement, food, water, routines and mood', 'Private by design, with every entry kept in your browser', 'Flexible, so you can use one page or all of them', 'Honest about its limits, listed on the approach page'];
const isNot = ['A calorie counter or a diet plan', 'A medical device or a source of health advice', 'A social app with feeds, rankings or streaks', 'A cloud service that holds a copy of your entries'];

const steps = [
  ['Set up', 'Enter a name and pick the areas you want to track. It takes about a minute and there is no password.'],
  ['Log as you go', 'Add a walk, a glass of water or a mood from any page. Entries save on your device straight away.'],
  ['Look back', 'Charts, goals and the calendar show what you logged. Download everything as a file whenever you like.'],
] as const;

export default function HomePage() {
  usePageTitle('Feel good in your own way');
  return <main id="main">
    <section className="hero-dark">
      <div className="container">
        <div className="hero-head">
          <h1>Feel good in your own way.</h1>
          <div className="hero-side">
            <p>Ovara is a daily tracker for movement, food, water, routines and mood. It keeps your entries on your device and never asks you to hit a calorie target.</p>
            <div className="btn-row">
              <Link to="/app" className="btn btn-primary btn-lg">Open your space<ArrowRight size={20} aria-hidden="true"/></Link>
              <Link to="/features" className="btn btn-secondary-dark btn-lg">See what it does</Link>
            </div>
          </div>
        </div>

        <div className="day" aria-label="An example day in Ovara">
          <article className="day-card day-morning">
            <h2>Morning</h2>
            <ul>
              <li><Check size={18} aria-hidden="true"/>A glass of water</li>
              <li><Check size={18} aria-hidden="true"/>20 minute walk, 2,400 steps</li>
              <li><Check size={18} aria-hidden="true"/>A mindful pause</li>
            </ul>
          </article>
          <article className="day-card day-afternoon">
            <h2>Afternoon</h2>
            <p className="day-line">Lunch: rice bowl with vegetables</p>
            <div className="glance-row"><div className="glance-top"><span>Water</span><b>1.0<small> of 2 L</small></b></div><div className="meter"><i style={{ width: '50%' }}/></div></div>
            <div className="glance-row"><div className="glance-top"><span>Steps</span><b>5,100<small> of 7,000</small></b></div><div className="meter"><i style={{ width: '73%' }}/></div></div>
          </article>
          <article className="day-card day-evening">
            <h2>Evening</h2>
            <p className="day-mood">Mood: Good</p>
            <p className="day-line">"Long day, but the walk helped."</p>
            <p className="day-line">Routines: 3 of 4</p>
          </article>
        </div>
        <p className="day-caption">An example day. Everything you log in Ovara works this way, one entry at a time.</p>
      </div>
    </section>

    <section className="section">
      <div className="container statement">
        <p>Most trackers measure one thing. A day is made of several, and they affect each other. Ovara keeps them in one place so you can see how a long walk or a skipped lunch fits into the rest of your week.</p>
        <Link className="text-link" to="/about">Read how Ovara thinks about it<ArrowRight size={16} aria-hidden="true"/></Link>
      </div>
    </section>

    <section className="section band">
      <div className="container">
        <h2 className="section-title">A closer look at each part</h2>
        <ProductTour/>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <h2 className="section-title">Ways people might use it</h2>
        <ul className="scenarios">{scenarios.map(([title, body, path, cta]) => <li key={title}>
          <h3>{title}</h3>
          <p>{body}</p>
          <Link className="text-link" to={path}>{cta}<ArrowRight size={16} aria-hidden="true"/></Link>
        </li>)}</ul>
      </div>
    </section>

    <section className="section band" id="how-it-works">
      <div className="container">
        <h2 className="section-title">How it works</h2>
        <ol className="steps">{steps.map(([title, body], index) => <li key={title}><span className="step-number">{index + 1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
        <div className="data-panel">
          <h3>Where your data lives</h3>
          <p>Entries are saved in your browser's storage on this device. Nothing is uploaded, which is why there is no sign in. It also means there is no automatic backup, so Ovara lets you download a copy and restore it from a file.</p>
          <Link className="text-link" to="/privacy">Read the privacy notice<ArrowRight size={16} aria-hidden="true"/></Link>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container compare">
        <div>
          <h2 className="section-title">What Ovara is</h2>
          <ul className="tick-list">{is.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <h2 className="section-title">What it is not</h2>
          <ul className="cross-list">{isNot.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
    </section>

    <section className="section band">
      <div className="container faq-grid">
        <div>
          <h2 className="section-title">Questions</h2>
          <Link className="text-link" to="/help">More answers in Help<ArrowRight size={16} aria-hidden="true"/></Link>
        </div>
        <div className="faq-list">{homeFaq.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
      </div>
    </section>

    <section className="section cta-dark">
      <div className="container cta-block">
        <h2>Start with today.</h2>
        <p>Set up takes about a minute and everything can be changed later.</p>
        <Link to="/app" className="btn btn-primary btn-lg">Open your space<ArrowRight size={20} aria-hidden="true"/></Link>
      </div>
    </section>
  </main>;
}
