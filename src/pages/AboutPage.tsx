import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageTitle } from '../components/PagePrimitives';

export default function AboutPage() {
  usePageTitle('Our approach');
  return <main className="prose-page" id="main">
    <div className="container narrow">
      <h1>Wellbeing is more than one number.</h1>
      <p className="lead">How you move, eat, rest and feel affect each other. Most apps track one of these. Ovara puts the everyday pieces in one place so you can see how they relate.</p>

      <h2>Why it exists</h2>
      <p>A busy week changes what you eat. A walk can change your mood. A small routine can make room for rest. Those links are easy to miss when each habit lives in a different app, so Ovara keeps them together and shows them side by side.</p>
      <p>It is built for people who want a record without pressure. Nothing in Ovara is graded, ranked or compared with other people.</p>

      <h2>What it will not do</h2>
      <ul className="plain-list">
        <li>It will not set a calorie target for you. Energy estimates are optional.</li>
        <li>It will not diagnose, treat or give medical advice.</li>
        <li>It will not send your entries to a server. They stay in your browser, and you can download or delete them at any time.</li>
      </ul>

      <div className="cta-inline">
        <Link to="/app" className="btn btn-primary btn-lg">Open your space<ArrowRight size={20} aria-hidden="true"/></Link>
      </div>
    </div>
  </main>;
}
