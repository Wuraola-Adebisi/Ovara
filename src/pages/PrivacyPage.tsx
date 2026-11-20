import { Link } from 'react-router-dom';
import LegalPage from '../components/LegalPage';

export default function PrivacyPage() {
  return <LegalPage
    title="Privacy"
    updated="19 November 2026"
    intro="This page explains what the current version of Ovara stores, where it is stored and what happens when you use the website."
    sections={[
      { heading: 'Information you enter', body: <p>When you set up your space you enter a name and, if you choose, an email address, along with wellbeing goals and areas of interest. You can also add activity records (including optional distance), meal notes, water, routines and their completion history, moods, journal entries, goals, reminders and display preferences.</p> },
      { heading: 'Where your information is stored', body: <p>These details are saved in your browser's local storage on the device you use. They are not sent to an Ovara server. Summaries and patterns are calculated in your browser from your own entries. Ovara has no accounts, cloud backup or sync between devices, so anyone with access to your browser profile or device may be able to read this information. Avoid entering sensitive medical or other highly personal details. Reminder notifications need your permission and only appear while Ovara is open in a browser tab. The contact form prepares a message in your email app, and nothing is sent unless you send it.</p> },
      { heading: 'Cookies, analytics and tracking', body: <p>Ovara does not use advertising cookies or behavioural analytics. Like any website, the host that serves the pages receives standard request information such as your IP address when you load them.</p> },
      { heading: 'Fonts and images', body: <p>Ovara's typefaces and graphics are served from the same site as the pages. Some photographs are served by Pexels. When a photograph loads, your browser connects directly to Pexels, which may receive standard technical information such as your IP address. You can read more in the <a href="https://www.pexels.com/privacy-policy/" target="_blank" rel="noreferrer">Pexels privacy policy</a>.</p> },
      { heading: 'How to remove your information', body: <p>Use Download my data on the Preferences page to keep a copy, which you can load again with Restore from a file. Use Reset my space to delete everything from this browser. You can also clear this website's local storage in your browser settings. Deleted data cannot be recovered unless you saved a copy.</p> },
      { heading: 'Children', body: <p>Ovara is a general personal wellbeing tool and is not designed for children. If you are a parent or guardian and believe a child has entered personal information, please get in touch so we can discuss next steps.</p> },
      { heading: 'Changes to this notice', body: <p>If the way Ovara handles information changes, this page will be updated and the date above will change.</p> },
      { heading: 'Contact', body: <p>For privacy questions, use the <Link to="/contact">contact page</Link>.</p> },
    ]}
  />;
}
