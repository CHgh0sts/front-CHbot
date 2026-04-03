'use client';

import { Loader2, Lock, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? 'Erreur');
        setLoading(false);
        return;
      }
      router.push('/login?registered=1');
      router.refresh();
    } catch {
      setError('Erreur réseau.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <p className="border-[3px] border-[var(--nb-black)] bg-[#ffb4a8] px-4 py-3 text-sm font-bold text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)]">
          {error}
        </p>
      ) : null}
      <div>
        <label
          htmlFor="name"
          className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--nb-black)]"
        >
          <UserRound className="size-4" strokeWidth={2.5} aria-hidden />
          Pseudo (optionnel)
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="nb-input"
        />
      </div>
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
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="nb-input"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--nb-black)]"
        >
          <Lock className="size-4" strokeWidth={2.5} aria-hidden />
          Mot de passe (min. 8)
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="nb-input"
        />
      </div>
      <button type="submit" disabled={loading} className="nb-btn-coral w-full py-4 text-sm">
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Création…
          </>
        ) : (
          <>
            <UserRound className="size-5" strokeWidth={2.5} aria-hidden />
            Créer le compte
          </>
        )}
      </button>
    </form>
  );
}
