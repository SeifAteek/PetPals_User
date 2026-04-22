import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from './Toast';
import {
    MessageSquare, Send, Building2, Loader2, ArrowLeft, MapPin, Stethoscope
} from 'lucide-react';

const SENDER = { client: 'Client', clinic: 'Clinic', shelter: 'Shelter' };

// ── Thread view ───────────────────────────────────────────────────────────────
const Thread = ({ user, clinic, shelter, onBack }) => {
    const toast = useToast();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef();

    const entityId   = clinic?.clinic_id   || shelter?.shelter_id;
    const entityName = clinic?.name         || shelter?.org_name;
    const isClinic   = !!clinic;

    const fetchMessages = async () => {
        try {
            let query = supabase
                .from('messages')
                .select('*')
                .eq('client_id', user.id)
                .order('created_at', { ascending: true });
            if (isClinic)  query = query.eq('clinic_id',  entityId);
            else            query = query.eq('shelter_id', entityId);
            const { data, error } = await query;
            if (error) throw error;
            setMessages(data || []);
        } catch (err) {
            toast({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMessages(); }, []);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // Real-time subscription
    useEffect(() => {
        const channel = supabase.channel(`messages-${entityId}-${user.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const m = payload.new;
                if (m.client_id === user.id && (m.clinic_id === entityId || m.shelter_id === entityId)) {
                    setMessages(prev => [...prev, m]);
                }
            }).subscribe();
        return () => supabase.removeChannel(channel);
    }, [entityId]);

    const send = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSending(true);
        try {
            const payload = { client_id: user.id, sender: SENDER.client, text: text.trim() };
            if (isClinic)  payload.clinic_id  = entityId;
            else            payload.shelter_id = entityId;
            const { error } = await supabase.from('messages').insert(payload);
            if (error) throw error;
            setText('');
            fetchMessages();
        } catch (err) {
            toast({ type: 'error', message: err.message });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Thread header */}
            <div className="flex items-center gap-4 px-6 md:px-10 py-5 bg-white border-b border-slate-100 shrink-0">
                <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
                    <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
                    {isClinic ? <Stethoscope size={20} /> : <Building2 size={20} />}
                </div>
                <div>
                    <h3 className="font-black text-slate-900">{entityName}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isClinic ? 'Veterinary Clinic' : 'Animal Shelter'}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 space-y-4">
                {loading ? (
                    <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-brand-500" size={32} /></div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-16">
                        <MessageSquare className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-bold italic text-sm">No messages yet. Say hi!</p>
                    </div>
                ) : messages.map(msg => {
                    const isMe = msg.sender === SENDER.client;
                    return (
                        <div key={msg.message_id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-5 py-3.5 rounded-3xl text-sm font-medium leading-relaxed ${
                                isMe
                                    ? 'bg-brand-600 text-white rounded-br-lg shadow-lg shadow-brand-600/20'
                                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-lg shadow-soft'
                            }`}>
                                <p>{msg.text}</p>
                                <p className={`text-[10px] font-bold mt-1.5 ${isMe ? 'text-brand-200' : 'text-slate-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={send} className="px-6 md:px-10 py-5 bg-white border-t border-slate-100 flex gap-3 shrink-0">
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={`Message ${entityName}…`}
                    className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
                <button
                    type="submit" disabled={sending || !text.trim()}
                    className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-40"
                >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>
        </div>
    );
};

// ── Conversation list ─────────────────────────────────────────────────────────
const Messages = ({ user }) => {
    const toast = useToast();
    const [clinics,   setClinics]   = useState([]);
    const [shelters,  setShelters]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [active,    setActive]    = useState(null); // { clinic } or { shelter }
    const [lastMsgs,  setLastMsgs]  = useState({}); // entityId → last message

    useEffect(() => { fetchEntities(); }, []);

    const fetchEntities = async () => {
        try {
            setLoading(true);
            // Get all clinics and shelters the user has had appointments/applications with
            const [{ data: clinicData }, { data: shelterData }, { data: msgData }] = await Promise.all([
                supabase.from('clinics').select('clinic_id, name, location'),
                supabase.from('shelter_profiles').select('shelter_id, org_name'),
                supabase.from('messages').select('*').eq('client_id', user.id).order('created_at', { ascending: false }),
            ]);
            setClinics(clinicData || []);
            setShelters(shelterData || []);

            // Build last message map
            const map = {};
            (msgData || []).forEach(m => {
                const key = m.clinic_id || m.shelter_id;
                if (!map[key]) map[key] = m;
            });
            setLastMsgs(map);
        } catch (err) {
            toast({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (active) {
        return <Thread user={user} clinic={active.clinic} shelter={active.shelter} onBack={() => { setActive(null); fetchEntities(); }} />;
    }

    const renderRow = (entity, idKey, nameKey, type) => {
        const id = entity[idKey];
        const last = lastMsgs[id];
        return (
            <button
                key={id}
                onClick={() => setActive(type === 'clinic' ? { clinic: entity } : { shelter: entity })}
                className="w-full flex items-center gap-4 bg-white border border-slate-100 rounded-[2rem] p-5 shadow-soft hover:shadow-md transition-all text-left group"
            >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${type === 'clinic' ? 'bg-brand-50 text-brand-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {type === 'clinic' ? <Stethoscope size={22} /> : <Building2 size={22} />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-black text-slate-900 truncate">{entity[nameKey]}</p>
                        {last && <span className="text-[10px] text-slate-400 font-bold shrink-0">{new Date(last.created_at).toLocaleDateString()}</span>}
                    </div>
                    {entity.location && (
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin size={10} className="text-tangerine-500 shrink-0" />{entity.location}
                        </p>
                    )}
                    {last && (
                        <p className="text-xs text-slate-500 font-medium mt-1 truncate italic">
                            {last.sender === 'Client' ? 'You: ' : ''}{last.text}
                        </p>
                    )}
                </div>
            </button>
        );
    };

    return (
        <div className="p-6 md:p-10 space-y-8 pb-28 md:pb-12">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1">Messages</h1>
                <p className="text-slate-500 font-medium italic">Chat with your clinics and shelters.</p>
            </div>

            {loading ? (
                <div className="flex justify-center pt-16"><Loader2 className="animate-spin text-brand-500" size={36} /></div>
            ) : (
                <div className="space-y-8">
                    {clinics.length > 0 && (
                        <section>
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Veterinary Clinics</h2>
                            <div className="space-y-3">
                                {clinics.map(c => renderRow(c, 'clinic_id', 'name', 'clinic'))}
                            </div>
                        </section>
                    )}
                    {shelters.length > 0 && (
                        <section>
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Animal Shelters</h2>
                            <div className="space-y-3">
                                {shelters.map(s => renderRow(s, 'shelter_id', 'org_name', 'shelter'))}
                            </div>
                        </section>
                    )}
                    {clinics.length === 0 && shelters.length === 0 && (
                        <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                            <MessageSquare className="mx-auto text-slate-200 mb-4" size={48} />
                            <h3 className="font-black text-slate-900 mb-1">No conversations yet</h3>
                            <p className="text-slate-400 font-medium italic text-sm">Book an appointment or adopt a pet to start chatting.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Messages;
