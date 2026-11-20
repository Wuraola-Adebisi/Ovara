import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { BookHeart, CalendarDays, Ellipsis, Footprints, LayoutDashboard, ListChecks, Plus, Settings2, Target, TrendingUp, Utensils, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from './lib/store';
import { ProfileContext, useProfile } from './context/ProfileContext';
import { ToastProvider } from './components/Toast';
import WelcomeFlow from './components/WelcomeFlow';
import ReminderScheduler from './components/ReminderScheduler';
import SiteLayout from './components/SiteLayout';
import Wordmark from './components/Wordmark';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FeaturesPage from './pages/FeaturesPage';
import HelpPage from './pages/HelpPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import Overview from './pages/Overview';
import ActivityPage from './pages/ActivityPage';
import NutritionPage from './pages/NutritionPage';
import RoutinesPage from './pages/RoutinesPage';
import JournalPage from './pages/JournalPage';
import InsightsPage from './pages/InsightsPage';
import GoalsPage from './pages/GoalsPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';

type NavItem = { label: string; path: string; icon: LucideIcon };

const dailyLinks: NavItem[] = [
  { label: 'Today', path: '/app', icon: LayoutDashboard },
  { label: 'Activity', path: '/app/activity', icon: Footprints },
  { label: 'Food and water', path: '/app/nutrition', icon: Utensils },
  { label: 'Routines', path: '/app/routines', icon: ListChecks },
  { label: 'Journal', path: '/app/journal', icon: BookHeart },
];
const overTimeLinks: NavItem[] = [
  { label: 'Insights', path: '/app/insights', icon: TrendingUp },
  { label: 'Goals', path: '/app/goals', icon: Target },
  { label: 'Calendar', path: '/app/calendar', icon: CalendarDays },
  { label: 'Preferences', path: '/app/settings', icon: Settings2 },
];
const tabLinks = dailyLinks.slice(0, 4);

function AppShell() {
  const [profile, setProfile] = useStore('profile');
  if (!profile) return <WelcomeFlow onComplete={setProfile}/>;
  return <ProfileContext.Provider value={{ profile, setProfile }}><Workspace/></ProfileContext.Provider>;
}

function Workspace() {
  const { profile } = useProfile();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const quickRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const open = () => quickRef.current?.showModal();
    window.addEventListener('ovara:add', open);
    return () => window.removeEventListener('ovara:add', open);
  }, []);
  useEffect(() => { window.scrollTo(0, 0); setMenuOpen(false); }, [pathname]);

  if (!profile) return null;
  const initial = profile.name.charAt(0).toUpperCase();
  const closeQuick = () => quickRef.current?.close();
  const renderLink = ({ label, path, icon: Icon }: NavItem) => <NavLink key={path} to={path} end={path === '/app'} className={({ isActive }) => isActive ? 'rail-link is-active' : 'rail-link'}><Icon size={20} aria-hidden="true"/>{label}</NavLink>;

  return <ToastProvider>
    <div className="app">
      <ReminderScheduler/>
      <aside className={menuOpen ? 'rail is-open' : 'rail'} aria-label="Workspace">
        <div className="rail-top">
          <Link to="/app" className="wordmark-link" aria-label="Ovara, today"><Wordmark/></Link>
          <button type="button" className="icon-btn rail-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={20}/></button>
        </div>
        <button type="button" className="btn btn-primary rail-add" onClick={() => quickRef.current?.showModal()}><Plus size={18} aria-hidden="true"/>Add to today</button>
        <nav aria-label="Daily">
          <p className="rail-group">Daily</p>
          {dailyLinks.map(renderLink)}
          <p className="rail-group">Over time</p>
          {overTimeLinks.map(renderLink)}
        </nav>
        <div className="rail-foot">
          <span className="avatar" aria-hidden="true">{initial}</span>
          <div><b>{profile.name}</b><Link to="/">Back to the site</Link></div>
        </div>
      </aside>
      {menuOpen && <button type="button" className="scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)}/>}

      <main className="app-main" id="main"><div className="page"><Outlet/></div></main>

      <nav className="tabbar" aria-label="Quick navigation">
        {tabLinks.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/app'} className={({ isActive }) => isActive ? 'tab is-active' : 'tab'}><Icon size={22} aria-hidden="true"/><span>{label.replace(' and water', '')}</span></NavLink>)}
        <button type="button" className="tab" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Ellipsis size={22} aria-hidden="true"/><span>More</span></button>
      </nav>

      <dialog ref={quickRef} className="dialog quick-dialog" aria-labelledby="quick-title" onClick={event => { if (event.target === quickRef.current) closeQuick(); }}>
        <div className="dialog-head"><h2 id="quick-title">What do you want to add?</h2><button type="button" className="icon-btn" aria-label="Close" onClick={closeQuick}><X size={20}/></button></div>
        <div className="quick-grid">
          <NavLink to="/app/activity" state={{ add: true }} onClick={closeQuick}><Footprints size={22} aria-hidden="true"/><b>Activity</b><span>Log a walk, workout or stretch</span></NavLink>
          <NavLink to="/app/nutrition" state={{ add: true }} onClick={closeQuick}><Utensils size={22} aria-hidden="true"/><b>Food or water</b><span>Note a meal or a glass of water</span></NavLink>
          <NavLink to="/app/routines" onClick={closeQuick}><ListChecks size={22} aria-hidden="true"/><b>Routine</b><span>Tick one off or add a new one</span></NavLink>
          <NavLink to="/app/journal" onClick={closeQuick}><BookHeart size={22} aria-hidden="true"/><b>Journal</b><span>Write down how today is going</span></NavLink>
        </div>
      </dialog>
    </div>
  </ToastProvider>;
}

export default function App() {
  return <Routes>
    <Route element={<SiteLayout/>}>
      <Route index element={<HomePage/>}/>
      <Route path="about" element={<AboutPage/>}/>
      <Route path="features" element={<FeaturesPage/>}/>
      <Route path="help" element={<HelpPage/>}/>
      <Route path="contact" element={<ContactPage/>}/>
      <Route path="terms" element={<TermsPage/>}/>
      <Route path="privacy" element={<PrivacyPage/>}/>
      <Route path="*" element={<NotFoundPage/>}/>
    </Route>
    <Route path="/app" element={<AppShell/>}>
      <Route index element={<Overview/>}/>
      <Route path="activity" element={<ActivityPage/>}/>
      <Route path="nutrition" element={<NutritionPage/>}/>
      <Route path="routines" element={<RoutinesPage/>}/>
      <Route path="journal" element={<JournalPage/>}/>
      <Route path="insights" element={<InsightsPage/>}/>
      <Route path="goals" element={<GoalsPage/>}/>
      <Route path="calendar" element={<CalendarPage/>}/>
      <Route path="settings" element={<SettingsPage/>}/>
      <Route path="*" element={<NotFoundPage inApp/>}/>
    </Route>
  </Routes>;
}
