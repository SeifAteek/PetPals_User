import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from './Toast';
import {
    Search, MapPin, Heart, ArrowRight, Loader2, X,
    PawPrint, CheckCircle2, Home as HomeIcon, MessageSquare,
    Info, Clock, Star, Filter, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SPECIES = ['All', 'Dog', 'Cat', 'Bird', 'Rabbit'];

const StatusBadge = ({ status }) => {
    const map = {
        'Under Review': 'bg-amber-50 text-amber-600 border-amber-100',
        'Approved':     'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Rejected':     'bg-red-50 text-red-500 border-red-100',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${map[status] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            {status}
        </span>
    );
};

const AdoptionHub = ({ user }) => {
    const toast = useToast();
    const navigate = useNavigate();
    const [tab,          setTab]          = useState('browse'); // browse | applications
    const [pets,         setPets]         = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [appsLoading,  setAppsLoading]  = useState(false);
    const [filter,       setFilter]       = useState('All');
    const [search,       setSearch]       = useState('');
    const [selectedPet,  setSelectedPet]  = useState(null);
    const [appStep,      setAppStep]      = useState(1);
    const [appLoading,   setAppLoading]   = useState(false);
    const [formData,     setFormData]     = useState({ housing_type: 'House', message: '' });

    useEffect(() => { fetchPets(); }, [filter]);
    useEffect(() => { if (tab === 'applications') fetchApplications(); }, [tab]);

    const fetchPets = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('pets')
                .select('*, shelter_profiles(org_name)')
                .eq('status', 'Available')
                .not('shelter_id', 'is', null);
            if (filter !== 'All') query = query.eq('species', filter);
            const { data, error } = await query;
            if (error) throw error;
            setPets(data || []);
        } catch (err) {
            toast({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            setAppsLoading(true);
            const { data: adData } = await supabase
                .from('adopter_profiles').select('adopter_id').eq('user_id', user.id).single();
            if (!adData) { setApplications([]); return; }
            const { data, error } = await supabase
                .from('applications')
                .select('*, pets(name, species, avatar_url)')
                .eq('adopter_id', adData.adopter_id)
                .order('submission_date', { ascending: false });
            if (error) throw error;
            setApplications(data || []);
        } catch (err) {
            toast({ type: 'error', message: err.message });
        } finally {
            setAppsLoading(false);
        }
    };

    const handleApply = async () => {
        setAppLoading(true);
        try {
            const { data: adData } = await supabase
                .from('adopter_profiles').select('adopter_id').eq('user_id', user.id).single();
            if (!adData) throw new Error('Complete your profile in Settings first.');
            const { error } = await supabase.from('applications').insert({
                pet_id: selectedPet.pet_id,
                adopter_id: adData.adopter_id,
                status: 'Under Review',
            });
            if (error) throw error;
            setAppStep(3);
            toast({ type: 'success', message: `Application for ${selectedPet.name} submitted!` });
        } catch (err) {
            toast({ type: 'error', message: err.message });
        } finally {
            setAppLoading(false);
        }
    };

    const closeModal = () => { setSelectedPet(null); setAppStep(1); };

    // Client-side search filter
    const filtered = pets.filter(p => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return p.name?.toLowerCase().includes(q) || p.breed?.toLowerCase().includes(q) || p.species?.toLowerCase().includes(q);
    });

    return (
        <div className="p-6 md:p-10 space-y-8 min-h-full pb-28 md:pb-12">

            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1">Find a Companion</h1>
                <p className="text-slate-500 font-medium italic">Hundreds of pals waiting for a forever home.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {[
                    { id: 'browse',       label: 'Browse Pets' },
                    { id: 'applications', label: `My Applications${applications.length > 0 ? ` (${applications.length})` : ''}` },
                ].map(t => (
                    <button
                        key={t.id} onClick={() => setTab(t.id)}
                        className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all ${tab === t.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100 hover:border-brand-200'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── BROWSE TAB ── */}
            {tab === 'browse' && (
                <>
                    {/* Search + filter row */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, breed, or species…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-13 pr-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-soft focus:ring-2 focus:ring-brand-500 font-medium transition-all outline-none text-sm"
                                style={{ paddingLeft: '3.25rem' }}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Species pills */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                        {SPECIES.map(s => (
                            <button
                                key={s} onClick={() => setFilter(s)}
                                className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap active:scale-95 border ${filter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 hover:border-brand-200'}`}
                            >
                                {s === 'All' ? '🐾 All' : s === 'Dog' ? '🐕 Dogs' : s === 'Cat' ? '🐈 Cats' : s === 'Bird' ? '🦜 Birds' : '🐇 Rabbits'}
                            </button>
                        ))}
                    </div>

                    {/* Pet grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />)}
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map(pet => (
                                <div
                                    key={pet.pet_id}
                                    onClick={() => { setSelectedPet(pet); setAppStep(1); }}
                                    className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-soft hover:shadow-xl transition-all group cursor-pointer"
                                >
                                    <div className="aspect-[4/5] relative overflow-hidden bg-slate-100">
                                        <img
                                            src={pet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400&auto=format&fit=crop'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt={pet.name}
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400&auto=format&fit=crop'; }}
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="px-3 py-1.5 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                                                {pet.species}
                                            </span>
                                        </div>
                                        <button
                                            onClick={e => e.stopPropagation()}
                                            className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur rounded-full text-slate-300 hover:text-red-500 transition-colors shadow-sm"
                                        >
                                            <Heart size={18} />
                                        </button>
                                        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/70 to-transparent text-white translate-y-1 group-hover:translate-y-0 transition-transform">
                                            <h3 className="text-xl font-black">{pet.name}</h3>
                                            {pet.breed && <p className="text-xs font-bold text-slate-300 mt-0.5">{pet.breed}</p>}
                                            {pet.shelter_profiles?.org_name && (
                                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                                                    <MapPin size={10} className="text-tangerine-400" />
                                                    {pet.shelter_profiles.org_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <PawPrint className="mx-auto text-slate-200 mb-4" size={56} />
                            <h3 className="text-xl font-black text-slate-900 mb-1">No pals found</h3>
                            <p className="text-slate-400 font-medium italic text-sm">Try adjusting your search or filter.</p>
                        </div>
                    )}
                </>
            )}

            {/* ── APPLICATIONS TAB ── */}
            {tab === 'applications' && (
                <div className="space-y-4">
                    {appsLoading ? (
                        <>{[1,2].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-100" />)}</>
                    ) : applications.length > 0 ? (
                        applications.map(app => (
                            <div key={app.application_id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-soft flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                                    <img
                                        src={app.pets?.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200'}
                                        alt={app.pets?.name}
                                        className="w-full h-full object-cover"
                                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200'; }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-slate-900 text-lg truncate">{app.pets?.name}</h3>
                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                        <Clock size={11} />
                                        {new Date(app.submission_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <StatusBadge status={app.status} />
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                            <Star className="mx-auto text-slate-200 mb-4" size={48} />
                            <h3 className="text-lg font-black text-slate-900 mb-1">No applications yet</h3>
                            <p className="text-slate-400 font-medium italic text-sm">Browse pets and submit your first adoption request!</p>
                            <button onClick={() => setTab('browse')} className="mt-5 px-6 py-3 bg-brand-600 text-white font-bold rounded-2xl text-sm">
                                Browse Pets
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Pet Detail Modal ── */}
            {selectedPet && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
                        {/* Image */}
                        <div className="h-60 relative shrink-0">
                            <img
                                src={selectedPet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600'}
                                className="w-full h-full object-cover"
                                alt={selectedPet.name}
                                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
                            <button onClick={closeModal} className="absolute top-4 right-4 p-2 bg-white/30 hover:bg-white/50 rounded-xl text-white backdrop-blur transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto no-scrollbar">
                            <div className="px-8 pb-8 space-y-6">
                                {appStep === 1 && (
                                    <>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <h2 className="text-3xl font-black text-slate-900">{selectedPet.name}</h2>
                                                <p className="text-brand-600 font-bold text-sm mt-1 uppercase tracking-widest">{selectedPet.breed || selectedPet.species}</p>
                                            </div>
                                            {selectedPet.age != null && (
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-slate-900">{selectedPet.age}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">yrs old</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { icon: <PawPrint size={20} className="text-brand-600" />, label: 'Size', val: 'Medium' },
                                                { icon: <Heart size={20} className="text-red-500" />,    label: 'Health', val: 'Good' },
                                                { icon: <CheckCircle2 size={20} className="text-emerald-500" />, label: 'Status', val: 'Available' },
                                            ].map(({ icon, label, val }) => (
                                                <div key={label} className="bg-slate-50 p-4 rounded-2xl text-center">
                                                    <div className="flex justify-center mb-1">{icon}</div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                                    <p className="font-bold text-slate-800 text-sm mt-0.5">{val}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {selectedPet.medical_history && (
                                            <div className="bg-brand-50 rounded-2xl p-5">
                                                <p className="text-xs font-black text-brand-600 uppercase tracking-widest mb-2 flex items-center gap-1"><Info size={12} /> Notes</p>
                                                <p className="text-sm text-slate-700 font-medium leading-relaxed">{selectedPet.medical_history}</p>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setAppStep(2)}
                                                className="flex-[2] py-5 bg-brand-600 text-white font-black rounded-2xl shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <span>Start Adoption</span><ArrowRight size={20} />
                                            </button>
                                            <button
                                                onClick={() => navigate('/messages')}
                                                className="flex-1 py-5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                        </div>
                                    </>
                                )}

                                {appStep === 2 && (
                                    <div className="space-y-5">
                                        <h3 className="text-2xl font-black text-slate-900">Adoption Application</h3>
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                                <HomeIcon size={12} /> My Housing
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Apartment', 'House', 'Farm'].map(t => (
                                                    <button key={t} type="button"
                                                        onClick={() => setFormData({ ...formData, housing_type: t })}
                                                        className={`py-3 rounded-2xl font-bold text-sm border-2 transition-all ${formData.housing_type === t ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                                                    >{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                                <MessageSquare size={12} /> Message to shelter
                                            </label>
                                            <textarea rows={3}
                                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium italic text-sm resize-none outline-none"
                                                placeholder="Tell the shelter why you're a great match…"
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => setAppStep(1)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Back</button>
                                            <button onClick={handleApply} disabled={appLoading} className="flex-[2] py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-brand-600 transition-all active:scale-95 flex items-center justify-center gap-2">
                                                {appLoading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Application'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {appStep === 3 && (
                                    <div className="py-8 text-center space-y-4">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900">Request Sent!</h2>
                                        <p className="text-slate-500 font-medium max-w-xs mx-auto italic text-sm">
                                            The shelter will review your application for <strong className="text-slate-800 not-italic">{selectedPet.name}</strong> and get back to you.
                                        </p>
                                        <button onClick={closeModal} className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl shadow-lg hover:bg-brand-700 transition-all">
                                            Awesome! 🎉
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdoptionHub;
