import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Wordmark from './Wordmark';

export default function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return <div className="site">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <div className="container site-header-inner">
        <Link to="/" className="wordmark-link" aria-label="Ovara, home"><Wordmark/></Link>
        <button type="button" className="icon-btn menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
        <nav id="site-nav" className={menuOpen ? 'site-nav is-open' : 'site-nav'} aria-label="Main">
          <NavLink to="/about">Our approach</NavLink>
          <Link to="/#how-it-works">How it works</Link>
          <NavLink to="/contact">Contact</NavLink>
          <Link className="btn btn-primary" to="/app">Open your space</Link>
        </nav>
      </div>
    </header>
    <Outlet/>
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="wordmark-link on-night" aria-label="Ovara, home"><Wordmark/></Link>
          <p>A daily tracker for movement, food, water, routines and mood. Your entries stay on your device.</p>
        </div>
        <nav aria-label="Footer">
          <Link to="/about">Our approach</Link>
          <Link to="/app">Your space</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms of service</Link>
        </nav>
      </div>
      <div className="container footer-bottom">&copy; {new Date().getFullYear()} Ovara</div>
    </footer>
  </div>;
}
