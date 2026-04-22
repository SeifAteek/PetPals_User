import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Heart, ChevronRight, Plus, ArrowRight, Activity, Wind, Stethoscope, PawPrint, Zap, Star, Megaphone, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Fallback tips (rotate by day-of-year) ───────────────────────────────────
const TIPS = [
    'Fresh water should be available at all times. Refill your pet\'s bowl at least twice a day.',
    'Regular brushing reduces shedding and prevents matting — make it a calming bonding ritual.',
    'Dogs need at least 30 minutes of exercise daily; larger breeds may need up to 2 hours.',
    'Cats are obligate carnivores — ensure their diet is high in animal protein.',
    'Dental hygiene matters! Brush your pet\'s teeth 2–3 times a week to prevent gum disease.',
    'Keep toxic plants like lilies, azaleas, and sago palm away from curious pets.',
    'Mental stimulation is just as important as physical exercise. Puzzle feeders help!',
    'Microchipping your pet is the single most effective way to ensure a reunion if they\'re lost.',
    'Spaying or neutering can significantly extend your pet\'s lifespan.',
    'Pets can experience anxiety — signs include excessive licking, pacing, or hiding.',
    'Schedule annual vet check-ups even when your pet seems perfectly healthy.',
    'Overweight pets live shorter lives. Measure food portions and limit treats to <10% of daily calories.',
    'Cats need vertical space — cat trees and shelves satisfy their natural climbing instinct.',
    'Never give your pet grapes, raisins, xylitol, chocolate, onions, or garlic.',
    'Positive reinforcement (treats + praise) is far more effective than punishment-based training.',
    'Keep your pet\'s vaccination records updated — some diseases are easily preventable.',
    'Socialise puppies early (8–16 weeks) to reduce fear and aggression in adult life.',
    'A tired dog is a well-behaved dog. Consistent exercise is the best behavioral tool.',
    'Cats should visit the vet at least once a year — they hide illness extremely well.',
    'Grooming sessions help you spot lumps, parasites, or skin issues before they worsen.',
    'Provide a warm, quiet sleeping spot away from drafts — pets need good rest too.',
    'Introduce new pets slowly. A rushed introduction often causes lasting conflict.',
    'Fish need regular water changes — aim to replace 25% of tank water every week.',
    'Rabbits are highly social; consider adopting a bonded pair to prevent loneliness.',
    'Birds need at least 3–4 hours of out-of-cage time daily for mental health.',
    'Flea and tick prevention is critical year-round, not just in summer.',
    'Senior pets (7+) should have check-ups every 6 months — aging accelerates health changes.',
    'Catnip works on about 50% of cats; it\'s perfectly safe and great for enrichment.',
    'Interactive playtime with your cat for just 15 minutes daily dramatically reduces boredom.',
    'Always check if a new food is pet-safe before introducing it — when in doubt, ask your vet.',
];

const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
};

const StatCard = ({ label, value, icon, bg }) => (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-5 flex items-center gap-4 shadow-soft">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>{icon}</div>
        <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
    </div>
);

// ─── Daily tips component ─────────────────────────────────────────────────────
const DailyTip = () => {
    const dayOfYear  = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const [idx, setIdx]     = useState(dayOfYear % TIPS.length);
    const [apiFact, setApiFact] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try to get a live cat/pet fact from a public CORS-enabled API
        fetch('https://catfact.ninja/fact')
            .then(r => r.json())
            .then(d => { if (d?.fact) setApiFact(d.fact); })
            .catch(() => {}) // silently fall back to local tips
            .finally(() => setLoading(false));
    }, []);

    const tip = apiFact || TIPS[idx];
    const shuffle = () => setIdx(i => (i + 1) % TIPS.length);

    return (
        <div className="bg-gradient-to-br from-violet-600 via-brand-600 to-brand-700 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-brand-600/20 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-brand-200" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-200">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={shuffle} disabled={loading} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-200 mb-2">🌟 Daily Pet Tip</p>
                <p className="text-base font-semibold leading-relaxed opacity-95">{loading ? 'Loading today\'s tip…' : tip}</p>
            </div>
        </div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const UserDashboard = ({ user }) => {
    const [myPets,       setMyPets]       = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const navigate = useNavigate();

    const displayName = user.email?.split('@')[0] || 'there';

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [petsRes, adopterRes] = await Promise.all([
                    supabase.from('pets').select('*').eq('owner_id', user.id),
                    supabase.from('adopter_profiles').select('adopter_id').eq('user_id', user.id).single(),
                ]);
                let finalPets = petsRes.data || [];
                
                if (adopterRes.data?.adopter_id) {
                    // Fetch applications
                    const { data: allApps } = await supabase.from('applications')
                        .select('*, pets(*)').eq('adopter_id', adopterRes.data.adopter_id);
                    
                    const pendingApps  = (allApps || []).filter(a => a.status === 'Under Review');
                    const approvedApps = (allApps || []).filter(a => a.status === 'Approved');
                    
                    setApplications(pendingApps);
                    
                    // Add approved pets to list if they aren't already there (owner_id might not have synced yet)
                    const ownedIds = new Set(finalPets.map(p => p.pet_id));
                    const approvedPets = approvedApps
                        .filter(a => a.pets && !ownedIds.has(a.pets.pet_id))
                        .map(a => ({ ...a.pets, status: 'Adopted' }));
                    
                    finalPets = [...finalPets, ...approvedPets];
                }
                setMyPets(finalPets);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, [user]);


    return (
        <div className="p-6 md:p-10 space-y-8 pb-28 md:pb-12">

            {/* Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                    <p className="text-sm font-black text-brand-600 uppercase tracking-widest mb-1">{greeting()} 👋</p>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight capitalize">{displayName}!</h1>
                    <p className="text-slate-500 font-medium italic mt-1">
                        {myPets.length > 0 ? `${myPets.length} pal${myPets.length > 1 ? 's' : ''} counting on you today.` : 'Your pet journey starts here.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/adopt')} className="flex items-center gap-2 px-5 py-3.5 bg-white border border-slate-100 text-slate-700 font-bold rounded-2xl shadow-soft hover:border-brand-200 transition-all active:scale-95 text-sm">
                        <PawPrint size={18} className="text-brand-600" /><span>Adopt</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <StatCard label="My Pets"     value={loading ? '—' : myPets.length}       icon={<Heart size={22} fill="currentColor" />} bg="bg-red-50 text-red-500" />
                <StatCard label="Messages"    value={loading ? '—' : '0'}  icon={<MessageSquare size={22} />}                  bg="bg-brand-50 text-brand-600" />
                <StatCard label="Applications" value={loading ? '—' : applications.length} icon={<Star size={22} />}                       bg="bg-amber-50 text-amber-500" />
            </div>

            {/* Daily tip */}
            <DailyTip />

            {/* My Pets scroller */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">My Pets</h2>
                    <button onClick={() => navigate('/wallet')} className="text-brand-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                        View All <ChevronRight size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex gap-4 overflow-hidden">
                        {[1,2].map(i => <div key={i} className="min-w-[280px] h-48 bg-white border border-slate-100 rounded-[2.5rem] animate-pulse" />)}
                    </div>
                ) : myPets.length > 0 ? (
                    <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
                        {myPets.map(pet => (
                            <div key={pet.pet_id} onClick={() => navigate('/wallet')}
                                className="min-w-[280px] md:min-w-[320px] bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-soft hover:shadow-lg transition-all snap-center group cursor-pointer">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-16 h-16 rounded-3xl overflow-hidden bg-slate-100 relative shrink-0">
                                        <img src={pet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200'} alt={pet.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200'; }} />
                                        <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{pet.name}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            {[pet.species, pet.breed, pet.age != null ? `${pet.age} yrs` : null].filter(Boolean).join(' · ')}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-brand-50 rounded-2xl flex items-center gap-2">
                                        <Activity size={16} className="text-brand-600" />
                                        <span className="text-[10px] font-black text-brand-600 uppercase">{pet.status || 'Healthy'}</span>
                                    </div>
                                    <div className="p-3 bg-tangerine-50 rounded-2xl flex items-center gap-2">
                                        <Wind size={16} className="text-tangerine-600" />
                                        <span className="text-[10px] font-black text-tangerine-600 uppercase">Active</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200"><Heart size={32} /></div>
                        <p className="text-slate-500 font-bold italic mb-5">No pets added yet.</p>
                        <button onClick={() => navigate('/wallet')} className="text-brand-600 font-black flex items-center gap-2 mx-auto hover:gap-3 transition-all">
                            Add your first pet <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </section>

            {/* Widgets */}
            <div className="grid grid-cols-1 gap-6">
                {/* Health wallet widget */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-emerald-600/20 gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0"><Stethoscope size={32} /></div>
                        <div>
                            <h3 className="text-2xl font-black mb-2">Health Wallet</h3>
                            <p className="text-emerald-100 font-medium text-sm leading-relaxed max-w-md">Medical records, vaccinations, and diagnoses — all synced from your vets.</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/wallet')} className="w-full md:w-auto px-8 py-4 border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors text-sm">Open Wallet →</button>
                </div>
            </div>

            {/* Quick actions */}
            <section>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Browse Pets',    icon: <PawPrint size={20} />,      to: '/adopt',        color: 'bg-brand-50 text-brand-600' },
                        { label: 'Messages',       icon: <MessageSquare size={20} />, to: '/messages',     color: 'bg-sky-50 text-sky-600' },
                        { label: 'Campaigns',      icon: <Megaphone size={20} />,     to: '/campaigns',    color: 'bg-rose-50 text-rose-500' },
                        { label: 'AI Assistant',   icon: <Sparkles size={20} />,      to: '/ai',           color: 'bg-violet-50 text-violet-600' },
                    ].map(({ label, icon, to, color }) => (
                        <button key={label} onClick={() => navigate(to)}
                            className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-3 shadow-soft hover:shadow-md transition-all active:scale-95 group text-center">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
                            <span className="text-xs font-black text-slate-700">{label}</span>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default UserDashboard;
