import { Link } from 'react-router-dom';
import LegalPage from '../components/LegalPage';

export default function TermsPage() {
  return <LegalPage
    title="Terms of service"
    updated="19 November 2026"
    intro="These terms are the ground rules for using Ovara. By using the website and its tools you agree to them. If you do not agree, please do not use the service."
    sections={[
      { heading: 'What Ovara is', body: <p>Ovara is a personal tool for keeping track of everyday activity, meals, water, routines and reflections. It is meant for general wellbeing, organisation and self-reflection.</p> },
      { heading: 'Not medical care', body: <p>Ovara is not a healthcare provider and does not give medical advice, diagnosis, treatment or emergency services. Estimates, summaries and patterns shown in Ovara are for general information and do not replace advice from a qualified professional. Do not delay seeking care because of something you see in Ovara. If you may be having a medical emergency, contact your local emergency services.</p> },
      { heading: 'Your information and responsibilities', body: <p>You are responsible for what you choose to enter and for keeping your device and browser reasonably secure. Do not enter information you are not comfortable storing in your browser. Do not misuse the service, interfere with how it works, attempt unauthorised access, or use it in a way that breaks the law or another person's rights.</p> },
      { heading: 'Your content', body: <p>You keep your rights to the notes, records and other content you add, and Ovara claims no ownership of it. Your notes and records are stored in the browser on the device you use. Ovara does not offer online accounts or syncing between devices.</p> },
      { heading: 'Availability and changes', body: <p>Ovara may change or discontinue parts of the service. We aim to keep it available and useful, but cannot promise uninterrupted access. Download a copy of anything important from the Preferences page.</p> },
      { heading: 'Intellectual property', body: <p>The Ovara name, visual identity, website design, text and original materials belong to their rights holders. Do not copy, distribute or commercially use them without permission, except where the law allows it.</p> },
      { heading: 'Other websites', body: <p>Ovara may link to other websites. Those sites have their own terms, and Ovara is not responsible for them.</p> },
      { heading: 'Limitation of liability', body: <p>To the extent the law allows, Ovara is not liable for indirect, incidental, special or consequential loss arising from your use of the service. Nothing in these terms excludes liability that cannot lawfully be excluded.</p> },
      { heading: 'Changes to these terms', body: <p>These terms may be revised as Ovara changes. The date above shows the latest revision. Continuing to use Ovara after a change means you accept the revised terms.</p> },
      { heading: 'Contact', body: <p>For questions about these terms, email <a href="mailto:hello@withovara.com">hello@withovara.com</a> or use the <Link to="/contact">contact page</Link>.</p> },
    ]}
  />;
}
