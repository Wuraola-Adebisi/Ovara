import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageTitle } from '../components/PagePrimitives';

const principles = [
  ['No required numbers', 'Every number in Ovara is optional. You can log a walk without steps, a meal without energy and a day without a mood. Targets exist only if you set them.'],
  ['Records, not scores', 'Ovara shows what you logged and how it compares with the period before. It does not grade you, rank you or reward streaks, so a quiet week looks like a quiet week.'],
  ['Private by default', 'Your entries are saved in your browser and go nowhere else. There is no account to create and no server holding a copy.'],
  ['Use what helps', 'Pick the areas you care about at setup. The rest stays out of the way until you want it.'],
] as const;

const limits = [
  'Entries live in one browser on one device. There is no live sync, but you can download your data and restore it on another device.',
  'Reminders only appear while Ovara is open in a browser tab.',
  'There is no mobile app yet. Ovara runs in the browser on phones and computers.',
  'Insights are simple calculations on your own entries. They describe what you logged and do not predict or diagnose anything.',
] as const;

export default function AboutPage() {
  usePageTitle('Our approach');
  return <main className="prose-page" id="main">
    <div className="container narrow">
      <h1>Wellbeing is more than one number.</h1>
      <p className="lead">How you move, eat, rest and feel affect each other. Most apps track one of these. Ovara puts the everyday pieces in one place so you can see how they relate.</p>

      <h2>Why it exists</h2>
      <p>A busy week changes what you eat. A walk can change your mood. A small routine can make room for rest. Those links are easy to miss when each habit lives in a different app, so Ovara keeps them together and shows them side by side.</p>
      <p>It is built for people who want a record without pressure. Nothing in Ovara is graded, ranked or compared with other people.</p>

      <h2>Principles</h2>
      <dl className="principle-list">{principles.map(([title, body]) => <div key={title}><dt>{title}</dt><dd>{body}</dd></div>)}</dl>

      <h2>What it will not do</h2>
      <ul className="plain-list">
        <li>It will not set a calorie target for you. Energy estimates are optional.</li>
        <li>It will not diagnose, treat or give medical advice.</li>
        <li>It will not send your entries to a server. You can download or delete them at any time.</li>
      </ul>

      <h2>Current limits</h2>
      <p>Ovara is early. These are the limits as they stand today.</p>
      <ul className="plain-list">{limits.map(item => <li key={item}>{item}</li>)}</ul>

      <h2>Tell us what is missing</h2>
      <p>Ovara changes based on how people use it. If something does not fit your day, <Link to="/contact">send a note</Link>. The <Link to="/help">help page</Link> covers the most common questions.</p>

      <div className="cta-inline">
        <Link to="/app" className="btn btn-primary btn-lg">Open your space<ArrowRight size={20} aria-hidden="true"/></Link>
      </div>
    </div>
  </main>;
}
