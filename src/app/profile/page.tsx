import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ProfileView } from '@/components/ProfileView';
import prisma from '@/lib/prisma';
import { resolveDiscordAvatarUrl } from '@/lib/discord-avatar';
import { syncUserXpFromParticipations } from '@/lib/sync-user-xp';
import { xpLevelProgress } from '@/lib/xp';

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
      email: true,
      gameParticipations: {
        take: 100,
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
    user.name ?? session.user.name ?? user.email?.split('@')[0] ?? 'Joueur';
  const initial = displayName.trim().slice(0, 1).toUpperCase() || '?';

  const xpProgress = xpLevelProgress(user.xp);

  const participations = user.gameParticipations.map((g) => ({
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
      email={user.email ?? session.user.email ?? null}
      level={user.level}
      xp={user.xp}
      tier={user.tier}
      discordId={user.discordId}
      siteRole={user.siteRole}
      xpProgress={xpProgress}
      participations={participations}
    />
  );
}
