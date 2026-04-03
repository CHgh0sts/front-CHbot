import { Crown, Medal, Swords, Trophy } from 'lucide-react';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { resolveDiscordAvatarUrl } from '@/lib/discord-avatar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Classement — Botwolf',
  description: 'Top 50 des joueurs Loup-Garou classés par XP',
};

type LeaderboardRow = {
  rank: number;
  name: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  totalGames: number;
  winRate: number;
};

async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const users = await prisma.user.findMany({
    where: { xp: { gt: 0 } },
    orderBy: { xp: 'desc' },
    take: 50,
    select: {
      id: true,
      name: true,
      image: true,
      discordId: true,
      xp: true,
      level: true,
      _count: { select: { gameParticipations: true } },
    },
  });

  const userIds = users.map((u) => u.id);
  const wins = await prisma.gameParticipation.groupBy({
    by: ['userId'],
    where: { userId: { in: userIds }, won: true },
    _count: true,
  });
  const winsMap = new Map(wins.map((w) => [w.userId, w._count]));

  return users.map((u, i) => {
    const totalGames = u._count.gameParticipations;
    const totalWins = winsMap.get(u.id) ?? 0;
    return {
      rank: i + 1,
      name: u.name ?? 'Joueur',
      avatarUrl: resolveDiscordAvatarUrl({ image: u.image, discordId: u.discordId }),
      xp: u.xp,
      level: u.level,
      totalGames,
      winRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0,
    };
  });
}

function PodiumCard({ row, accent }: { row: LeaderboardRow; accent: string }) {
  return (
    <div className={`nb-card flex flex-col items-center p-5 ${accent}`}>
      <div className="mb-2 flex size-12 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-white)] font-display text-lg font-bold shadow-[3px_3px_0_0_var(--nb-black)]">
        {row.rank === 1 ? (
          <Crown className="size-6 text-[var(--nb-black)]" strokeWidth={2.5} />
        ) : (
          <span>{row.rank}</span>
        )}
      </div>
      {row.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.avatarUrl}
          alt=""
          className="mb-3 size-16 border-[3px] border-[var(--nb-black)] object-cover shadow-[3px_3px_0_0_var(--nb-black)]"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="mb-3 flex size-16 items-center justify-center border-[3px] border-[var(--nb-black)] bg-[var(--nb-lilac)] text-xl font-black shadow-[3px_3px_0_0_var(--nb-black)]">
          {row.name[0].toUpperCase()}
        </div>
      )}
      <p className="mb-1 text-sm font-bold text-[var(--nb-black)]">{row.name}</p>
      <p className="font-display text-lg font-bold text-[var(--nb-black)]">{row.xp} XP</p>
      <div className="mt-2 flex gap-3 text-[10px] font-bold uppercase tracking-wider text-[var(--bw-text-muted)]">
        <span>Niv. {row.level}</span>
        <span>{row.winRate}% W</span>
      </div>
    </div>
  );
}

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display mb-2 flex items-center gap-3 text-3xl font-bold text-[var(--nb-black)] sm:text-4xl">
        <span className="inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-yellow)] p-2 shadow-[4px_4px_0_0_var(--nb-black)]">
          <Trophy className="size-8 sm:size-10" strokeWidth={2.5} />
        </span>
        Classement
      </h1>
      <p className="mb-8 text-sm font-medium text-[var(--bw-text-muted)]">
        Top 50 joueurs classés par expérience.
      </p>

      {rows.length === 0 ? (
        <div className="nb-card p-10 text-center">
          <Medal className="mx-auto mb-3 size-10 text-[var(--bw-text-faint)]" strokeWidth={2} />
          <p className="font-bold text-[var(--nb-black)]">Aucun joueur encore</p>
          <p className="mt-1 text-sm text-[var(--bw-text-muted)]">
            Les résultats apparaîtront ici dès qu&apos;un joueur aura gagné de l&apos;XP.
          </p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {podium.length > 0 && (
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {podium[1] && <PodiumCard row={podium[1]} accent="sm:mt-6" />}
              {podium[0] && <PodiumCard row={podium[0]} accent="border-[var(--nb-yellow)] bg-[var(--nb-yellow)]/10 sm:order-first sm:col-start-2 sm:row-start-1 sm:order-none" />}
              {podium[2] && <PodiumCard row={podium[2]} accent="sm:mt-10" />}
            </div>
          )}

          {/* Table */}
          {rest.length > 0 && (
            <div className="nb-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-[3px] border-[var(--nb-black)] bg-[var(--bw-muted-bg)] text-left text-[10px] font-extrabold uppercase tracking-wider text-[var(--bw-text-muted)]">
                    <th className="px-3 py-3 text-center">#</th>
                    <th className="px-3 py-3">Joueur</th>
                    <th className="px-3 py-3 text-right">Niv.</th>
                    <th className="px-3 py-3 text-right">XP</th>
                    <th className="hidden px-3 py-3 text-right sm:table-cell">Parties</th>
                    <th className="hidden px-3 py-3 text-right sm:table-cell">Win%</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((row) => (
                    <tr key={row.rank} className="border-b border-[var(--bw-border)] transition hover:bg-[var(--bw-muted-bg)]/50">
                      <td className="px-3 py-2.5 text-center font-bold text-[var(--bw-text-muted)]">{row.rank}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {row.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={row.avatarUrl}
                              alt=""
                              className="size-7 border-[2px] border-[var(--nb-black)] object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex size-7 items-center justify-center border-[2px] border-[var(--nb-black)] bg-[var(--nb-lilac)] text-[10px] font-black">
                              {row.name[0].toUpperCase()}
                            </div>
                          )}
                          <span className="font-bold text-[var(--nb-black)]">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold">{row.level}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-[var(--nb-black)]">{row.xp}</td>
                      <td className="hidden px-3 py-2.5 text-right text-[var(--bw-text-muted)] sm:table-cell">
                        <span className="inline-flex items-center gap-1">
                          <Swords className="size-3" strokeWidth={2} />
                          {row.totalGames}
                        </span>
                      </td>
                      <td className="hidden px-3 py-2.5 text-right text-[var(--bw-text-muted)] sm:table-cell">{row.winRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
