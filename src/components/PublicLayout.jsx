import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Heart, Nfc, Code2 } from 'lucide-react';
import MeshBackground from '@petpals/theme/MeshBackground.jsx';
import ThemeToggle from '@petpals/theme/ThemeToggle.jsx';
import { SITE_REPO } from '../config/portals';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const isPetPage = pathname.startsWith('/pet');

  return (
    <div className="relative flex min-h-[100dvh] flex-col text-[var(--pp-text-primary)]">
      <MeshBackground />

      <header className="pp-header pp-header--float relative z-20 mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-6xl shrink-0 items-center px-6 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="pp-brand-gradient on-brand flex h-10 w-10 items-center justify-center rounded-full shadow-glow">
            <Heart size={20} fill="currentColor" className="keep-white" />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight">PetPals</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--pp-text-muted)]">
              NFC pet profiles
            </p>
          </div>
        </Link>

        <nav className="ml-auto flex items-center gap-2 md:gap-3">
          {!isPetPage && (
            <>
              <a
                href="#overview"
                className="pp-nav-idle hidden px-4 py-2 text-sm font-semibold sm:inline-block"
              >
                Overview
              </a>
              <a
                href="#portals"
                className="pp-nav-idle hidden px-4 py-2 text-sm font-semibold md:inline-block"
              >
                Partner apps
              </a>
            </>
          )}
          <ThemeToggle />
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-6 md:px-6">
        <Outlet />
      </main>

      <footer className="relative z-10 mx-auto mb-6 w-[calc(100%-2rem)] max-w-6xl">
        <div className="pp-card flex flex-col items-center justify-between gap-4 px-6 py-5 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-3">
            <Nfc size={20} className="text-[var(--pp-blush)]" />
            <p className="text-sm text-[var(--pp-text-secondary)]">
              Scan a PetPals NFC tag to open a pet&apos;s public profile.
            </p>
          </div>
          <a
            href={SITE_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="pp-nav-idle inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
          >
            <Code2 size={16} />
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
