import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../components/PagePrimitives';

const contactEmail = 'hello@withovara.com';

export default function ContactPage() {
  usePageTitle('Contact', 'Get in touch with Ovara. We welcome questions, feedback and thoughtful conversations about health and wellbeing.');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('A question about Ovara');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = 'From: ' + name + ' (' + email + ')\n\n' + message;
    window.location.href = 'mailto:' + contactEmail + '?subject=' + encodeURIComponent(topic) + '&body=' + encodeURIComponent(body);
    setNotice('Your email app should open with this message ready to send. Nothing is sent until you send it from there.');
  }

  return <main className="prose-page" id="main">
    <div className="container narrow">
      <span className="eyebrow">We are listening</span>
      <h1>Let's talk.</h1>
      <p className="lead">Questions, feedback or ideas are welcome. We value thoughtful conversations and want to hear what matters to you.</p>
      <p>You can also write to <a href="mailto:hello@withovara.com">hello@withovara.com</a>.</p>
      <form className="card form-card" onSubmit={submit}>
        <div className="form-grid single">
          <label className="field">Your name<input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required/></label>
          <label className="field">Your email<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required/></label>
          <label className="field">Topic<select value={topic} onChange={event => setTopic(event.target.value)}><option>A question about Ovara</option><option>Share feedback</option><option>Partnership or collaboration</option><option>Press and media</option><option>Something else</option></select></label>
          <label className="field">Message<textarea rows={6} value={message} onChange={event => setMessage(event.target.value)} required/></label>
        </div>
        <div className="btn-row"><button type="submit" className="btn btn-primary">Prepare email</button></div>
        <p className="muted small-print" role="status">{notice}</p>
      </form>
      <p className="muted small-print">For details about how information is handled, read our <Link to="/privacy">privacy notice</Link>.</p>
    </div>
  </main>;
}
