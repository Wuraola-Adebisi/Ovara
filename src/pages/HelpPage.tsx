import { Link } from 'react-router-dom';
import { usePageTitle } from '../components/PagePrimitives';
import { faqGroups } from '../data/faq';

export default function HelpPage() {
  usePageTitle('Help');
  return <main id="main" className="prose-page">
    <div className="container narrow">
      <span className="eyebrow">Here when you need us</span>
      <h1>How can we help?</h1>
      <p className="lead">A few answers to help you make the most of your time with Ovara.</p>
      <nav className="anchor-nav" aria-label="On this page">{faqGroups.map(group => <a key={group.id} href={'#' + group.id}>{group.title}</a>)}</nav>
      {faqGroups.map(group => <section key={group.id} id={group.id}>
        <h2>{group.title}</h2>
        <div className="faq-list">{group.items.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
      </section>)}
      <h2>Still have a question?</h2>
      <p><Link to="/contact">Send us a message</Link> and tell us what you were trying to do. If something did not work as expected, let us know which browser and device you are using.</p>
    </div>
  </main>;
}
