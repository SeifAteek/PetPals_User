import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Heart, Smartphone, Nfc } from 'lucide-react';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const isPetPage = pathname.startsWith('/pet');

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-brand-600/25 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-tangerine-500/20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-600/15 blur-[90px]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-600/40 transition-transform group-hover:scale-105">
              <Heart size={22} fill="currentColor" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">PetPals</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Smart pet identity
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 md:gap-4">
            {!isPetPage && (
              <a href="#how-it-works" className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white sm:inline-block">
                How it works
              </a>
            )}
            <a
              href="#stats"
              className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white md:inline-block"
            >
              Community
            </a>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15"
            >
              <Smartphone size={16} />
              <span className="hidden sm:inline">Open app portal</span>
              <span className="sm:hidden">Portal</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 text-center md:flex-row md:px-8 md:text-left">
          <div className="flex items-center gap-3">
            <Nfc size={20} className="text-brand-400" />
            <p className="text-sm text-slate-400">
              Scan a PetPals NFC tag to view a pet&apos;s profile instantly.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            © {new Date().getFullYear()} PetPals · petpals-kappa.vercel.app
          </p>
        </div>
      </footer>
    </div>
  );
}
