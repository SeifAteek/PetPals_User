import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from './Toast';
import {
    Heart, Target, Calendar, Building2, Loader2, X, DollarSign, TrendingUp
} from 'lucide-react';

const ProgressBar = ({ current, goal }) => {
    const pct = Math.min(100, Math.round((current / goal) * 100));
    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                <span>${Number(current).toLocaleString()} raised</span>
                <span>{pct}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-brand-500 to-tangerine-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-[10px] font-black text-slate-400 mt-1.5 uppercase tracking-widest">
                Goal: ${Number(goal).toLocaleString()}
            </p>
        </div>
    );
};

const Campaigns = ({ user }) => {
    const toast = useToast();
    const [campaigns, setCampaigns] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [donating,  setDonating]  = useState(null); // selected campaign
    const [amount,    setAmount]    = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [myDonations, setMyDonations] = useState([]);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [{ data: camps }, { data: doms }] = await Promise.all([
                supabase.from('campaigns')
                    .select('*, shelter_profiles(org_name)')
                    .order('created_at', { ascending: false }),
                supabase.from('donations')
                    .select('*, campaigns(title)')
                    .eq('user_id', user.id)
                    .order('donation_date', { ascending: false }),
            ]);
            setCampaigns(camps || []);
            setMyDonations(doms || []);
        } catch (err) {
            toast({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    const donate = async () => {
        const num = parseFloat(amount);
        if (!num || num <= 0) return toast({ type: 'error', message: 'Enter a valid amount.' });
        setSubmitting(true);
        try {
            const { error } = await supabase.from('donations').insert({
                campaign_id:   donating.campaign_id,
                user_id:       user.id,
                amount:        num,
            });
            if (error) throw error;
            // Update campaign current_amount
            await supabase.from('campaigns')
                .update({ current_amount: donating.current_amount + num })
                .eq('campaign_id', donating.campaign_id);
            toast({ type: 'success', message: `Thank you! $${num} donated to "${donating.title}" 💙` });
            setDonating(null);
            setAmount('');
            fetchAll();
        } catch (err) {
            toast({ type: 'error', message: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const totalDonated = myDonations.reduce((s, d) => s + Number(d.amount), 0);

    return (
        <div className="p-6 md:p-10 space-y-8 pb-28 md:pb-12">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1">Campaigns</h1>
                <p className="text-slate-500 font-medium italic">Support shelters doing amazing work.</p>
            </div>

            {/* My impact stat */}
            {myDonations.length > 0 && (
                <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-brand-600/20">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Heart size={24} fill="currentColor" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-200">Your Impact</p>
                    </div>
                    <p className="text-4xl font-black">${totalDonated.toLocaleString()}</p>
                    <p className="text-brand-200 font-bold text-sm mt-1">donated across {myDonations.length} campaign{myDonations.length > 1 ? 's' : ''}</p>
                </div>
            )}

            {/* Campaign cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[1,2,3].map(i => <div key={i} className="h-56 bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />)}
                </div>
            ) : campaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {campaigns.map(camp => {
                        const ended = camp.end_date && new Date(camp.end_date) < new Date();
                        return (
                            <div key={camp.campaign_id} className="bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-soft hover:shadow-lg transition-all flex flex-col gap-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg leading-tight">{camp.title}</h3>
                                        {camp.shelter_profiles?.org_name && (
                                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1">
                                                <Building2 size={10} className="text-tangerine-500" />
                                                {camp.shelter_profiles.org_name}
                                            </p>
                                        )}
                                    </div>
                                    {camp.end_date && (
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                <Calendar size={10} />
                                                {ended ? 'Ended' : 'Ends'}
                                            </p>
                                            <p className="text-xs font-bold text-slate-600 mt-0.5">
                                                {new Date(camp.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <ProgressBar current={camp.current_amount || 0} goal={camp.goal_amount} />

                                <button
                                    onClick={() => { setDonating(camp); setAmount(''); }}
                                    disabled={ended}
                                    className={`w-full py-4 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm ${
                                        ended
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700'
                                    }`}
                                >
                                    <Heart size={16} fill={ended ? 'none' : 'currentColor'} />
                                    {ended ? 'Campaign Ended' : 'Donate Now'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                    <Target className="mx-auto text-slate-200 mb-4" size={48} />
                    <h3 className="font-black text-slate-900 mb-1">No campaigns yet</h3>
                    <p className="text-slate-400 font-medium italic text-sm">Shelters will post fundraising campaigns here.</p>
                </div>
            )}

            {/* My donations history */}
            {myDonations.length > 0 && (
                <section>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">My Donation History</h2>
                    <div className="space-y-3">
                        {myDonations.map(d => (
                            <div key={d.donation_id} className="bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-soft flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
                                    <TrendingUp size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 text-sm truncate">{d.campaigns?.title || 'Campaign'}</p>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                        {new Date(d.donation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <span className="font-black text-emerald-600 text-sm">${Number(d.amount).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Donate modal */}
            {donating && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-6">
                    <div className="bg-white w-full max-w-sm rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl p-8 space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Donating to</p>
                                <h3 className="text-xl font-black text-slate-900">{donating.title}</h3>
                            </div>
                            <button onClick={() => setDonating(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
                                <X size={18} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Amount (USD)</label>
                            <div className="flex gap-3 mb-3">
                                {[5, 10, 25, 50].map(v => (
                                    <button key={v} type="button" onClick={() => setAmount(String(v))}
                                        className={`flex-1 py-3 rounded-2xl font-black text-sm border-2 transition-all ${amount === String(v) ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                                        ${v}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input type="number" min="1" placeholder="Custom amount"
                                    value={amount} onChange={e => setAmount(e.target.value)}
                                    className="w-full pl-9 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setDonating(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                            <button onClick={donate} disabled={submitting || !amount}
                                className="flex-[2] py-4 bg-brand-600 text-white font-black rounded-2xl shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <><Heart size={16} fill="currentColor" /> Donate</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Campaigns;
