import prisma from '@/lib/prisma';
import { levelFromXp } from '@/lib/xp';

/**
 * Recalcule XP / niveau à partir des `GameParticipation` liées au compte.
 * À appeler après liaison Discord ↔ participations jouées sans compte.
 */
export async function syncUserXpFromParticipations(userId: string): Promise<void> {
  const agg = await prisma.gameParticipation.aggregate({
    where: { userId },
    _sum: { xpAwarded: true },
  });
  const total = agg._sum.xpAwarded ?? 0;
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: total,
      level: levelFromXp(total),
    },
  });
}
