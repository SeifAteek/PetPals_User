import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from './Toast';
import {
    User, Home as HomeIcon, Bell, LogOut, Save, Loader2,
    Shield, Heart, ChevronRight, CheckCircle2, Camera, Upload
} from 'lucide-react';

const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-12 h-7 rounded-full relative transition-all duration-300 focus:outline-none ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
    >
        <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
);

const SectionHeader = ({ icon, title, subtitle, color = 'brand' }) => {
    const colors = {
        brand:     'bg-brand-50 text-brand-600',
        tangerine: 'bg-tangerine-50 text-tangerine-600',
        emerald:   'bg-emerald-50 text-emerald-600',
        red:       'bg-red-50 text-red-500',
    };
    return (
        <div className="p-7 border-b border-slate-50 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
            <div>
                <h2 className="font-black text-slate-900">{title}</h2>
                <p className="text-xs font-bold text-slate-400 mt-0.5">{subtitle}</p>
            </div>
        </div>
    );
};

const Settings = ({ user }) => {
    const toast = useToast();
    const fileRef = useRef();
    const [profile, setProfile]               = useState(null);
    const [adopterProfile, setAdopterProfile] = useState(null);
    const [loading, setLoading]               = useState(true);
    const [saving, setSaving]                 = useState(false);
    const [displayName, setDisplayName]       = useState('');
    const [housing, setHousing]               = useState('Apartment');
    const [hasOtherPets, setHasOtherPets]     = useState(false);
    const [notifs, setNotifs] = useState({ appointments: true, adoption: true, tips: false });
    const [avatarPreview, setAvatarPreview]   = useState(null);
    const [avatarFile, setAvatarFile]         = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('petpals_notifs');
        if (stored) try { setNotifs(JSON.parse(stored)); } catch (_) {}
        const cachedAvatar = localStorage.getItem(`petpals_avatar_${user.id}`);
        if (cachedAvatar) setAvatarPreview(cachedAvatar);
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [{ data: prof }, { data: adopter }] = await Promise.all([
                supabase.from('profiles').select('*').eq('user_id', user.id).single(),
                supabase.from('adopter_profiles').select('*').eq('user_id', user.id).single(),
            ]);
            setProfile(prof);
            setAdopterProfile(adopter);
            if (prof)    { setDisplayName(prof.user_name || ''); }
            if (adopter) { setHousing(adopter.housing_type || 'Apartment'); setHasOtherPets(adopter.has_other_pets || false); }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const save = async () => {
        setSaving(true);
        try {
            // Upload avatar if selected
            if (avatarFile) {
                setUploadingAvatar(true);
                const ext  = avatarFile.name.split('.').pop();
                const path = `avatars/${user.id}.${ext}`;
                const { error: upErr } = await supabase.storage.from('pet_files').upload(path, avatarFile, { upsert: true });
                if (upErr) throw upErr;
                const { data: urlData } = supabase.storage.from('pet_files').getPublicUrl(path);
                localStorage.setItem(`petpals_avatar_${user.id}`, urlData.publicUrl);
                setAvatarPreview(urlData.publicUrl);
                setAvatarFile(null);
                setUploadingAvatar(false);
            }
            if (profile) {
                const { error } = await supabase.from('profiles').update({ user_name: displayName }).eq('user_id', user.id);
                if (error) throw error;
            }
            if (adopterProfile) {
                const { error } = await supabase.from('adopter_profiles')
                    .update({ housing_type: housing, has_other_pets: hasOtherPets }).eq('user_id', user.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('adopter_profiles')
                    .insert({ user_id: user.id, housing_type: housing, has_other_pets: hasOtherPets });
                if (error) throw error;
            }
            localStorage.setItem('petpals_notifs', JSON.stringify(notifs));
            toast({ type: 'success', message: 'Settings saved!' });
        } catch (err) {
            toast({ type: 'error', message: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        </div>
    );

    const initials = (displayName || user.email || '?').charAt(0).toUpperCase();
    const cachedAvatar = avatarPreview || localStorage.getItem(`petpals_avatar_${user.id}`);

    return (
        <div className="p-6 md:p-10 space-y-6 max-w-2xl mx-auto pb-28 md:pb-12">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1">Settings</h1>
                <p className="text-slate-500 font-medium italic">Manage your profile and preferences.</p>
            </div>

            {/* Avatar + profile */}
            <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
                <SectionHeader icon={<User size={20} />} title="Profile" subtitle="Your public display information" color="brand" />
                <div className="p-7 space-y-5">
                    <div className="flex items-center gap-5">
                        <div className="relative group cursor-pointer shrink-0" onClick={() => fileRef.current?.click()}>
                            {cachedAvatar ? (
                                <img src={cachedAvatar} alt="avatar" className="w-20 h-20 rounded-[1.5rem] object-cover shadow-lg" />
                            ) : (
                                <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-[1.5rem] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-brand-600/20">
                                    {initials}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 rounded-[1.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={20} className="text-white" />
                            </div>
                            {uploadingAvatar && (
                                <div className="absolute inset-0 bg-white/80 rounded-[1.5rem] flex items-center justify-center">
                                    <Loader2 size={20} className="animate-spin text-brand-600" />
                                </div>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); } }} />
                        <div>
                            <p className="font-black text-slate-900 text-lg leading-tight">{displayName || 'Pet Lover'}</p>
                            <p className="text-sm font-medium text-slate-400 mt-0.5">{user.email}</p>
                            <button type="button" onClick={() => fileRef.current?.click()} className="text-[10px] text-brand-500 font-bold mt-1.5 hover:underline">
                                {cachedAvatar ? '↑ Change photo' : '↑ Upload photo'}
                            </button>
                            <span className="block mt-1 px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-100 w-fit">Adopter</span>
                        </div>
                    </div>


                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-semibold text-slate-900 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                        <div className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-semibold text-slate-400 flex items-center gap-3">
                            <span className="flex-1 text-sm truncate">{user.email}</span>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 whitespace-nowrap">Verified</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Living situation */}
            <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
                <SectionHeader icon={<HomeIcon size={20} />} title="Living Situation" subtitle="Helps us match you with the perfect pet" color="tangerine" />
                <div className="p-7 space-y-5">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Housing Type</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[{ v: 'Apartment', e: '🏢' }, { v: 'House', e: '🏠' }, { v: 'Farm', e: '🌾' }].map(({ v, e }) => (
                                <button
                                    key={v} type="button" onClick={() => setHousing(v)}
                                    className={`py-4 rounded-2xl font-bold text-sm transition-all border-2 ${housing === v ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-brand-200'}`}
                                >
                                    <span className="block text-xl mb-1">{e}</span>{v}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <p className="font-bold text-slate-800 text-sm">Already have pets?</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Helps match behavioral compatibility</p>
                        </div>
                        <Toggle checked={hasOtherPets} onChange={setHasOtherPets} />
                    </div>
                </div>
            </section>

            {/* Notifications */}
            <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
                <SectionHeader icon={<Bell size={20} />} title="Notifications" subtitle="Choose what updates you receive" color="emerald" />
                <div className="divide-y divide-slate-50">
                    {[
                        { key: 'appointments', label: 'Appointment Reminders', desc: 'Notified before your vet visits' },
                        { key: 'adoption',     label: 'Adoption Updates',       desc: 'Status changes on your applications' },
                        { key: 'tips',         label: 'Pet Care Tips',           desc: 'Weekly tips and PetPals news' },
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between px-7 py-5">
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{label}</p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{desc}</p>
                            </div>
                            <Toggle checked={notifs[key]} onChange={v => setNotifs(prev => ({ ...prev, [key]: v }))} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Save */}
            <button
                onClick={save} disabled={saving}
                className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /><span>Save Changes</span></>}
            </button>

            {/* Account */}
            <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
                <SectionHeader icon={<Shield size={20} />} title="Account" subtitle="App info and account actions" color="red" />
                <div className="p-7 space-y-3">
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">App Version</p>
                            <p className="font-bold text-slate-700 mt-0.5 text-sm">PetPals v1.0.0</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Latest</span>
                    </div>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-2xl hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Settings;
