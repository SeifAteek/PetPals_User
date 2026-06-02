import React, { useEffect, useState } from 'react';
import {
  Heart, Nfc, Sparkles, Shield, Users, PawPrint, ArrowRight, Radio,
  Stethoscope, ShoppingBag, ExternalLink, Code2, Smartphone,
} from 'lucide-react';
import StatCounter from '../components/StatCounter';
import { fetchPlatformStats, COUNT_QUERIES } from '../lib/platformStats';
import { PARTNER_PORTALS, SITE_REPO } from '../config/portals';

const STAT_META = {
  users: { icon: Users, tone: 'text-cerulean' },
  pets: { icon: PawPrint, tone: 'text-[var(--pp-blush)]' },
  shops: { icon: ShoppingBag, tone: 'text-cerulean' },
  clinics: { icon: Stethoscope, tone: 'text-[var(--pp-cerulean)]' },
  shelters: { icon: Heart, tone: 'text-[var(--pp-blush)]' },
};

const PORTAL_ICONS = {
  clinic: Stethoscope,
  shelter: Heart,
  store: ShoppingBag,
  ios: Smartphone,
};

const HIGHLIGHTS = [
  {
    icon: Nfc,
    title: 'NFC pet identity',
    body: 'Program a collar tag in the iOS app. Anyone who taps it sees this site — no install required.',
  },
  {
    icon: Sparkles,
    title: 'One connected ecosystem',
    body: 'Adopters use the mobile app. Clinics, shelters, and shops run dedicated web portals on the same Supabase backend.',
  },
  {
    icon: Shield,
    title: 'Safe public profiles',
    body: 'Finders see pet details and owner contact you choose to share — not your full account.',
  },
];

export default function LandingPage() {
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const nfcExample = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}/pet?id=YOUR_PET_ID`.replace(/\/+/g, '/').replace(':/', '://');

  useEffect(() => {
    fetchPlatformStats()
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero + NFC preview */}
      <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-6">
          <span className="pp-glass-chip inline-flex">
            <Radio size={12} className="animate-pulse" />
            PetPals platform
          </span>

          <h1 className="text-4xl font-black leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            Tap a tag.{' '}
            <span className="bg-gradient-to-r from-[var(--pp-blush)] via-cerulean to-[var(--pp-navy)] bg-clip-text text-transparent">
              Meet the pet.
            </span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-[var(--pp-text-secondary)]">
            PetPals is a graduation project connecting pet parents, adopters, clinics, shelters, and shops.
            This site is the public face of every NFC scan — a lightweight profile finders can trust.
          </p>

          <div className="flex flex-wrap gap-3">
            <a href="#portals" className="btn-primary">
              Partner portals
              <ArrowRight size={18} />
            </a>
            <a href="#overview" className="btn-secondary">
              How NFC works
            </a>
          </div>
        </div>

        <div className="pp-card p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--pp-text-muted)]">
              NFC scan preview
            </span>
            <span className="pp-glass-chip">Live profile</span>
          </div>
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-[var(--pp-r-2xl)] bg-[var(--pp-card-bg)] p-8 text-center">
            <div className="pp-liquid-glass pp-liquid-glass--pill pp-liquid-glass--resting flex h-20 w-20 items-center justify-center">
              <PawPrint size={36} className="text-[var(--pp-blush)]" />
            </div>
            <p className="text-2xl font-black">Luna</p>
            <p className="text-sm text-[var(--pp-text-muted)]">Golden Retriever · 3 yrs · Active</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {['Age', 'Species', 'Status'].map((label) => (
              <div key={label} className="pp-auto-glass rounded-[var(--pp-r-lg)] px-3 py-2 text-center">
                <p className="text-[10px] font-bold uppercase text-[var(--pp-text-muted)]">{label}</p>
                <p className="text-sm font-black">—</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-[var(--pp-text-muted)]">
            Real pets load from Supabase when you scan a programmed tag.
          </p>
        </div>
      </section>

      {/* Project overview */}
      <section id="overview" className="scroll-mt-28">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--pp-blush)]">Overview</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">What PetPals is</h2>
          <p className="mt-4 leading-relaxed text-[var(--pp-text-secondary)]">
            A full-stack pet-care platform: iOS app for adopters, web portals for business partners, and this
            public site for NFC collar profiles. Everything shares one Supabase database (pets, appointments,
            adoptions, shops, and more).
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
            <article key={title} className="pp-card p-6 md:p-8">
              <div className="pp-liquid-glass pp-liquid-glass--md pp-liquid-glass--resting mb-4 inline-flex p-3 text-[var(--pp-blush)]">
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--pp-text-secondary)]">{body}</p>
            </article>
          ))}
        </div>

        <div className="pp-card mt-8 p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--pp-text-muted)]">NFC URL format</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--pp-text-secondary)]">
            In the PetPals iOS app, copy your pet&apos;s link and write it to any NFC sticker or collar chip:
          </p>
          <code className="mt-4 block break-all rounded-[var(--pp-r-lg)] border border-[var(--pp-card-border)] bg-[var(--pp-input-bg)] px-4 py-3 text-sm font-semibold text-[var(--pp-cerulean)]">
            {nfcExample}
          </code>
          <ol className="mt-6 grid gap-3 text-sm text-[var(--pp-text-secondary)] md:grid-cols-3">
            {[
              'Register your pet in the iOS app with photos and details.',
              'Copy the public URL and program your NFC tag.',
              'Finders tap the tag and see this profile instantly.',
            ].map((step, i) => (
              <li key={step} className="pp-auto-glass rounded-[var(--pp-r-xl)] border border-dashed p-4">
                <span className="text-2xl font-black text-[var(--pp-blush)]">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-2">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Live stats */}
      <section id="stats" className="scroll-mt-28">
        <div className="mb-10 text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--pp-blush)]">Community</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Platform at a glance</h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--pp-text-secondary)]">
            Live counts from Supabase when public read policies allow.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {COUNT_QUERIES.map(({ key, label }) => {
            const meta = STAT_META[key];
            const Icon = meta.icon;
            return (
              <div key={key} className="pp-card p-6 text-center">
                <Icon size={22} className={`mx-auto mb-3 ${meta.tone}`} />
                <p className="text-4xl font-black md:text-5xl">
                  {statsLoading ? (
                    <span className="inline-block h-10 w-16 animate-pulse rounded-[var(--pp-r-md)] bg-[var(--pp-card-bg)]" />
                  ) : (
                    <StatCounter value={stats[key]} />
                  )}
                </p>
                <p className="mt-2 text-sm font-bold text-[var(--pp-text-secondary)]">{label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Partner portals */}
      <section id="portals" className="scroll-mt-28">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--pp-blush)]">Partner apps</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Try the web portals</h2>
          <p className="mt-4 text-[var(--pp-text-secondary)]">
            Each partner app is deployed on GitHub Pages — same liquid-glass UI and shared PetPals theme as the
            mobile app palette.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {PARTNER_PORTALS.map((portal) => {
            const Icon = PORTAL_ICONS[portal.id] || ExternalLink;
            return (
              <article key={portal.id} className="pp-card flex flex-col p-6 md:p-8">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="pp-brand-gradient on-brand flex h-11 w-11 items-center justify-center rounded-full">
                    <Icon size={20} className="keep-white" />
                  </div>
                  <a
                    href={portal.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pp-nav-idle inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold"
                    title="View source"
                  >
                    <Code2 size={14} />
                    Repo
                  </a>
                </div>
                <h3 className="text-xl font-black">{portal.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--pp-text-secondary)]">
                  {portal.description}
                </p>
                <a
                  href={portal.pagesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-6 w-full sm:w-auto"
                >
                  {portal.external ? 'View on GitHub' : 'Open live demo'}
                  <ExternalLink size={16} />
                </a>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="pp-card overflow-hidden p-8 text-center md:p-12">
        <h2 className="text-2xl font-black md:text-3xl">Built for real pet care workflows</h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--pp-text-secondary)]">
          Graduation project by Seif Ateek — NFC identity, adoption matching, clinic &amp; shelter operations,
          and pet retail in one ecosystem.
        </p>
        <a
          href={SITE_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary mt-8 inline-flex"
        >
          <Code2 size={18} />
          PetPals_User on GitHub
        </a>
      </section>
    </div>
  );
}
