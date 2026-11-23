import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageTitle } from '../components/PagePrimitives';

const principles = [
  ['Care without judgement', 'We believe people deserve support that meets them where they are. No one should feel behind, inadequate or defined by a difficult day.'],
  ['The whole person matters', 'Wellbeing is not a single number or a perfect routine. It is shaped by movement, nourishment, rest, relationships, emotions and the circumstances of everyday life.'],
  ['Progress can be personal', 'There is no universal pace or one right way to feel well. We respect different bodies, starting points, priorities and seasons of life.'],
  ['Trust is part of care', 'People should be able to understand how their information is treated and make informed choices about what they share. Respect, honesty and privacy are not optional extras.'],
] as const;

export default function AboutPage() {
  usePageTitle('About us', 'Learn why Ovara exists and the care, respect and values behind our approach to health and wellbeing.');
  return <main className="prose-page" id="main">
    <div className="container narrow">
      <span className="eyebrow">Why we care</span>
      <h1>Wellbeing deserves care, not pressure.</h1>
      <p className="lead">We believe everyone deserves the time, understanding and encouragement to care for themselves in a way that feels right for their own life.</p>

      <h2>Where it begins</h2>
      <p>Health and wellbeing are deeply personal. They are shaped by the choices we make, the support around us, the demands on our time and the unexpected things life brings. Yet it is easy to feel that looking after yourself should follow a neat routine or fit someone else's idea of progress.</p>
      <p>We created Ovara because we believe care should feel more human than that. We want to contribute to a world where people can pay attention to their wellbeing with curiosity instead of criticism, and where small acts of care are valued just as much as big milestones.</p>

      <h2>What we believe</h2>
      <p>Our work is guided by a simple conviction: people are more than their measurements, habits or most productive days. Everyone deserves to be treated with dignity, patience and respect, whatever their starting point.</p>
      <dl className="principle-list">{principles.map(([title, body]) => <div key={title}><dt>{title}</dt><dd>{body}</dd></div>)}</dl>

      <h2>A commitment we keep learning from</h2>
      <p>We are building Ovara with care and intention, knowing that meaningful work in health and wellness requires listening, responsibility and a willingness to keep improving. We do not believe we have every answer. We believe in asking better questions, taking people's experiences seriously and being honest about what we can and cannot offer.</p>
      <p>Above all, we want our work to encourage a kinder relationship with wellbeing: one grounded in self-respect, informed choices and room for real life.</p>

      <h2>We would like to hear from you</h2>
      <p>Different experiences help us see what matters and where we can do better. If you would like to share a thought or start a conversation, <Link to="/contact">we would be glad to hear from you</Link>.</p>
      <div className="cta-inline"><Link to="/contact" className="btn btn-primary btn-lg">Get in touch<ArrowRight size={20} aria-hidden="true"/></Link></div>
    </div>
  </main>;
}
