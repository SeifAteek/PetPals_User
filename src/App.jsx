import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { ToastProvider } from './components/Toast';
import {
    Home, Search, Heart, Calendar, Settings as SettingsIcon,
    MessageSquare, Megaphone, Sparkles, ChevronRight, PlusCircle
} from 'lucide-react';

import Auth             from './components/Auth';
import UserDashboard    from './components/UserDashboard';
import AdoptionHub      from './components/AdoptionHub';
import PetWallet        from './components/PetWallet';
import UserAppointments from './components/UserAppointments';
import Settings         from './components/Settings';
import Messages         from './components/Messages';
import Campaigns        from './components/Campaigns';
import AIAssistant      from './components/AIAssistant';

// ─── Nav items ───────────────────────────────────────────────────────────────
const SIDEBAR_NAV = [
    { to: '/',             icon: <Home          size={20} />, label: 'Home'        },
    { to: '/adopt',        icon: <Search        size={20} />, label: 'Find a Pet'  },
    { to: '/wallet',       icon: <Heart         size={20} />, label: 'Pet Wallet'  },
    { to: '/appointments', icon: <Calendar      size={20} />, label: 'Appointments' },
    { to: '/messages',     icon: <MessageSquare size={20} />, label: 'Messages'    },
    { to: '/campaigns',    icon: <Megaphone     size={20} />, label: 'Campaigns'   },
    { to: '/ai',           icon: <Sparkles      size={20} />, label: 'AI Assistant' },
];

const MOBILE_NAV = [
    { to: '/',          icon: <Home          size={22} />, label: 'Home'     },
    { to: '/adopt',     icon: <Search        size={22} />, label: 'Adopt'    },
    { to: '/messages',  icon: <MessageSquare size={22} />, label: 'Messages' },
    { to: '/campaigns', icon: <Megaphone     size={22} />, label: 'Donate'   },
    { to: '/settings',  icon: <SettingsIcon  size={22} />, label: 'Settings' },
];

const PAGE_TITLES = {
    '/':             'Home',
    '/adopt':        'Find a Pet',
    '/wallet':       'Pet Wallet',
    '/appointments': 'Appointments',
    '/messages':     'Messages',
    '/campaigns':    'Campaigns',
    '/ai':           'AI Assistant',
    '/settings':     'Settings',
};

// ─── Page title from route ────────────────────────────────────────────────────
const PageTitle = () => {
    const { pathname } = useLocation();
    return <h2 className="text-lg font-black text-slate-900">{PAGE_TITLES[pathname] || 'PetPals'}</h2>;
};

// ─── Sidebar nav item ─────────────────────────────────────────────────────────
const SideItem = ({ to, icon, label }) => (
    <NavLink
        to={to} end={to === '/'}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                isActive ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
    >
        {icon}<span>{label}</span>
    </NavLink>
);

// ─── App Shell ────────────────────────────────────────────────────────────────
const AppShell = ({ session }) => {
    const [profileName, setProfileName] = useState('');

    useEffect(() => {
        supabase.from('profiles').select('user_name').eq('user_id', session.user.id).single()
            .then(({ data }) => setProfileName(data?.user_name || session.user.email?.split('@')[0] || ''));
    }, [session]);

    // Profile pic stored in localStorage after upload via Settings
    const avatarUrl  = localStorage.getItem(`petpals_avatar_${session.user.id}`);
    const initials   = (profileName || session.user.email || '?').charAt(0).toUpperCase();

    const Avatar = ({ size = 'sm' }) => {
        const dim = size === 'sm' ? 'w-9 h-9 text-xs' : 'w-10 h-10 text-sm';
        return avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className={`${dim} rounded-xl object-cover shadow`} />
        ) : (
            <div className={`${dim} bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-black shadow`}>
                {initials}
            </div>
        );
    };

    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">

            {/* ── Desktop Sidebar ── */}
            <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-100 py-8 px-5">
                <div className="flex items-center gap-3 mb-10 px-3">
                    <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
                        <Heart size={22} fill="currentColor" />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">PetPals</span>
                </div>

                <nav className="flex-1 space-y-1">
                    {SIDEBAR_NAV.map(n => <SideItem key={n.to} {...n} />)}
                </nav>

                {/* Settings + Profile strip */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1">
                    <SideItem to="/settings" icon={<SettingsIcon size={20} />} label="Settings" />
                    <NavLink
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors mt-2"
                    >
                        <Avatar />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{profileName || 'My Profile'}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adopter</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 shrink-0" />
                    </NavLink>
                </div>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Desktop header */}
                <header className="hidden md:flex items-center justify-between px-10 py-4 bg-white border-b border-slate-100 shrink-0">
                    <PageTitle />
                    <div className="flex items-center gap-3">
                        <NavLink to="/ai" className="w-9 h-9 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center transition-colors" title="AI Assistant">
                            <Sparkles size={18} />
                        </NavLink>
                        <NavLink to="/settings">
                            <Avatar />
                        </NavLink>
                    </div>
                </header>

                {/* Mobile header */}
                <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow">
                            <Heart size={16} fill="currentColor" />
                        </div>
                        <span className="text-lg font-black text-slate-900">PetPals</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <NavLink to="/wallet" className="w-9 h-9 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                            <Heart size={17} />
                        </NavLink>
                        <NavLink to="/settings">
                            <Avatar />
                        </NavLink>
                    </div>
                </header>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
                    <Routes>
                        <Route path="/"             element={<UserDashboard    user={session.user} />} />
                        <Route path="/adopt"        element={<AdoptionHub      user={session.user} />} />
                        <Route path="/wallet"       element={<PetWallet        user={session.user} />} />
                        <Route path="/appointments" element={<UserAppointments user={session.user} />} />
                        <Route path="/messages"     element={<Messages         user={session.user} />} />
                        <Route path="/campaigns"    element={<Campaigns        user={session.user} />} />
                        <Route path="/ai"           element={<AIAssistant />} />
                        <Route path="/settings"    element={<Settings         user={session.user} />} />
                        <Route path="*"             element={<Navigate to="/" replace />} />
                    </Routes>
                </div>

                {/* Mobile FAB — quick book vet */}
                <NavLink
                    to="/appointments"
                    className="md:hidden fixed bottom-[84px] right-5 w-14 h-14 bg-brand-600 text-white rounded-2xl shadow-2xl shadow-brand-600/40 flex items-center justify-center active:scale-95 transition-transform z-40"
                >
                    <PlusCircle size={26} />
                </NavLink>
            </main>

            {/* ── Mobile Bottom Nav ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white/95 backdrop-blur-xl border-t border-slate-100 z-50 flex">
                {MOBILE_NAV.map(({ to, icon, label }) => (
                    <NavLink
                        key={to} to={to} end={to === '/'}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center justify-center gap-1 transition-all ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
                    >
                        {icon}
                        <span className="text-[9px] font-black uppercase tracking-wide">{label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
const App = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setSession(session));
        return () => subscription.unsubscribe();
    }, []);

    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-5">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-brand-600/30">
                <Heart size={34} fill="currentColor" />
            </div>
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <ToastProvider>
            <Router>
                {session ? <AppShell session={session} /> : <Auth />}
            </Router>
        </ToastProvider>
    );
};

export default App;
