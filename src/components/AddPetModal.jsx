import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from './Toast';
import {
    X, Camera, Upload, PawPrint, Loader2, ChevronDown, Plus
} from 'lucide-react';

const SPECIES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Other'];
const STATUS_OPTS = ['Active', 'Healthy', 'Sick', 'Recovery'];

const AddPetModal = ({ user, onClose, onAdded }) => {
    const toast = useToast();
    const fileRef = useRef();
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);

    const [form, setForm] = useState({
        name: '', species: 'Dog', breed: '', age: '',
        status: 'Active', avatar_url: '', medical_history: '',
    });

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast({ type: 'error', message: 'Pet name is required.' });
        setSaving(true);
        try {
            let avatarUrl = form.avatar_url || null;

            // Upload photo if chosen
            if (file) {
                const ext = file.name.split('.').pop();
                const path = `pets/${user.id}/${Date.now()}.${ext}`;
                const { error: upErr } = await supabase.storage.from('pet_files').upload(path, file, { upsert: true });
                if (upErr) throw upErr;
                const { data: urlData } = supabase.storage.from('pet_files').getPublicUrl(path);
                avatarUrl = urlData.publicUrl;
            }

            const { error } = await supabase.from('pets').insert({
                name:            form.name.trim(),
                species:         form.species,
                breed:           form.breed.trim() || null,
                age:             form.age ? parseInt(form.age) : null,
                status:          form.status,
                owner_id:        user.id,
                avatar_url:      avatarUrl,
                medical_history: form.medical_history.trim() || null,
            });
            if (error) throw error;

            toast({ type: 'success', message: `${form.name} added to your Wallet! 🐾` });
            onAdded();
            onClose();
        } catch (err) {
            toast({ type: 'error', message: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-6">
            <div className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl max-h-[94vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-5 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Add a Pet</h2>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">Fill in your pet's details below</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto no-scrollbar p-8 space-y-5 flex-1">
                    {/* Avatar upload */}
                    <div className="flex flex-col items-center gap-3">
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="w-24 h-24 rounded-[1.75rem] bg-brand-50 border-2 border-dashed border-brand-200 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-100 transition-colors overflow-hidden relative group"
                        >
                            {preview ? (
                                <img src={preview} className="w-full h-full object-cover" alt="preview" />
                            ) : (
                                <>
                                    <Camera size={28} className="text-brand-400 mb-1" />
                                    <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Photo</span>
                                </>
                            )}
                            {preview && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload size={20} className="text-white" />
                                </div>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                        <p className="text-xs text-slate-400 font-medium">Tap to upload, or paste a URL below</p>
                        <input
                            type="url" placeholder="Or paste image URL…"
                            value={form.avatar_url}
                            onChange={e => { set('avatar_url', e.target.value); if (e.target.value) setPreview(e.target.value); }}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name *</label>
                        <input
                            type="text" required placeholder="e.g. Buddy"
                            value={form.name} onChange={e => set('name', e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* Species + Breed */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Species</label>
                            <div className="relative">
                                <select
                                    value={form.species} onChange={e => set('species', e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none"
                                >
                                    {SPECIES.map(s => <option key={s}>{s}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Breed</label>
                            <input
                                type="text" placeholder="e.g. Golden Retriever"
                                value={form.breed} onChange={e => set('breed', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Age + Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Age (years)</label>
                            <input
                                type="number" min="0" max="30" placeholder="e.g. 3"
                                value={form.age} onChange={e => set('age', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Status</label>
                            <div className="relative">
                                <select
                                    value={form.status} onChange={e => set('status', e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none"
                                >
                                    {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Medical history */}
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Medical Notes</label>
                        <textarea
                            rows={3} placeholder="Any known conditions, allergies, or medications…"
                            value={form.medical_history} onChange={e => set('medical_history', e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-700 italic focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none text-sm"
                        />
                    </div>

                    <button
                        type="submit" disabled={saving}
                        className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 size={20} className="animate-spin" /> : <><Plus size={20} /><span>Add Pet to Wallet</span></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddPetModal;
