import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageTitle } from '../components/PagePrimitives';

const principles = [
  ['No required numbers', 'You can note a walk without counting steps, write about a meal without adding numbers, or leave a mood check-in for another day. Any targets are yours to choose.'],
  ['Room for real life', 'Some weeks are full. Others are quieter. Ovara helps you look back without grades, rankings or streaks to keep alive.'],
  ['Private by default', 'Your reflections are personal. Download a copy whenever you want to keep them close.'],
  ['Make it your own', 'Choose the parts that feel useful to you. Leave the rest aside, and come back whenever you want.'],
] as const;

export default function AboutPage() {
  usePageTitle('About Ovara');
  return <main className="prose-page" id="main">
    <div className="container narrow">
      <span className="eyebrow">A little about us</span>
      <h1>Wellbeing is more than one number.</h1>
      <p className="lead">How you move, eat, rest and feel are all part of the same life. Ovara gives those everyday moments a place together, so you can notice what matters to you.</p>

      <h2>Why Ovara exists</h2>
      <p>A busy week can change the way you eat. A walk can give you room to think. A small routine can make a little more space for rest. These moments are easy to overlook when they are scattered, so Ovara brings them together.</p>
      <p>It is for anyone who wants to pay attention without putting themselves under pressure. Your days do not need to look a certain way.</p>

      <h2>What matters to us</h2>
      <dl className="principle-list">{principles.map(([title, body]) => <div key={title}><dt>{title}</dt><dd>{body}</dd></div>)}</dl>

      <h2>Your wellbeing is your own</h2>
      <p>Ovara is a place to keep personal notes and notice patterns. It does not diagnose, treat or give medical advice. Energy estimates are optional, and Ovara will never set a calorie target for you.</p>

      <h2>We would like to hear from you</h2>
      <p>If something would make Ovara more useful in your everyday life, <Link to="/contact">tell us about it</Link>. You can also find answers on the <Link to="/help">help page</Link>.</p>

      <div className="cta-inline"><Link to="/app" className="btn btn-primary btn-lg">Find your rhythm<ArrowRight size={20} aria-hidden="true"/></Link></div>
    </div>
  </main>;
}
