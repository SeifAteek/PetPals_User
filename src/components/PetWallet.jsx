import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from './Toast';
import { Activity, Stethoscope, Wind, MapPin, History, Loader2, Heart, FileText, Zap, Maximize2, Plus, Star } from 'lucide-react';
import AddPetModal from './AddPetModal';

const PetWallet = ({ user }) => {
    const toast = useToast();
    const [pets,           setPets]           = useState([]);
    const [adoptedPets,    setAdoptedPets]    = useState([]); // approved apps with pet data
    const [selectedPet,    setSelectedPet]    = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [collars,        setCollars]        = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [showAddModal,   setShowAddModal]   = useState(false);

    const fetchPets = async () => {
        try {
            setLoading(true);

            // 1. Owned pets
            const { data: owned, error } = await supabase
                .from('pets').select('*').eq('owner_id', user.id);
            if (error) throw error;

            // 2. Pets with approved applications (adoption approved but owner_id not yet updated)
            const { data: adData } = await supabase
                .from('adopter_profiles').select('adopter_id').eq('user_id', user.id).single();

            let approvedPets = [];
            if (adData?.adopter_id) {
                const { data: apps } = await supabase
                    .from('applications')
                    .select('*, pets(*)')
                    .eq('adopter_id', adData.adopter_id)
                    .eq('status', 'Approved');

                // Only show pets not already in owned list
                const ownedIds = new Set((owned || []).map(p => p.pet_id));
                approvedPets = (apps || [])
                    .filter(a => a.pets && !ownedIds.has(a.pets.pet_id))
                    .map(a => ({ ...a.pets, _adopted: true }));

                // Try to update owner_id on approved pets (if RLS allows)
                for (const pet of approvedPets) {
                    try {
                        await supabase.from('pets').update({ owner_id: user.id }).eq('pet_id', pet.pet_id);
                    } catch (_) { /* silent — RLS may block this */ }
                }
            }

            setPets(owned || []);
            setAdoptedPets(approvedPets);

            const allPets = [...(owned || []), ...approvedPets];
            if (allPets.length > 0 && !selectedPet) setSelectedPet(allPets[0]);
        } catch (err) {
            toast({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPets(); }, [user]);

    useEffect(() => {
        if (!selectedPet) return;
        const fetchDetails = async () => {
            try {
                setRecordsLoading(true);
                const [{ data: records }, { data: collarData }] = await Promise.all([
                    supabase.from('medical_records').select('*, clinics(name, location)')
                        .eq('pet_id', selectedPet.pet_id).order('visit_date', { ascending: false }),
                    supabase.from('smart_collars').select('*').eq('pet_id', selectedPet.pet_id).single(),
                ]);
                setMedicalRecords(records || []);
                setCollars(collarData ? [collarData] : []);
            } catch (err) {
                console.error(err);
            } finally {
                setRecordsLoading(false);
            }
        };
        fetchDetails();
    }, [selectedPet]);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        </div>
    );

    const allPets = [...pets, ...adoptedPets];

    return (
        <>
            <div className="flex flex-col h-full bg-slate-50">
                {/* Pet selector strip */}
                <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0">
                    {allPets.map(pet => (
                        <button
                            key={pet.pet_id}
                            onClick={() => setSelectedPet(pet)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap font-bold text-sm shrink-0 ${
                                selectedPet?.pet_id === pet.pet_id
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                {pet.avatar_url
                                    ? <img src={pet.avatar_url} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                                    : <div className="w-full h-full flex items-center justify-center text-[10px] font-black">{pet.name.charAt(0)}</div>
                                }
                            </div>
                            {pet.name}
                            {pet._adopted && <Star size={12} className="text-amber-300" fill="currentColor" />}
                        </button>
                    ))}
                    {/* Add Pet button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-50 text-brand-600 font-bold text-sm hover:bg-brand-100 transition-all whitespace-nowrap shrink-0 border-2 border-dashed border-brand-200"
                    >
                        <Plus size={16} /> Add Pet
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
                    {allPets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6"><Heart size={40} /></div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">No Pets Yet</h3>
                            <p className="text-slate-500 font-medium italic mb-6">Add your own pet or adopt one from our hub.</p>
                            <button onClick={() => setShowAddModal(true)} className="px-8 py-4 bg-brand-600 text-white font-black rounded-2xl shadow-xl shadow-brand-600/20 flex items-center gap-2 hover:bg-brand-700 transition-all active:scale-95">
                                <Plus size={20} /> Add a Pet
                            </button>
                        </div>
                    ) : selectedPet ? (
                        <>
                            {/* Pet hero card */}
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-soft flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl overflow-hidden bg-slate-100 shrink-0">
                                    <img src={selectedPet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200'}
                                        alt={selectedPet.name} className="w-full h-full object-cover"
                                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200'; }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-2xl font-black text-slate-900">{selectedPet.name}</h2>
                                        {selectedPet._adopted && (
                                            <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 flex items-center gap-1">
                                                <Star size={10} fill="currentColor" /> Adopted
                                            </span>
                                        )}
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                                            selectedPet.status === 'Healthy' || selectedPet.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : selectedPet.status === 'Sick'
                                                    ? 'bg-red-50 text-red-500 border-red-100'
                                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>{selectedPet.status}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 mt-1">
                                        {[selectedPet.species, selectedPet.breed, selectedPet.age != null ? `${selectedPet.age} yrs` : null].filter(Boolean).join(' · ')}
                                    </p>
                                    {selectedPet.medical_history && (
                                        <p className="text-xs text-slate-500 font-medium mt-2 italic line-clamp-2">{selectedPet.medical_history}</p>
                                    )}
                                </div>
                            </div>

                            {/* Vitals row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Heart Rate', value: '82 bpm',   icon: <Activity size={22} />, bg: 'bg-pink-50 text-pink-500' },
                                    { label: 'Respiration', value: '22 /min', icon: <Wind     size={22} />, bg: 'bg-blue-50 text-blue-500' },
                                    { label: 'Activity',   value: 'Active',   icon: <Zap      size={22} />, bg: 'bg-amber-50 text-amber-500' },
                                ].map(({ label, value, icon, bg }) => (
                                    <div key={label} className="bg-white border border-slate-100 rounded-[2rem] p-5 flex items-center gap-4 shadow-soft">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>{icon}</div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                            <p className="text-xl font-black text-slate-900 mt-0.5">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Medical records */}
                                <div>
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="w-2 h-2 bg-brand-600 rounded-full animate-pulse" />
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Health History</h3>
                                    </div>
                                    {recordsLoading ? (
                                        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-100" />)}</div>
                                    ) : medicalRecords.length > 0 ? (
                                        <div className="space-y-4">
                                            {medicalRecords.map(rec => (
                                                <div key={rec.record_id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-soft hover:shadow-md transition-all group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-black text-slate-900">{rec.diagnosis || 'Health Exam'}</h4>
                                                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                                                <MapPin size={10} className="text-tangerine-500" />{rec.clinics?.name}
                                                            </p>
                                                            {rec.vet_name && <p className="text-xs text-slate-400 font-medium mt-0.5">Dr. {rec.vet_name}</p>}
                                                        </div>
                                                        <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100 shrink-0">
                                                            {new Date(rec.visit_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 font-medium mb-4 leading-relaxed line-clamp-2">{rec.treatment}</p>
                                                    {rec.attachment_url && (
                                                        <a href={rec.attachment_url} target="_blank" rel="noreferrer"
                                                            className="w-full py-3 bg-slate-50 text-slate-500 text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 hover:text-white transition-all">
                                                            <FileText size={14} /> View Attachment
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                                            <History size={32} className="mx-auto text-slate-200 mb-2" />
                                            <p className="text-slate-400 font-bold text-sm italic">No records yet for {selectedPet.name}.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Collar data */}
                                <div>
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="w-2 h-2 bg-tangerine-500 rounded-full" />
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Smart Collar</h3>
                                    </div>
                                    {collars.length > 0 ? (
                                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                            <div className="absolute top-5 right-5">
                                                <Zap className="text-tangerine-500 animate-pulse" size={28} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Live Tracking</p>
                                            <h3 className="text-2xl font-black mb-6">Active Connection</h3>
                                            <div className="bg-white/10 rounded-2xl p-5 border border-white/10 mb-6 backdrop-blur-sm">
                                                <div className="flex justify-between text-xs font-bold opacity-60 mb-3"><span>Serial</span><span>Battery</span></div>
                                                <div className="flex justify-between font-black text-base">
                                                    <span className="tracking-widest">{collars[0].serial_number}</span>
                                                    <span className="text-emerald-400">92%</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium mb-5">
                                                Last synced: {new Date(collars[0].last_sync_time).toLocaleString()}
                                            </p>
                                            <button className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-50 transition-colors text-sm">
                                                <Maximize2 size={16} /> Open Live Map
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
                                            <Zap size={32} className="mx-auto text-slate-300 mb-4" />
                                            <h4 className="font-black text-slate-900 mb-2">No Collar Linked</h4>
                                            <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">Unlock real-time health monitoring with a PetPals Smart Collar.</p>
                                            <button className="px-8 py-3 bg-white text-brand-600 font-black rounded-xl shadow-soft hover:shadow-md transition-all border border-slate-100 text-sm">Order Now</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>

            {showAddModal && (
                <AddPetModal
                    user={user}
                    onClose={() => setShowAddModal(false)}
                    onAdded={() => { fetchPets(); }}
                />
            )}
        </>
    );
};

export default PetWallet;
