import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const show = useCallback(({ type = 'info', message, duration = 4000 }) => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }, []);

    const dismiss = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

    const ICON = {
        success: <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />,
        error:   <AlertCircle  size={18} className="text-red-500 shrink-0 mt-0.5" />,
        info:    <Info         size={18} className="text-brand-500 shrink-0 mt-0.5" />,
    };

    return (
        <ToastContext.Provider value={show}>
            {children}
            <div className="fixed top-5 right-5 z-[300] flex flex-col gap-3 w-80 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto flex items-start gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-2xl shadow-slate-900/10">
                        {ICON[t.type] || ICON.info}
                        <p className="flex-1 text-sm font-semibold text-slate-800 leading-snug">{t.message}</p>
                        <button onClick={() => dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors shrink-0">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
