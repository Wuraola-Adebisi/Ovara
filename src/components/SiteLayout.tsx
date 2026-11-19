import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowUpRight, Leaf, Menu, X } from 'lucide-react';

export default function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return <div className="site-shell">
    <header className="site-header">
      <Link to="/" className="site-brand" onClick={closeMenu}><span className="site-mark"><Leaf size={17}/></span><span>ovara<span className="brand-period">.</span></span></Link>
      <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
      <nav className={menuOpen ? 'site-nav is-open' : 'site-nav'} aria-label="Main navigation">
        <NavLink to="/about" onClick={closeMenu}>Our approach</NavLink>
        <a href="/#how-it-works" onClick={closeMenu}>How it works</a>
        <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
      </nav>
      <Link className="site-header-cta" to="/app" onClick={closeMenu}>Find your rhythm <ArrowUpRight size={15}/></Link>
    </header>
    <Outlet/>
    <footer className="site-footer">
      <div className="footer-main">
        <div><Link to="/" className="site-brand footer-brand"><span className="site-mark"><Leaf size={17}/></span><span>ovara<span className="brand-period">.</span></span></Link><p>Wellbeing, in all the ways that make you you.</p></div>
        <div className="footer-links">
          <div><b>Explore</b><Link to="/about">Our approach</Link><a href="/#how-it-works">How it works</a><Link to="/app">Your space</Link></div>
          <div><b>Information</b><Link to="/contact">Contact</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms of Service</Link></div>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Ovara. Made for the whole of you.</span><span>Take care, at your own pace.</span></div>
    </footer>
  </div>;
}