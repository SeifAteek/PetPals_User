import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { LayoutDashboard, MessageSquare, Clock, CheckCircle, XCircle, Heart, Loader2 } from 'lucide-react';

const UserPortal = ({ user, onClose }) => {
    const [activeTab, setActiveTab] = useState('applications');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        const fetchUserApps = async () => {
            try {
                setLoading(true);
                const { data: adData } = await supabase
                    .from('adopter_profiles')
                    .select('adopter_id')
                    .eq('user_id', user.id)
                    .single();

                if (!adData) {
                    setApplications([]);
                    return;
                }

                const { data, error } = await supabase
                    .from('applications')
                    .select(`
                        *,
                        pet:pets(name, species, breed, avatar_url, shelter_profiles(org_name, shelter_id))
                    `)
                    .eq('adopter_id', adData.adopter_id)
                    .order('submission_date', { ascending: false });

                if (error) throw error;
                setApplications(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserApps();
    }, [user]);

    const getStatusIcon = (status) => {
        if (status === 'Approved') return <CheckCircle className="text-emerald-500" size={20} />;
        if (status === 'Rejected') return <XCircle className="text-red-500" size={20} />;
        return <Clock className="text-amber-500" size={20} />;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[80vh] flex overflow-hidden shadow-2xl relative">
                {/* Sidebar */}
                <div className="w-20 md:w-64 bg-slate-50 border-r border-slate-100 flex flex-col p-6">
                    <button onClick={onClose} className="mb-10 text-slate-400 hover:text-slate-900 font-black text-2xl">×</button>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={() => setActiveTab('applications')}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === 'applications' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <LayoutDashboard size={22} />
                            <span className="hidden md:block font-bold">Applications</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('messages')}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === 'messages' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <MessageSquare size={22} />
                            <span className="hidden md:block font-bold">Messages</span>
                        </button>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-200">
                        <div className="flex items-center gap-3 p-2">
                             <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-black">
                                {user.user_metadata?.full_name?.charAt(0) || 'U'}
                             </div>
                             <div className="hidden md:block overflow-hidden">
                                <p className="text-sm font-black text-slate-900 truncate">{user.user_metadata?.full_name || 'User'}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Adopter Profile</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-white overflow-y-auto p-10">
                    {activeTab === 'applications' && (
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-8">Your Applications</h2>
                            {loading ? (
                                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-500" /></div>
                            ) : applications.length === 0 ? (
                                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                    <Heart className="mx-auto text-slate-200 mb-4" size={48} />
                                    <p className="text-slate-500 font-bold italic">No applications yet. Go discover your pal!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {applications.map(app => (
                                        <div key={app.application_id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-soft flex items-center gap-6 hover:shadow-md transition-shadow">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                                                <img src={app.pet?.avatar_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xl font-black text-slate-900">{app.pet?.name}</h4>
                                                <p className="text-sm text-slate-500 font-medium">{app.pet?.shelter_profiles?.org_name}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                                                    {getStatusIcon(app.status)}
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-700">{app.status}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                    Applied {new Date(app.submission_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                             <MessageSquare size={64} className="mb-4 opacity-10" />
                             <p className="font-bold italic text-slate-500">Messaging module is being synced...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserPortal;
