import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, Send } from 'lucide-react';
import MeshBackground from '@petpals/theme/MeshBackground.jsx';
import ThemeToggle from '@petpals/theme/ThemeToggle.jsx';
import { PetPalsBrand } from '@petpals/theme/PetPalsLogo.jsx';
import { supabase } from '../supabaseClient';
import { getResetPasswordUrl } from '../lib/authUrls';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const redirectTo = getResetPasswordUrl();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="pp-public-shell relative flex min-h-[100dvh] flex-col text-[var(--pp-text-primary)]">
      <MeshBackground />

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-4 md:px-6">
        <Link to="/" className="pp-nav-idle inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold">
          <ArrowLeft size={16} />
          Home
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="pp-card p-8 md:p-10">
          <PetPalsBrand logoSize="md" subtitle="Account recovery" className="mb-6" />

          {sent ? (
            <div className="text-center">
              <div className="pp-liquid-glass pp-liquid-glass--pill pp-liquid-glass--resting mx-auto mb-5 flex h-16 w-16 items-center justify-center">
                <Send size={28} className="text-[var(--pp-cerulean)]" />
              </div>
              <h1 className="text-2xl font-black">Check your inbox</h1>
              <p className="mt-3 text-sm leading-relaxed text-[var(--pp-text-secondary)]">
                If an account exists for <strong className="text-[var(--pp-text-primary)]">{email}</strong>, we sent a
                secure link to reset your password. The link opens on this site at our reset page.
              </p>
              <p className="mt-4 text-xs text-[var(--pp-text-muted)]">
                Did not receive it? Check spam or try again in a few minutes.
              </p>
              <Link to="/forgot-password" onClick={() => setSent(false)} className="btn-secondary mt-8 inline-flex w-full justify-center">
                Send again
              </Link>
              <Link to="/app" className="btn-primary mt-3 inline-flex w-full justify-center">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black">Forgot password?</h1>
              <p className="mt-2 text-sm leading-relaxed text-[var(--pp-text-secondary)]">
                Enter your email and we will send a one-time link to choose a new password.
              </p>

              {error && (
                <div className="mt-5 rounded-[var(--pp-r-lg)] border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[var(--pp-text-muted)]">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pp-text-muted)]" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-[var(--pp-r-lg)] border border-[var(--pp-card-border)] bg-[var(--pp-card-bg)] py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--pp-cerulean)]/30"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Send reset link'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--pp-text-muted)]">
                Remember your password?{' '}
                <Link to="/app" className="font-bold text-[var(--pp-cerulean)] hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
