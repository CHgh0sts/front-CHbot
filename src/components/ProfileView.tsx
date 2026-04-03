'use client';

import {
  BarChart3,
  Crown,
  Flame,
  Heart,
  History,
  Star,
  Swords,
  TrendingUp,
  UserRound,
} from 'lucide-react';
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

type ProfileStats = {
  totalGames: number;
  totalWins: number;
  winRate: number;
  favoriteRole: string | null;
  currentStreak: number;
  streakType: 'win' | 'loss';
  weekActivity: { day: string; count: number }[];
};

type Props = {
  displayName: string;
  initial: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  tier: string;
  discordId: string | null;
  siteRole: string;
  xpProgress: XpProgressPayload;
  participations: ProfileParticipation[];
  stats: ProfileStats;
};

function roleLabelFr(roleKey: string): string {
  return isBotRoleKey(roleKey) ? BOT_ROLE_LABELS_FR[roleKey] : roleKey;
}

function roleCardImageUrl(preset: string | null | undefined, roleKey: string): string {
  const rk = encodeURIComponent(roleKey.trim().toUpperCase());
  if (preset && /^[A-Z2-9]{5}$/i.test(preset)) {
    return `/api/public/role-card/${encodeURIComponent(preset.toUpperCase())}/${rk}`;
  }
  return `/api/public/role-card-default/${rk}`;
}

const PAGE_SIZE = 10;

function HistoryParticipationRow({ g }: { g: ProfileParticipation }) {
  const fallback = `/api/public/role-card-default/${encodeURIComponent(g.roleKey.trim().toUpperCase())}`;
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
          onError={() => setSrc((cur) => (cur !== fallback ? fallback : cur))}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <span className="text-xs font-bold text-[var(--nb-black)]">{label}</span>
        <time className="text-[var(--bw-text-muted)] text-[11px]" dateTime={g.endedAt}>
          {new Date(g.endedAt).toLocaleString('fr-FR')}
        </time>
        {g.presetPublicCode ? (
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--bw-text-muted)]">
            Preset{' '}
            <span className="font-mono text-[var(--bw-text)]">{g.presetPublicCode}</span>
          </p>
        ) : (
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--bw-text-faint)]">
            Sans preset
          </p>
        )}
      </div>
      <div
        className={`flex shrink-0 flex-col items-end justify-center text-right ${
          g.won ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'text-[var(--bw-text-faint)]'
        }`}
      >
        <span className="text-xs">{g.won ? 'Victoire' : 'Défaite'}</span>
        <span className="text-[var(--bw-text)] text-xs">+{g.xpAwarded} XP</span>
      </div>
    </li>
  );
}

function WeekChart({ data }: { data: { day: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full border-[2px] border-[var(--nb-black)] bg-[var(--nb-mint)] transition-all duration-300"
            style={{ height: `${Math.max((d.count / maxCount) * 64, 4)}px` }}
            title={`${d.count} partie${d.count !== 1 ? 's' : ''}`}
          />
          <span className="text-[9px] font-bold uppercase text-[var(--bw-text-muted)]">
            {d.day}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProfileView({
  displayName,
  initial,
  avatarUrl,
  level,
  xp,
  tier,
  discordId,
  siteRole,
  xpProgress,
  participations,
  stats,
}: Props) {
  const [tab, setTab] = useState<'account' | 'history'>('account');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={`Avatar de ${displayName}`}
            width={112}
            height={112}
            className="size-28 shrink-0 border-[3px] border-[var(--nb-black)] object-cover shadow-[4px_4px_0_0_var(--nb-black)]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="flex size-28 shrink-0 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-lilac)] text-3xl font-black text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)]"
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
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row" role="tablist" aria-label="Sections du profil">
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
          Historique ({stats.totalGames})
        </button>
      </div>

      {tab === 'account' ? (
        <div id="profile-panel-account" role="tabpanel" aria-labelledby="profile-tab-account" className="space-y-6">
          {/* XP Progression */}
          <section className="nb-card p-6">
            <h2 className="font-display mb-4 text-xl font-semibold text-[var(--bw-text)]">
              Progression
            </h2>
            <div className="mb-5">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2 text-sm">
                <span className="font-bold text-[var(--bw-text)]">
                  Niveau {level}
                  {xpProgress.xpUntilNextLevel > 0 ? (
                    <span className="ml-2 font-normal text-[var(--bw-text-muted)]">
                      — {xpProgress.xpUntilNextLevel} XP restants
                    </span>
                  ) : (
                    <span className="ml-2 font-normal text-[var(--bw-text-muted)]">
                      — segment max atteint
                    </span>
                  )}
                </span>
                <span className="text-[var(--bw-text-muted)] text-xs">
                  {xpProgress.xpInCurrentLevel} / {xpProgress.xpNeededForNextLevel} XP
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
          </section>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="nb-card p-4 text-center">
              <Swords className="mx-auto mb-2 size-5 text-[var(--nb-coral)]" strokeWidth={2.5} />
              <p className="font-display text-xl font-bold text-[var(--nb-black)]">{stats.totalGames}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--bw-text-muted)]">Parties</p>
            </div>
            <div className="nb-card p-4 text-center">
              <TrendingUp className="mx-auto mb-2 size-5 text-emerald-600" strokeWidth={2.5} />
              <p className="font-display text-xl font-bold text-[var(--nb-black)]">{stats.winRate}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--bw-text-muted)]">Win rate</p>
            </div>
            <div className="nb-card p-4 text-center">
              <Heart className="mx-auto mb-2 size-5 text-[var(--nb-lilac)]" strokeWidth={2.5} />
              <p className="font-display text-sm font-bold text-[var(--nb-black)] leading-tight">
                {stats.favoriteRole ? roleLabelFr(stats.favoriteRole) : '—'}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--bw-text-muted)]">Rôle favori</p>
            </div>
            <div className="nb-card p-4 text-center">
              <Flame className="mx-auto mb-2 size-5 text-orange-500" strokeWidth={2.5} />
              <p className="font-display text-xl font-bold text-[var(--nb-black)]">{stats.currentStreak}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--bw-text-muted)]">
                {stats.streakType === 'win' ? 'Victoires' : 'Défaites'} d&apos;affilée
              </p>
            </div>
          </div>

          {/* Week activity chart */}
          <section className="nb-card p-5">
            <h3 className="font-display mb-3 flex items-center gap-2 text-sm font-bold text-[var(--nb-black)]">
              <BarChart3 className="size-4" strokeWidth={2.5} />
              Activité (7 derniers jours)
            </h3>
            <WeekChart data={stats.weekActivity} />
          </section>

          {/* Account info */}
          <section className="nb-card p-6">
            <h2 className="font-display mb-4 text-lg font-semibold text-[var(--bw-text)]">
              Compte
            </h2>
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
              <div>
                <dt className="flex items-center gap-1 text-[var(--bw-text-faint)]">
                  <Star className="size-3.5" strokeWidth={2.5} aria-hidden />
                  Niveau
                </dt>
                <dd className="font-bold text-[var(--nb-black)]">{level}</dd>
              </div>
              <div>
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

          {/* Badges */}
          {(stats.totalGames >= 10 || stats.totalWins >= 5) && (
            <section className="nb-card p-5">
              <h3 className="font-display mb-3 text-sm font-bold text-[var(--nb-black)]">
                Jalons atteints
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.totalGames >= 10 && (
                  <span className="nb-badge bg-[var(--nb-yellow)]">10 parties</span>
                )}
                {stats.totalGames >= 50 && (
                  <span className="nb-badge bg-[var(--nb-mint)]">50 parties</span>
                )}
                {stats.totalGames >= 100 && (
                  <span className="nb-badge bg-[var(--nb-coral)] text-[#fffef8]">100 parties</span>
                )}
                {stats.totalWins >= 5 && (
                  <span className="nb-badge bg-[var(--nb-yellow)]">5 victoires</span>
                )}
                {stats.totalWins >= 25 && (
                  <span className="nb-badge bg-[var(--nb-mint)]">25 victoires</span>
                )}
                {stats.totalWins >= 50 && (
                  <span className="nb-badge bg-[var(--nb-coral)] text-[#fffef8]">50 victoires</span>
                )}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div id="profile-panel-history" role="tabpanel" aria-labelledby="profile-tab-history">
          <section>
            <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold text-[var(--nb-black)]">
              <History className="size-6" strokeWidth={2.5} aria-hidden />
              Parties enregistrées
            </h2>
            {participations.length === 0 ? (
              <div className="nb-card p-8 text-center">
                <Swords className="mx-auto mb-3 size-10 text-[var(--bw-text-faint)]" strokeWidth={2} />
                <p className="font-bold text-[var(--nb-black)]">Aucune partie encore</p>
                <p className="mt-1 text-sm text-[var(--bw-text-muted)]">
                  Joue une partie jusqu&apos;à la fin avec le bot configuré pour voir tes résultats ici.
                </p>
              </div>
            ) : (
              <>
                <ul className="space-y-3">
                  {participations.slice(0, visibleCount).map((g) => (
                    <HistoryParticipationRow key={g.id} g={g} />
                  ))}
                </ul>
                {visibleCount < participations.length && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                    className="nb-btn-ghost mt-4 w-full py-3 text-xs"
                  >
                    Charger plus ({participations.length - visibleCount} restantes)
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
