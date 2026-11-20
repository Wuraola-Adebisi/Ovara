import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { usePageTitle } from '../components/PagePrimitives';
import ProductTour from '../components/ProductTour';
import { homeFaq } from '../data/faq';

const moments = [
  { title: 'Move in a way that feels good', body: 'A walk, a stretch, a dance around the kitchen. Make room for movement that belongs to your day.', image: 'https://images.pexels.com/photos/8497696/pexels-photo-8497696.jpeg?auto=compress&cs=tinysrgb&w=1200', alt: 'Woman enjoying a walk outdoors', className: 'moment-movement' },
  { title: 'Make time for good food', body: 'Keep a simple note of the meals and snacks that keep you going, without turning them into a score.', image: 'https://images.pexels.com/photos/4551835/pexels-photo-4551835.jpeg?auto=compress&cs=tinysrgb&w=1000', alt: 'Colourful lunch bowl with vegetables and rice', className: 'moment-food' },
  { title: 'Notice how you feel', body: 'Pause for a moment, check in with yourself and give the day somewhere to land.', image: 'https://images.pexels.com/photos/4115782/pexels-photo-4115782.jpeg?auto=compress&cs=tinysrgb&w=1000', alt: 'Woman writing in a journal outdoors', className: 'moment-reflection' },
];

const scenarios = [
  ['A little more movement', 'Keep track of walks, workouts and the small ways you fit movement into a busy week.', '/app/activity', 'Explore movement'],
  ['A clearer picture of your days', 'Bring meals, water, routines and how you feel into one calm place.', '/app/calendar', 'See your calendar'],
  ['A place to put your thoughts', 'Write freely, return to earlier days and keep your reflections close.', '/app/journal', 'Visit your journal'],
  ['Small habits, at your pace', 'Choose a few things that matter to you and see how they find a place in your week.', '/app/routines', 'Shape your routines'],
] as const;

const steps = [
  ['Make it yours', 'Choose the parts of your wellbeing you want to pay attention to. You can change your choices whenever you like.'],
  ['Keep little notes', 'Add a walk, a meal, a glass of water or a thought whenever it suits you.'],
  ['See the bigger picture', 'Look back at your days and weeks, notice what stands out and decide what you want to carry forward.'],
] as const;

export default function HomePage() {
  usePageTitle('Feel good in your own way');
  return <main id="main">
    <section className="home-hero">
      <div className="container home-hero-grid">
        <div className="home-hero-copy">
          <span className="eyebrow">A gentler way to check in</span>
          <h1>Make room for <em>all</em> of you.</h1>
          <p>Life is made up of little things: how you move, what nourishes you, the habits you keep and the moments you need to pause. Ovara brings them together, so you can feel more in tune with your everyday.</p>
          <div className="btn-row">
            <Link to="/app" className="btn btn-primary btn-lg">Find your rhythm<ArrowRight size={20} aria-hidden="true"/></Link>
            <Link to="/features" className="home-text-link">Take a look around</Link>
          </div>
          <div className="home-reassurance"><span><Check size={15} aria-hidden="true"/> No pressure to be perfect</span><span><Check size={15} aria-hidden="true"/> Your notes stay on your device</span></div>
        </div>
        <div className="home-hero-visual">
          <img className="home-hero-image" src="https://images.pexels.com/photos/8497696/pexels-photo-8497696.jpeg?auto=compress&cs=tinysrgb&w=1800" alt="A woman taking a relaxed walk outdoors" fetchPriority="high"/>
          <div className="hero-note hero-note-top"><span className="hero-note-mark">01</span><span>A little movement<br/><b>can change the shape of a day.</b></span></div>
          <div className="hero-note hero-note-bottom"><span className="hero-note-sun" aria-hidden="true">•</span><span><b>A pause is enough.</b><br/>You can begin right where you are.</span></div>
          <div className="hero-photo-caption">Find your own pace. Make it yours.</div>
        </div>
      </div>
    </section>

    <section className="home-intro section">
      <div className="container home-intro-grid">
        <p className="eyebrow">The whole picture</p>
        <div>
          <h2>Your wellbeing isn't just one thing.</h2>
          <p>Some days are full of energy. Some ask you to slow down. Ovara gives you a place to notice the difference, without turning your life into a list of things to get right.</p>
        </div>
      </div>
    </section>

    <section className="home-moments-section">
      <div className="container">
        <div className="section-heading-row">
          <div><span className="eyebrow">The everyday, in full</span><h2 className="section-title">Care for the parts<br/>that make you, you.</h2></div>
          <p>Small moments count, too. Keep them together and see how your days take shape.</p>
        </div>
        <div className="home-moments">
          {moments.map((item, index) => <article className={'home-moment ' + item.className} key={item.title}>
            <div className="home-moment-image"><img src={item.image} alt={item.alt} loading="lazy" decoding="async"/><span className="moment-index">0{index + 1}</span></div>
            <div className="home-moment-copy"><h3>{item.title}</h3><p>{item.body}</p></div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="section home-quote-section">
      <div className="container home-quote">
        <span className="eyebrow">A note to come back to</span>
        <p>You don't have to change everything. Sometimes it helps to simply notice where you are.</p>
        <span className="quote-flourish" aria-hidden="true">— Ovara</span>
      </div>
    </section>

    <section className="section band">
      <div className="container">
        <div className="section-heading-row home-tour-heading"><div><span className="eyebrow">A little more about Ovara</span><h2 className="section-title">A place for your everyday.</h2></div><p>From movement and meals to routines and reflection, everything has room to fit your life.</p></div>
        <ProductTour/>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-heading-row"><div><span className="eyebrow">Made for real life</span><h2 className="section-title">Start wherever<br/>you are.</h2></div><p>You don't need a perfect routine or a fresh start on Monday. Begin with the part of today that matters to you.</p></div>
        <ul className="scenarios">{scenarios.map(([title, body, path, cta]) => <li key={title}><h3>{title}</h3><p>{body}</p><Link className="text-link" to={path}>{cta}<ArrowRight size={16} aria-hidden="true"/></Link></li>)}</ul>
      </div>
    </section>

    <section className="section band" id="how-it-works">
      <div className="container">
        <div className="section-heading-row"><div><span className="eyebrow">Simple by design</span><h2 className="section-title">A little at a time.</h2></div><p>Ovara is here to support your own rhythm, not give you another thing to keep up with.</p></div>
        <ol className="steps">{steps.map(([title, body], index) => <li key={title}><span className="step-number">{index + 1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
        <div className="data-panel"><h3>Your information stays close</h3><p>Your notes and activity are saved in this browser on this device. Nothing is uploaded to an Ovara account. You can download a copy to keep or move your information to another device.</p><Link className="text-link" to="/privacy">Read about your privacy<ArrowRight size={16} aria-hidden="true"/></Link></div>
      </div>
    </section>

    <section className="section home-faq-section">
      <div className="container faq-grid">
        <div><span className="eyebrow">Good to know</span><h2 className="section-title">A few questions.</h2><Link className="text-link" to="/help">Visit the help page<ArrowRight size={16} aria-hidden="true"/></Link></div>
        <div className="faq-list">{homeFaq.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
      </div>
    </section>

    <section className="home-final-cta">
      <div className="home-final-image" role="img" aria-label="A quiet sunlit path through green trees"/>
      <div className="container home-final-content"><span className="eyebrow">Your day, your way</span><h2>There's room to begin again.</h2><p>Take a breath. Start with one small thing. Let the rest follow in its own time.</p><Link to="/app" className="btn btn-primary btn-lg">Find your rhythm<ArrowRight size={20} aria-hidden="true"/></Link></div>
    </section>
  </main>;
}
