import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ProfileView } from '@/components/ProfileView';
import prisma from '@/lib/prisma';
import { resolveDiscordAvatarUrl } from '@/lib/discord-avatar';
import { syncUserXpFromParticipations } from '@/lib/sync-user-xp';
import { xpLevelProgress } from '@/lib/xp';

export const metadata: Metadata = {
  title: 'Mon profil',
  description: 'Statistiques, progression XP et historique des parties.',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/profile');
  }

  await syncUserXpFromParticipations(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      image: true,
      xp: true,
      level: true,
      tier: true,
      siteRole: true,
      discordId: true,
      gameParticipations: {
        orderBy: { endedAt: 'desc' },
        select: {
          id: true,
          endedAt: true,
          roleKey: true,
          won: true,
          guildId: true,
          xpAwarded: true,
          presetPublicCode: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const avatarUrl = resolveDiscordAvatarUrl({
    image: session.user.image ?? user.image,
    discordId: user.discordId,
  });
  const displayName =
    user.name ?? session.user.name ?? 'Joueur';
  const initial = displayName.trim().slice(0, 1).toUpperCase() || '?';

  const xpProgress = xpLevelProgress(user.xp);

  const allGames = user.gameParticipations;
  const totalGames = allGames.length;
  const totalWins = allGames.filter((g) => g.won).length;
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  const roleCountMap: Record<string, number> = {};
  for (const g of allGames) {
    roleCountMap[g.roleKey] = (roleCountMap[g.roleKey] ?? 0) + 1;
  }
  const favoriteRole = Object.entries(roleCountMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  let currentStreak = 0;
  let streakType: 'win' | 'loss' | null = null;
  for (const g of allGames) {
    if (streakType === null) {
      streakType = g.won ? 'win' : 'loss';
      currentStreak = 1;
    } else if ((streakType === 'win' && g.won) || (streakType === 'loss' && !g.won)) {
      currentStreak++;
    } else {
      break;
    }
  }

  const now = new Date();
  const weekActivity: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    const count = allGames.filter((g) => g.endedAt.toISOString().slice(0, 10) === dayStr).length;
    weekActivity.push({ day: label, count });
  }

  const participations = allGames.map((g) => ({
    id: g.id,
    endedAt: g.endedAt.toISOString(),
    roleKey: g.roleKey,
    won: g.won,
    guildId: g.guildId,
    xpAwarded: g.xpAwarded,
    presetPublicCode: g.presetPublicCode,
  }));

  return (
    <ProfileView
      displayName={displayName}
      initial={initial}
      avatarUrl={avatarUrl}
      level={user.level}
      xp={user.xp}
      tier={user.tier}
      discordId={user.discordId}
      siteRole={user.siteRole}
      xpProgress={xpProgress}
      participations={participations}
      stats={{
        totalGames,
        totalWins,
        winRate,
        favoriteRole,
        currentStreak,
        streakType: streakType ?? 'win',
        weekActivity,
      }}
    />
  );
}
