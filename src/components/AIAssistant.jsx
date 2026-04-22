import React from 'react';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';

const AIAssistant = () => (
    <div className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="relative mb-10">
            <div className="w-28 h-28 bg-gradient-to-br from-violet-500 via-brand-600 to-tangerine-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand-600/30 animate-pulse">
                <Sparkles size={52} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-tangerine-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap size={16} className="text-white" fill="currentColor" />
            </div>
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-3">PetPals AI</h1>
        <p className="text-slate-500 font-medium text-lg italic mb-2">Your personal pet health assistant</p>

        <div className="mt-8 w-full max-w-md space-y-3">
            {[
                'Ask about your pet\'s symptoms',
                'Get personalised feeding plans',
                'Decode vet medical reports',
                'Match the perfect breed for your home',
            ].map(item => (
                <div key={item} className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-soft text-left opacity-50">
                    <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                        <Sparkles size={16} className="text-violet-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{item}</span>
                </div>
            ))}
        </div>

        <div className="mt-10 px-8 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-sm flex items-center gap-2 border border-slate-200">
            <span>🚀</span> Coming Soon — Stay tuned!
        </div>
    </div>
);

export default AIAssistant;
