import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Nfc, MapPin, ShoppingBag, Stethoscope, Sparkles,
  Shield, Users, PawPrint, ArrowRight, Radio
} from 'lucide-react';
import StatCounter from '../components/StatCounter';
import { fetchPlatformStats, COUNT_QUERIES } from '../lib/platformStats';

const STAT_META = {
  users: { icon: Users, color: 'from-violet-500 to-purple-600' },
  pets: { icon: PawPrint, color: 'from-brand-500 to-brand-700' },
  shops: { icon: ShoppingBag, color: 'from-tangerine-500 to-orange-600' },
  clinics: { icon: Stethoscope, color: 'from-emerald-500 to-teal-600' },
  shelters: { icon: Heart, color: 'from-rose-500 to-pink-600' },
};

const FEATURES = [
  {
    icon: Nfc,
    title: 'NFC pet identity',
    body: 'Each collar tag opens a beautiful public profile with pet details and owner contact — no app install required for finders.',
  },
  {
    icon: MapPin,
    title: 'Community tracking',
    body: 'Smart collars and the PetPals mesh network help reunite lost pets with crowdsourced location signals.',
  },
  {
    icon: Sparkles,
    title: 'Adoption & AI matching',
    body: 'Browse adoptable pets, apply in-app, and get compatibility insights powered by your lifestyle profile.',
  },
  {
    icon: Shield,
    title: 'Trusted care network',
    body: 'Connect with verified clinics, shelters, and shops for appointments, donations, and everyday pet care.',
  },
];

export default function LandingPage() {
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchPlatformStats()
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-20 pt-12 md:px-8 md:pb-28 md:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-200">
              <Radio size={14} className="animate-pulse" />
              Live community platform
            </div>

            <h1 className="text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
              Every pet deserves a{' '}
              <span className="bg-gradient-to-r from-brand-300 via-violet-300 to-tangerine-300 bg-clip-text text-transparent">
                digital identity
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-slate-300">
              PetPals connects loving owners, adoptable companions, vets, shelters, and shops in one ecosystem.
              Tap an NFC tag to see who belongs to a collar — instantly, on any phone.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#stats" className="btn-primary !rounded-2xl !px-8 shadow-brand-600/30">
                Explore the community
                <ArrowRight size={18} />
              </a>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Sign in to portal
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute inset-4 rounded-[2rem] bg-gradient-to-br from-brand-600/40 to-violet-600/30 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">NFC scan preview</span>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  Live profile
                </span>
              </div>
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                    <PawPrint size={40} />
                  </div>
                  <p className="text-2xl font-black">Luna</p>
                  <p className="text-sm text-slate-400">Golden Retriever · 3 yrs · Active</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {['Age', 'Status', 'Species'].map((l) => (
                  <div key={l} className="rounded-xl bg-white/5 px-3 py-2 text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-500">{l}</p>
                    <p className="text-sm font-black text-white">—</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Owner contact</p>
                <p className="mt-1 font-bold text-white">Available after NFC scan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section id="stats" className="scroll-mt-24 border-y border-white/10 bg-white/[0.02] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-300">Growing together</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">The PetPals community, in real time</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Registered members, pets, and partners across our platform — updated live from Supabase.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {COUNT_QUERIES.map(({ key, label }) => {
              const meta = STAT_META[key];
              const Icon = meta.icon;
              return (
                <div
                  key={key}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md transition hover:border-white/20 hover:bg-slate-900/80"
                >
                  <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${meta.color} p-3 shadow-lg`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <p className="text-4xl font-black text-white md:text-5xl">
                    {statsLoading ? (
                      <span className="inline-block h-10 w-16 animate-pulse rounded-lg bg-white/10" />
                    ) : (
                      <StatCounter value={stats[key]} />
                    )}
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-300">{label}</p>
                </div>
              );
            })}
          </div>

          {Object.values(stats).some((v) => v == null) && !statsLoading && (
            <p className="mt-6 text-center text-xs text-slate-500">
              Some counts are hidden by database permissions. Sign in as admin or enable public read policies to show all stats.
            </p>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-tangerine-400">How it works</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">From NFC tap to peace of mind</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Program your pet&apos;s tag in the PetPals iOS app with a link like{' '}
              <code className="rounded-lg bg-white/10 px-2 py-0.5 text-sm text-brand-200">
                petpals-kappa.vercel.app/pet?id=…
              </code>
              . Anyone who scans it sees this website — the same trusted profile view as in the app.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-8 transition hover:border-brand-500/30"
              >
                <div className="mb-5 inline-flex rounded-2xl bg-brand-500/15 p-3 text-brand-300">
                  <Icon size={26} />
                </div>
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{body}</p>
              </article>
            ))}
          </div>

          <ol className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              ['01', 'Register your pet', 'Add your companion in the PetPals app with photos and health details.'],
              ['02', 'Write the NFC tag', 'Copy your pet\'s URL from the app and program any NFC sticker or collar.'],
              ['03', 'Share safely', 'Finders see pet info and how to reach you — without exposing your full account.'],
            ].map(([step, title, body]) => (
              <li key={step} className="rounded-2xl border border-dashed border-white/15 p-6">
                <span className="text-3xl font-black text-brand-500/50">{step}</span>
                <h4 className="mt-2 font-black">{title}</h4>
                <p className="mt-2 text-sm text-slate-400">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-24 md:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-brand-500/20 bg-gradient-to-br from-brand-600/30 via-violet-600/20 to-slate-900 p-10 text-center md:p-16">
          <h2 className="text-3xl font-black md:text-4xl">Ready to protect your best friend?</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Download PetPals on iOS, set up your pet profile, and link your NFC collar in minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/app" className="btn-primary !rounded-2xl">
              Go to member portal
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
