import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, KeyRound, Loader2, Lock } from 'lucide-react';
import MeshBackground from '@petpals/theme/MeshBackground.jsx';
import ThemeToggle from '@petpals/theme/ThemeToggle.jsx';
import { PetPalsBrand } from '@petpals/theme/PetPalsLogo.jsx';
import { supabase } from '../supabaseClient';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setPhase('ready');
      }
    });

    const bootstrap = async () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const isRecovery =
        hash.includes('type=recovery') ||
        search.includes('type=recovery') ||
        hash.includes('access_token');

      if (isRecovery) {
        await supabase.auth.getSession();
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;

      if (session) {
        setPhase('ready');
        return;
      }

      if (isRecovery) {
        window.setTimeout(async () => {
          const { data: { session: retry } } = await supabase.auth.getSession();
          if (!active) return;
          setPhase(retry ? 'ready' : 'invalid');
        }, 800);
        return;
      }

      setPhase('invalid');
    };

    bootstrap();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPhase('done');
    window.setTimeout(() => navigate('/app', { replace: true }), 2400);
  };

  return (
    <div className="pp-public-shell relative flex min-h-[100dvh] flex-col text-[var(--pp-text-primary)]">
      <MeshBackground />

      <header className="relative z-20 mx-auto flex w-full max-w-6xl justify-end px-4 pt-4 md:px-6">
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="pp-card p-8 md:p-10">
          <PetPalsBrand logoSize="md" subtitle="Secure password reset" className="mb-6" />

          {phase === 'loading' && (
            <div className="flex flex-col items-center py-8 text-center">
              <Loader2 size={36} className="animate-spin text-[var(--pp-cerulean)]" />
              <p className="mt-4 text-sm font-semibold text-[var(--pp-text-secondary)]">
                Verifying your reset link…
              </p>
            </div>
          )}

          {phase === 'invalid' && (
            <div className="text-center">
              <h1 className="text-2xl font-black">Link expired or invalid</h1>
              <p className="mt-3 text-sm leading-relaxed text-[var(--pp-text-secondary)]">
                This reset link may have expired or already been used. Request a fresh link from the forgot-password page.
              </p>
              <Link to="/forgot-password" className="btn-primary mt-8 inline-flex w-full justify-center">
                Request new link
              </Link>
              <Link to="/app" className="btn-secondary mt-3 inline-flex w-full justify-center">
                Back to sign in
              </Link>
            </div>
          )}

          {phase === 'ready' && (
            <>
              <div className="mb-5 flex items-center gap-3">
                <div className="pp-liquid-glass pp-liquid-glass--pill pp-liquid-glass--resting flex h-11 w-11 items-center justify-center">
                  <KeyRound size={20} className="text-[var(--pp-blush)]" />
                </div>
                <div>
                  <h1 className="text-2xl font-black">Reset password</h1>
                  <p className="text-sm text-[var(--pp-text-muted)]">Choose a strong new password</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-[var(--pp-r-lg)] border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[var(--pp-text-muted)]">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pp-text-muted)]" size={18} />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full rounded-[var(--pp-r-lg)] border border-[var(--pp-card-border)] bg-[var(--pp-card-bg)] py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--pp-cerulean)]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[var(--pp-text-muted)]">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pp-text-muted)]" size={18} />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full rounded-[var(--pp-r-lg)] border border-[var(--pp-card-border)] bg-[var(--pp-card-bg)] py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--pp-cerulean)]/30"
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                  {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Update password'}
                </button>
              </form>
            </>
          )}

          {phase === 'done' && (
            <div className="text-center py-4">
              <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
              <h1 className="mt-4 text-2xl font-black">Password updated</h1>
              <p className="mt-2 text-sm text-[var(--pp-text-secondary)]">
                Redirecting you to sign in…
              </p>
              <Link to="/app" className="btn-primary mt-8 inline-flex w-full justify-center">
                Continue to PetPals
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
