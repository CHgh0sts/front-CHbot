'use client';

import { BarChart3, Crown, History, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { BOT_ROLE_LABELS_FR, isBotRoleKey } from '@/lib/role-keys';

export type ProfileParticipation = {
  id: string;
  endedAt: string;
  roleKey: string;
  won: boolean;
  guildId: string;
  xpAwarded: number;
  presetPublicCode: string | null;
};

export type XpProgressPayload = {
  level: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  xpUntilNextLevel: number;
  percentToNextLevel: number;
};

type Props = {
  displayName: string;
  initial: string;
  avatarUrl: string | null;
  email: string | null;
  level: number;
  xp: number;
  tier: string;
  discordId: string | null;
  siteRole: string;
  xpProgress: XpProgressPayload;
  participations: ProfileParticipation[];
};

function roleLabelFr(roleKey: string): string {
  return isBotRoleKey(roleKey) ? BOT_ROLE_LABELS_FR[roleKey] : roleKey;
}

/** Image carte : preset site si code présent, sinon défaut admin. */
function roleCardImageUrl(
  preset: string | null | undefined,
  roleKey: string
): string {
  const rk = encodeURIComponent(roleKey.trim().toUpperCase());
  if (preset && /^[A-Z2-9]{5}$/i.test(preset)) {
    return `/api/public/role-card/${encodeURIComponent(preset.toUpperCase())}/${rk}`;
  }
  return `/api/public/role-card-default/${rk}`;
}

function HistoryParticipationRow({ g }: { g: ProfileParticipation }) {
  const fallback = `/api/public/role-card-default/${encodeURIComponent(
    g.roleKey.trim().toUpperCase()
  )}`;
  const primary = roleCardImageUrl(g.presetPublicCode, g.roleKey);
  const [src, setSrc] = useState(primary);
  const label = roleLabelFr(g.roleKey);

  return (
    <li className="nb-card flex flex-wrap items-stretch gap-3 px-3 py-3 text-sm sm:px-4">
      <div className="relative size-[4.5rem] shrink-0 overflow-hidden border-[3px] border-[var(--nb-black)] bg-[var(--nb-black)] shadow-[3px_3px_0_0_var(--nb-black)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          className="size-full object-cover"
          onError={() => {
            setSrc((cur) => (cur !== fallback ? fallback : cur));
          }}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <time className="text-[var(--bw-text-muted)]" dateTime={g.endedAt}>
          {new Date(g.endedAt).toLocaleString('fr-FR')}
        </time>
        {g.presetPublicCode ? (
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--bw-text-muted)]">
            Preset{' '}
            <span className="font-mono text-[var(--bw-text)]">
              {g.presetPublicCode}
            </span>
          </p>
        ) : (
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--bw-text-faint)]">
            Sans preset site
          </p>
        )}
      </div>
      <div
        className={`flex shrink-0 flex-col items-end justify-center text-right ${
          g.won
            ? 'font-medium text-emerald-700 dark:text-emerald-400'
            : 'text-[var(--bw-text-faint)]'
        }`}
      >
        <span>{g.won ? 'Victoire' : 'Défaite'}</span>
        <span className="text-[var(--bw-text)]">+{g.xpAwarded} XP</span>
      </div>
    </li>
  );
}

export function ProfileView({
  displayName,
  initial,
  avatarUrl,
  email,
  level,
  xp,
  tier,
  discordId,
  siteRole,
  xpProgress,
  participations,
}: Props) {
  const [tab, setTab] = useState<'account' | 'history'>('account');

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL Discord dynamique
          <img
            src={avatarUrl}
            alt={`Avatar de ${displayName}`}
            width={112}
            height={112}
            className="size-28 shrink-0 rounded-full border-[3px] border-[var(--nb-black)] object-cover shadow-[4px_4px_0_0_var(--nb-black)]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="flex size-28 shrink-0 items-center justify-center rounded-full border-[3px] border-[var(--nb-black)] bg-[var(--nb-lilac)] text-3xl font-black text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)]"
            aria-hidden
          >
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-display mb-2 flex flex-wrap items-center gap-2 text-3xl font-bold text-[var(--nb-black)]">
            <UserRound className="size-8" strokeWidth={2.5} aria-hidden />
            Profil
          </h1>
          <p className="text-lg font-medium text-[var(--bw-text)]">{displayName}</p>
          <p className="mt-1 text-[var(--bw-text-muted)]">
            {email ?? 'Compte Discord'}
          </p>
        </div>
      </div>

      <div
        className="mb-8 flex flex-col gap-2 sm:flex-row"
        role="tablist"
        aria-label="Sections du profil"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'account'}
          id="profile-tab-account"
          aria-controls="profile-panel-account"
          onClick={() => setTab('account')}
          className={`inline-flex flex-1 items-center justify-center gap-2 border-[3px] border-[var(--nb-black)] px-4 py-3 text-xs font-extrabold uppercase tracking-wide transition sm:text-sm ${
            tab === 'account'
              ? 'bg-[var(--nb-yellow)] text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)]'
              : 'bg-[var(--nb-white)] text-[var(--nb-black)] shadow-[2px_2px_0_0_var(--nb-black)] hover:bg-[var(--nb-mint)]/40'
          }`}
        >
          <BarChart3 className="size-4 shrink-0 sm:size-5" strokeWidth={2.5} aria-hidden />
          Compte & progression
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'history'}
          id="profile-tab-history"
          aria-controls="profile-panel-history"
          onClick={() => setTab('history')}
          className={`inline-flex flex-1 items-center justify-center gap-2 border-[3px] border-[var(--nb-black)] px-4 py-3 text-xs font-extrabold uppercase tracking-wide transition sm:text-sm ${
            tab === 'history'
              ? 'bg-[var(--nb-yellow)] text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)]'
              : 'bg-[var(--nb-white)] text-[var(--nb-black)] shadow-[2px_2px_0_0_var(--nb-black)] hover:bg-[var(--nb-mint)]/40'
          }`}
        >
          <History className="size-4 shrink-0 sm:size-5" strokeWidth={2.5} aria-hidden />
          Historique des parties
        </button>
      </div>

      {tab === 'account' ? (
        <div
          id="profile-panel-account"
          role="tabpanel"
          aria-labelledby="profile-tab-account"
          className="space-y-8"
        >
          <section className="bw-card p-6">
            <h2 className="font-display mb-4 text-xl font-semibold text-[var(--bw-text)]">
              Progression
            </h2>
            <div className="mb-5">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2 text-sm">
                <span className="font-bold text-[var(--bw-text)]">
                  Niveau {level}
                  {xpProgress.xpUntilNextLevel > 0 ? (
                    <span className="ml-2 font-normal text-[var(--bw-text-muted)]">
                      — prochain niveau dans {xpProgress.xpUntilNextLevel} XP
                    </span>
                  ) : (
                    <span className="ml-2 font-normal text-[var(--bw-text-muted)]">
                      — niveau max atteint (segment)
                    </span>
                  )}
                </span>
                <span className="text-[var(--bw-text-muted)]">
                  {xpProgress.xpInCurrentLevel} / {xpProgress.xpNeededForNextLevel} XP
                  dans ce niveau
                </span>
              </div>
              <div
                className="h-4 w-full overflow-hidden border-[3px] border-[var(--nb-black)] bg-[var(--bw-muted-bg)] shadow-[3px_3px_0_0_var(--nb-black)]"
                role="progressbar"
                aria-valuenow={Math.round(xpProgress.percentToNextLevel)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progression vers le prochain niveau"
              >
                <div
                  className="h-full bg-[var(--nb-mint)] transition-[width] duration-300 ease-out"
                  style={{ width: `${xpProgress.percentToNextLevel}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--bw-text-muted)]">
                XP total : <strong className="text-[var(--bw-text)]">{xp}</strong>
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="flex items-center gap-1 text-[var(--bw-text-faint)]">
                  <Crown className="size-3.5" strokeWidth={2.5} aria-hidden />
                  Grade
                </dt>
                <dd className="font-bold text-[var(--nb-black)]">{tier}</dd>
              </div>
              <div>
                <dt className="text-[var(--bw-text-faint)]">Rôle site</dt>
                <dd className="font-medium text-[var(--bw-text)]">{siteRole}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[var(--bw-text-faint)]">Discord lié</dt>
                <dd className="font-mono text-xs text-[var(--bw-text-muted)]">
                  {discordId ? (
                    discordId
                  ) : (
                    <span className="text-amber-800 dark:text-amber-300">
                      Non lié —{' '}
                      <Link
                        href="/login"
                        className="font-medium text-[var(--bw-accent)] underline-offset-2 hover:underline"
                      >
                        connecte Discord
                      </Link>
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      ) : (
        <div
          id="profile-panel-history"
          role="tabpanel"
          aria-labelledby="profile-tab-history"
        >
          <section>
            <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold text-[var(--nb-black)]">
              <History className="size-6" strokeWidth={2.5} aria-hidden />
              Parties enregistrées
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-[var(--bw-text-muted)]">
              Carte du rôle : image du preset si la partie a été lancée avec un code
              site, sinon image par défaut. Les parties sans preset indiquent « Sans
              preset site ». Connexion Discord = historique et XP rattachés au compte.
            </p>
            {participations.length === 0 ? (
              <p className="text-[var(--bw-text-muted)]">
                Aucune partie encore synchronisée depuis le bot. Joue une partie
                jusqu’à la fin avec le site configuré côté bot.
              </p>
            ) : (
              <ul className="space-y-3">
                {participations.map((g) => (
                  <HistoryParticipationRow key={g.id} g={g} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
