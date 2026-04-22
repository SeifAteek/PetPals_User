import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Heart, Mail, Lock, Globe, Loader2, ArrowRight } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [onboarding, setOnboarding] = useState(false);
    
    // Onboarding state
    const [housing, setHousing] = useState('Apartment');
    const [otherPets, setOtherPets] = useState(false);
    const [userId, setUserId] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { data, error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: { data: { user_type: 'Adopter' } }
                });
                if (error) throw error;
                
                if (data?.user) {
                    setUserId(data.user.id);
                    // Standard insert for profiles (User App Requirement)
                    await supabase.from('profiles').insert([{
                        user_id: data.user.id,
                        user_name: email.split('@')[0],
                        email: email,
                        user_type: 'Adopter'
                    }]);
                    
                    // Show onboarding instead of immediate dashboard
                    setOnboarding(true);
                }
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // Determine the correct redirect URL
            // Default to current origin (works for both localhost and production)
            let redirectURL = window.location.origin;
            
            // Explicitly force the production domain if we're not on localhost
            // This handles cases where window.location.origin might be unexpected
            if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
                redirectURL = 'https://petpals-kappa.vercel.app';
            }
            
            // Use environment variable if provided
            const siteUrl = import.meta.env.VITE_SITE_URL || redirectURL;
            
            // Ensure the URL ends with a trailing slash as Supabase often requires exact matches
            const finalRedirect = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;

            const { error } = await supabase.auth.signInWithOAuth({ 
                provider: 'google',
                options: {
                    redirectTo: finalRedirect,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                }
            });
            if (error) throw error;
        } catch (error) {
            alert(error.message);
        }
    };

    const completeOnboarding = async () => {
        setLoading(true);
        try {
            // Insert blank/custom record into adopter_profiles (Logic requirement)
            const { error } = await supabase.from('adopter_profiles').insert([{
                user_id: userId,
                housing_type: housing,
                has_other_pets: otherPets
            }]);
            if (error) throw error;
            
            // This will trigger a re-render in App.jsx via onAuthStateChange
            window.location.reload();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (onboarding) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 bg-mesh-light text-center">
                <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl">
                    <Heart size={40} fill="currentColor" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome to PetPals!</h1>
                <p className="text-slate-500 font-medium mb-10 italic">Tell us about your home to speed up adoptions.</p>
                
                <div className="w-full max-w-sm space-y-8 text-left">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Housing Type</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Apartment', 'House', 'Farm'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setHousing(type)}
                                    className={`py-3 rounded-2xl font-bold transition-all text-sm ${housing === type ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <p className="font-bold text-slate-800 text-sm">Have other pets?</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Helps us match behavior</p>
                        </div>
                        <button 
                            onClick={() => setOtherPets(!otherPets)}
                            className={`w-14 h-8 rounded-full relative transition-colors ${otherPets ? 'bg-brand-600' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${otherPets ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <button 
                        onClick={completeOnboarding}
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : <>Let's Go! <ArrowRight size={20} /></>}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
            {/* Left Decor (Desktop) */}
            <div className="hidden md:flex flex-1 bg-brand-600 p-20 flex-col justify-between text-white relative">
                <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none"></div>
                <div className="z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-white text-brand-600 rounded-xl flex items-center justify-center shadow-lg font-black text-xl italic">P</div>
                        <span className="text-2xl font-black tracking-tight">PetPals</span>
                    </div>
                    <h1 className="text-6xl font-black leading-[1.1] max-w-lg mb-6">
                        Bringing joy <br /> 
                        <span className="text-brand-300 italic">one paw</span> <br /> 
                        at a time.
                    </h1>
                </div>
                <div className="z-10 text-brand-200 font-medium">
                    © 2026 PetPals Technology Group
                </div>
            </div>

            {/* Right Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
                <div className="md:hidden absolute top-10 left-10 flex items-center gap-2 mb-10">
                    <div className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center shadow-lg font-black text-sm italic">P</div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">PetPals</span>
                </div>

                <div className="w-full max-w-sm">
                    <h2 className="text-3xl font-black text-slate-900 mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-500 font-medium mb-10 italic">
                        {isLogin ? "Your pets have missed you!" : "Join our community of animal lovers."}
                    </p>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" disabled={loading}
                            className="w-full py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={24} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="relative my-10">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-200"></div>
                        <span className="relative z-10 mx-auto block w-fit px-4 bg-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest">Or continue with</span>
                    </div>

                    <button 
                        onClick={handleGoogleLogin}
                        className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Globe size={20} className="text-brand-600" />
                        <span>Google</span>
                    </button>

                    <p className="text-center mt-10 text-sm font-bold text-slate-400">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-brand-600 hover:underline transition-all"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
