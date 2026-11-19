import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { BookHeart, CalendarDays, ChartNoAxesCombined, ChevronDown, Footprints, Heart, LayoutDashboard, ListChecks, Menu, Plus, Settings2, Target, Utensils, X } from 'lucide-react';
import { usePersistentState } from './hooks/usePersistentState';
import { ProfileContext, useProfile } from './context/ProfileContext';
import type { UserProfile } from './context/ProfileContext';
import WelcomeFlow from './components/WelcomeFlow';
import SiteLayout from './components/SiteLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import Overview from './pages/Overview';
import ActivityPage from './pages/ActivityPage';
import NutritionPage from './pages/NutritionPage';
import RoutinesPage from './pages/RoutinesPage';
import JournalPage from './pages/JournalPage';
import InsightsPage from './pages/InsightsPage';
import GoalsPage from './pages/GoalsPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';

function AppShell() {
  const [profile, setProfile] = usePersistentState<UserProfile | null>('ovara.profile', null);
  if (!profile) return <WelcomeFlow onComplete={setProfile}/>;
  return <ProfileContext.Provider value={{ profile, setProfile }}><Workspace/></ProfileContext.Provider>;
}

function Workspace() {
  const { profile } = useProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  useEffect(() => { const show = () => setQuickOpen(true); window.addEventListener('ovara:add', show); return () => window.removeEventListener('ovara:add', show); }, []);
  const links = [
    ['Overview', '/app', LayoutDashboard], ['Activity', '/app/activity', Footprints],
    ['Nutrition', '/app/nutrition', Utensils], ['Routines', '/app/routines', ListChecks],
    ['Journal', '/app/journal', BookHeart], ['Insights', '/app/insights', ChartNoAxesCombined],
    ['Goals', '/app/goals', Target], ['Calendar', '/app/calendar', CalendarDays],
    ['Preferences', '/app/settings', Settings2],
  ] as const;
  if (!profile) return null;
  return <div className="app"><aside className={menuOpen ? 'sidebar open' : 'sidebar'}><div className="brand"><span className="brand-icon"><Heart size={18}/></span><b>ovara<span>.</span></b><button className="close-menu" onClick={() => setMenuOpen(false)}><X/></button></div><div className="workspace"><span className="avatar">{profile.name.charAt(0).toUpperCase()}</span><div><b>{profile.name}</b><small>Your wellbeing space</small></div><ChevronDown size={15}/></div><small className="nav-caption">YOUR WELLBEING</small><nav>{links.map(([label, path, Icon]) => <NavLink key={path} to={path} end={path === '/app'} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav active' : 'nav'}><Icon size={18}/>{label}</NavLink>)}</nav><div className="side-quote"><Heart size={17}/><b>There is no perfect pace.</b><p>Some days are for doing. Some are for being. Both count.</p></div><div className="side-bottom"><button className="nav muted reset-space" onClick={() => { if (window.confirm('Clear all your Ovara entries?')) { Object.keys(window.localStorage).filter(key => key.startsWith('ovara.')).forEach(key => window.localStorage.removeItem(key)); window.location.href = '/app'; } }}><Settings2 size={17}/> Reset your space</button><div className="profile"><span className="avatar">{profile.name.charAt(0).toUpperCase()}</span><div><b>{profile.name}</b><small>{profile.email}</small></div></div><Link className="back-home" to="/">← Back to Ovara</Link></div></aside>{menuOpen && <button className="scrim" onClick={() => setMenuOpen(false)}/>}<main className="main-area"><header className="topbar"><button className="menu" onClick={() => setMenuOpen(true)}><Menu/></button><div className="crumb">Your space <span>/</span> <b>Wellbeing</b></div><div className="top-actions"><span className="online">A little at a time</span><button className="quick" onClick={() => setQuickOpen(true)}><Plus size={16}/> Add to your day</button><span className="avatar">{profile.name.charAt(0).toUpperCase()}</span></div></header><div className="content"><Outlet/></div>{quickOpen && <div className="quick-overlay" onClick={() => setQuickOpen(false)}><section className="quick-modal" onClick={event => event.stopPropagation()}><div className="quick-modal-head"><div><small>ADD TO YOUR DAY</small><h2>What would you like to note?</h2></div><button onClick={() => setQuickOpen(false)}>×</button></div><NavLink to="/app/activity" onClick={() => setQuickOpen(false)}><Footprints size={18}/> Movement <span>Log an activity</span></NavLink><NavLink to="/app/nutrition" onClick={() => setQuickOpen(false)}><Utensils size={18}/> Food & water <span>Note a meal or a glass of water</span></NavLink><NavLink to="/app/routines" onClick={() => setQuickOpen(false)}><ListChecks size={18}/> Routine <span>Update a habit</span></NavLink><NavLink to="/app/journal" onClick={() => setQuickOpen(false)}><BookHeart size={18}/> Reflection <span>Check in with yourself</span></NavLink></section></div>}</main></div>;
}

export default function App() {
  return <Routes><Route element={<SiteLayout/>}><Route index element={<HomePage/>}/><Route path="about" element={<AboutPage/>}/><Route path="contact" element={<ContactPage/>}/><Route path="terms" element={<TermsPage/>}/><Route path="privacy" element={<PrivacyPage/>}/></Route><Route path="/app" element={<AppShell/>}><Route index element={<Overview/>}/><Route path="activity" element={<ActivityPage/>}/><Route path="nutrition" element={<NutritionPage/>}/><Route path="routines" element={<RoutinesPage/>}/><Route path="journal" element={<JournalPage/>}/><Route path="insights" element={<InsightsPage/>}/><Route path="goals" element={<GoalsPage/>}/><Route path="calendar" element={<CalendarPage/>}/><Route path="settings" element={<SettingsPage/>}/></Route></Routes>;
}
