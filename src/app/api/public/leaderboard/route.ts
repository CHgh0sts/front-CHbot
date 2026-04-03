import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
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

  const rows = users.map((u, i) => {
    const totalGames = u._count.gameParticipations;
    const totalWins = winsMap.get(u.id) ?? 0;
    return {
      rank: i + 1,
      name: u.name ?? 'Joueur',
      image: u.image,
      discordId: u.discordId,
      xp: u.xp,
      level: u.level,
      totalGames,
      winRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0,
    };
  });

  return NextResponse.json(rows);
}
