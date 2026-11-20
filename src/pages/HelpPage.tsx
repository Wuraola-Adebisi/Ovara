import { Link } from 'react-router-dom';
import { usePageTitle } from '../components/PagePrimitives';
import { faqGroups } from '../data/faq';

export default function HelpPage() {
  usePageTitle('Help');
  return <main id="main" className="prose-page">
    <div className="container narrow">
      <h1>Help</h1>
      <p className="lead">Answers to common questions about using Ovara and where your data lives.</p>
      <nav className="anchor-nav" aria-label="On this page">{faqGroups.map(group => <a key={group.id} href={'#' + group.id}>{group.title}</a>)}</nav>
      {faqGroups.map(group => <section key={group.id} id={group.id}>
        <h2>{group.title}</h2>
        <div className="faq-list">{group.items.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
      </section>)}
      <h2>Still stuck?</h2>
      <p>Tell us what you were doing and what you expected to happen on the <Link to="/contact">contact page</Link>. It helps to mention your browser and whether you use a private window.</p>
    </div>
  </main>;
}
