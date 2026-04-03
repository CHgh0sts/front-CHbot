import {
  ArrowRight,
  BookOpen,
  Gamepad2,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { resolveDiscordAvatarUrl } from '@/lib/discord-avatar';
import { xpLevelProgress } from '@/lib/xp';

export const dynamic = 'force-dynamic';

async function globalStats() {
  const [userCount, gameCount] = await Promise.all([
    prisma.user.count(),
    prisma.gameParticipation.count(),
  ]);
  return { userCount, gameCount };
}

export default async function Home() {
  const session = await auth();
  const stats = await globalStats();

  const isLoggedIn = !!session?.user?.id;

  let userData: {
    displayName: string;
    avatarUrl: string | null;
    level: number;
    xp: number;
    xpProgress: { percentToNextLevel: number; xpUntilNextLevel: number };
    totalGames: number;
    recentGames: { id: string; roleKey: string; won: boolean; endedAt: Date; xpAwarded: number }[];
    presets: { publicCode: string; name: string | null }[];
  } | null = null;

  if (isLoggedIn) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        image: true,
        discordId: true,
        xp: true,
        level: true,
        _count: { select: { gameParticipations: true } },
      },
    });
    if (user) {
      const recentGames = await prisma.gameParticipation.findMany({
        where: { userId: session.user.id },
        orderBy: { endedAt: 'desc' },
        take: 3,
        select: { id: true, roleKey: true, won: true, endedAt: true, xpAwarded: true },
      });
      const presets = await prisma.partyConfigPreset.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { publicCode: true, name: true },
      });
      const xpProgress = xpLevelProgress(user.xp);
      userData = {
        displayName: user.name || 'Joueur',
        avatarUrl: resolveDiscordAvatarUrl({ image: user.image, discordId: user.discordId }),
        level: user.level,
        xp: user.xp,
        xpProgress,
        totalGames: user._count.gameParticipations,
        recentGames,
        presets,
      };
    }
  }

  return (
    <main className="relative mx-auto max-w-5xl px-4 py-12 sm:py-20">
      {/* Decorative shapes */}
      <div
        className="pointer-events-none absolute -right-4 top-8 hidden h-24 w-24 rotate-12 border-[3px] border-[var(--nb-black)] bg-[var(--nb-mint)] shadow-[6px_6px_0_0_var(--nb-black)] sm:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-2 bottom-24 hidden h-16 w-16 -rotate-6 border-[3px] border-[var(--nb-black)] bg-[var(--nb-lilac)] shadow-[5px_5px_0_0_var(--nb-black)] lg:block"
        aria-hidden
      />

      {isLoggedIn && userData ? (
        /* ── CONNECTED STATE ── */
        <>
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            {userData.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userData.avatarUrl}
                alt=""
                className="size-20 shrink-0 border-[3px] border-[var(--nb-black)] object-cover shadow-[4px_4px_0_0_var(--nb-black)]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex size-20 shrink-0 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-lilac)] text-2xl font-black text-[var(--nb-black)] shadow-[4px_4px_0_0_var(--nb-black)]">
                {userData.displayName[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="nb-hero-title font-display mb-2 text-[var(--nb-black)]">
                Bon retour,{' '}
                <span className="relative inline-block bg-[var(--nb-yellow)] px-1 decoration-clone box-decoration-clone">
                  {userData.displayName}
                </span>
              </h1>
              <p className="text-sm font-bold text-[var(--bw-text-muted)]">
                Niveau {userData.level} &middot; {userData.xp} XP &middot; {userData.totalGames} partie{userData.totalGames !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Mini XP bar */}
          <div className="mb-10 nb-card p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--bw-text-muted)]">
              <span>Niveau {userData.level}</span>
              <span>
                {userData.xpProgress.xpUntilNextLevel > 0
                  ? `${userData.xpProgress.xpUntilNextLevel} XP restants`
                  : 'Segment max atteint'}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden border-[3px] border-[var(--nb-black)] bg-[var(--bw-muted-bg)] shadow-[2px_2px_0_0_var(--nb-black)]">
              <div
                className="h-full bg-[var(--nb-mint)] transition-[width] duration-300"
                style={{ width: `${userData.xpProgress.percentToNextLevel}%` }}
              />
            </div>
          </div>

          {/* Quick shortcuts */}
          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            <Link
              href="/profile"
              className="nb-card group flex items-center gap-3 p-4 transition-transform hover:-rotate-1"
            >
              <div className="inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-yellow)] p-2 shadow-[3px_3px_0_0_var(--nb-black)]">
                <Users className="size-5 text-[var(--nb-black)]" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--nb-black)]">Mon profil</p>
                <p className="text-[11px] text-[var(--bw-text-muted)]">Stats & historique</p>
              </div>
            </Link>
            <Link
              href="/configs"
              className="nb-card group flex items-center gap-3 p-4 transition-transform hover:rotate-1"
            >
              <div className="inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-mint)] p-2 shadow-[3px_3px_0_0_var(--nb-black)]">
                <SlidersHorizontal className="size-5 text-[var(--nb-black)]" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--nb-black)]">Mes presets</p>
                <p className="text-[11px] text-[var(--bw-text-muted)]">{userData.presets.length} preset{userData.presets.length !== 1 ? 's' : ''}</p>
              </div>
            </Link>
            <Link
              href="/leaderboard"
              className="nb-card group flex items-center gap-3 p-4 transition-transform hover:-rotate-1"
            >
              <div className="inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-lilac)] p-2 shadow-[3px_3px_0_0_var(--nb-black)]">
                <Trophy className="size-5 text-[var(--nb-black)]" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--nb-black)]">Classement</p>
                <p className="text-[11px] text-[var(--bw-text-muted)]">Top joueurs</p>
              </div>
            </Link>
          </div>

          {/* Recent games */}
          {userData.recentGames.length > 0 && (
            <section className="mb-10">
              <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-bold text-[var(--nb-black)]">
                <Zap className="size-5" strokeWidth={2.5} />
                Dernières parties
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {userData.recentGames.map((g) => (
                  <div key={g.id} className="nb-card p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--nb-black)]">{g.roleKey}</span>
                      <span className={g.won ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-[var(--bw-text-faint)]'}>
                        {g.won ? 'W' : 'L'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[var(--bw-text-muted)]">
                      +{g.xpAwarded} XP &middot; {new Date(g.endedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href="/profile"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--bw-accent)] hover:underline"
              >
                Voir tout l&apos;historique
                <ArrowRight className="size-3" strokeWidth={2.5} />
              </Link>
            </section>
          )}
        </>
      ) : (
        /* ── GUEST STATE ── */
        <>
          <div className="relative mb-10 inline-flex flex-wrap items-center gap-2">
            <span className="nb-badge">Discord</span>
            <span className="nb-badge bg-[var(--nb-mint)]">Loup-Garou</span>
            <span className="nb-badge bg-[var(--nb-coral)] text-[#fffef8]">
              XP & grades
            </span>
          </div>

          <h1 className="nb-hero-title font-display mb-6 max-w-4xl text-[var(--nb-black)]">
            Le hub qui lie ton{' '}
            <span className="relative inline-block bg-[var(--nb-yellow)] px-1 decoration-clone box-decoration-clone">
              serveur
            </span>{' '}
            à ton compte joueur.
          </h1>

          <p className="mb-12 max-w-2xl text-lg font-medium leading-relaxed text-[var(--nb-black)] opacity-90">
            Presets de partie, images de cartes, progression et admin — tout avec un
            style qui assume. Crée ton compte, colle ton code{' '}
            <code className="border-[2px] border-[var(--nb-black)] bg-[var(--nb-white)] px-1.5 py-0.5 font-mono text-sm font-bold shadow-[2px_2px_0_0_var(--nb-black)]">
              /lg-init
            </code>{' '}
            sur Discord, c&apos;est parti.
          </p>

          <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/login" className="nb-btn-primary min-h-[3rem] px-8 py-4 text-sm">
              <Sparkles className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
              <span className="whitespace-nowrap">Connexion</span>
              <ArrowRight className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
            </Link>
            <Link href="/register" className="nb-btn-coral min-h-[3rem] px-8 py-4 text-sm">
              <Users className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
              <span className="whitespace-nowrap">Créer un compte</span>
            </Link>
          </div>

          {/* How it works */}
          <section className="mb-16">
            <h2 className="font-display mb-6 text-xl font-bold text-[var(--nb-black)]">
              Comment ça marche ?
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { step: '1', title: 'Crée ton compte', desc: 'Inscription rapide via Discord ou email.', color: 'bg-[var(--nb-yellow)]' },
                { step: '2', title: 'Lance /lg-init', desc: 'Sur ton serveur Discord, le bot prend le relais.', color: 'bg-[var(--nb-mint)]' },
                { step: '3', title: 'Gagne de l\'XP', desc: 'Chaque partie terminée te rapporte de l\'expérience.', color: 'bg-[var(--nb-lilac)]' },
              ].map((s) => (
                <div key={s.step} className="nb-card p-5">
                  <div className={`mb-3 inline-flex size-10 items-center justify-center border-[3px] border-[var(--nb-black)] ${s.color} font-display text-lg font-bold shadow-[3px_3px_0_0_var(--nb-black)]`}>
                    {s.step}
                  </div>
                  <h3 className="font-display mb-1 text-base font-bold text-[var(--nb-black)]">{s.title}</h3>
                  <p className="text-sm font-medium leading-snug opacity-85">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Feature cards (always shown) */}
      <div className="grid gap-5 md:grid-cols-3">
        <article className="nb-card group p-5 transition-transform hover:-rotate-1">
          <div className="mb-4 inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-yellow)] p-3 shadow-[3px_3px_0_0_var(--nb-black)]">
            <SlidersHorizontal className="size-7 text-[var(--nb-black)]" strokeWidth={2.5} />
          </div>
          <h2 className="font-display mb-2 text-xl text-[var(--nb-black)]">Presets</h2>
          <p className="text-sm font-medium leading-snug opacity-85">
            Composition sauvegardée, code à 5 caractères, import direct dans le bot.
          </p>
        </article>
        <article className="nb-card group p-5 transition-transform hover:rotate-1">
          <div className="mb-4 inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-mint)] p-3 shadow-[3px_3px_0_0_var(--nb-black)]">
            <Trophy className="size-7 text-[var(--nb-black)]" strokeWidth={2.5} />
          </div>
          <h2 className="font-display mb-2 text-xl text-[var(--nb-black)]">XP</h2>
          <p className="text-sm font-medium leading-snug opacity-85">
            Historique des parties, niveaux et récompenses quand le bot est relié au site.
          </p>
        </article>
        <article className="nb-card group p-5 md:col-span-1">
          <div className="mb-4 inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-lilac)] p-3 shadow-[3px_3px_0_0_var(--nb-black)]">
            <Gamepad2 className="size-7 text-[var(--nb-black)]" strokeWidth={2.5} />
          </div>
          <h2 className="font-display mb-2 text-xl text-[var(--nb-black)]">Premium</h2>
          <p className="text-sm font-medium leading-snug opacity-85">
            Images de cartes par rôle, options avancées — gérées depuis l&apos;admin et ton grade.
          </p>
        </article>
      </div>

      {/* Global stats banner */}
      <div className="mt-10 flex flex-col items-center gap-4 border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] px-6 py-5 shadow-[4px_4px_0_0_var(--nb-black)] sm:flex-row sm:justify-center sm:gap-10">
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-[var(--nb-black)]">{stats.userCount}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--bw-text-muted)]">Joueurs</p>
        </div>
        <div className="hidden h-10 w-[3px] bg-[var(--nb-black)] sm:block" aria-hidden />
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-[var(--nb-black)]">{stats.gameCount}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--bw-text-muted)]">Parties jouées</p>
        </div>
      </div>
    </main>
  );
}
