'use client';

import { KeyRound, Loader2, Lock, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/profile';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);

  const busy = loading || discordLoading;

  async function onDiscord() {
    setError(null);
    setDiscordLoading(true);
    try {
      await signIn('discord', { callbackUrl });
    } catch {
      setError('Impossible de lancer la connexion Discord.');
      setDiscordLoading(false);
    }
  }

  async function onCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError('Email ou mot de passe incorrect.');
        setLoading(false);
        return;
      }
      window.location.href = callbackUrl;
    } catch {
      setError('Erreur réseau.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <button
        type="button"
        disabled={busy}
        className="nb-btn-discord w-full py-4 text-sm disabled:cursor-wait disabled:opacity-80"
        onClick={() => void onDiscord()}
      >
        {discordLoading ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Discord…
          </>
        ) : (
          <>
            <svg
              className="size-5 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Continuer avec Discord
          </>
        )}
      </button>

      <div className="relative text-center">
        <span className="relative z-[1] inline-block border-[3px] border-[var(--nb-black)] bg-[var(--nb-cream)] px-4 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--nb-black)] shadow-[3px_3px_0_0_var(--nb-black)]">
          ou email
        </span>
        <div
          className="absolute left-0 right-0 top-1/2 -z-0 h-[3px] -translate-y-1/2 bg-[var(--nb-black)]"
          aria-hidden
        />
      </div>

      <form onSubmit={onCredentials} className="space-y-5">
        {error ? (
          <p className="border-[3px] border-[var(--nb-black)] bg-[#ffb4a8] px-4 py-3 text-sm font-bold text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)]">
            {error}
          </p>
        ) : null}
        <div>
          <label
            htmlFor="email"
            className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--nb-black)]"
          >
            <Mail className="size-4" strokeWidth={2.5} aria-hidden />
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            disabled={busy}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="nb-input disabled:opacity-55"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--nb-black)]"
          >
            <Lock className="size-4" strokeWidth={2.5} aria-hidden />
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="nb-input disabled:opacity-55"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="nb-btn-primary w-full py-4 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Connexion…
            </>
          ) : (
            <>
              <KeyRound className="size-5" strokeWidth={2.5} aria-hidden />
              Se connecter
            </>
          )}
        </button>
      </form>
    </div>
  );
}
