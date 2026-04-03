import { adminUpdateUserFromForm } from '@/actions/admin';
import prisma from '@/lib/prisma';
import { resolveDiscordAvatarUrl } from '@/lib/discord-avatar';
import { SiteRole, SubscriptionTier } from '@/generated/prisma';
import { Crown, Search, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { discordId: { contains: query } },
            { name: { contains: query, mode: 'insensitive' } },
            { id: { equals: query } },
          ],
        }
      : undefined,
    take: 80,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      discordId: true,
      siteRole: true,
      tier: true,
      xp: true,
      level: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h1 className="font-display mb-2 flex items-center gap-3 text-3xl font-bold text-[var(--nb-black)]">
        <Users className="size-8" strokeWidth={2.5} />
        Utilisateurs
      </h1>
      <p className="mb-6 text-sm text-[var(--bw-text-muted)]">
        {users.length} résultat{users.length !== 1 ? 's' : ''}
        {query && ` pour « ${query} »`}
      </p>

      <form method="get" className="mb-8 flex flex-wrap gap-2">
        <div className="relative min-w-[12rem] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--bw-text-faint)]" strokeWidth={2.5} />
          <input
            type="search"
            name="q"
            placeholder="Email, Discord ID, nom, id..."
            defaultValue={query}
            className="nb-input pl-9 text-sm"
          />
        </div>
        <button type="submit" className="nb-btn-primary text-sm">
          Rechercher
        </button>
      </form>

      {users.length === 0 ? (
        <div className="nb-card p-10 text-center">
          <Users className="mx-auto mb-3 size-10 text-[var(--bw-text-faint)]" strokeWidth={2} />
          <p className="font-bold text-[var(--nb-black)]">Aucun résultat</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((u) => {
            const avatar = resolveDiscordAvatarUrl({ image: u.image, discordId: u.discordId });
            const tierBadge =
              u.tier === SubscriptionTier.PREMIUM
                ? 'bg-[var(--nb-yellow)]'
                : 'bg-[var(--bw-muted-bg)]';

            return (
              <div key={u.id} className="nb-card p-4 sm:p-5">
                <div className="mb-4 flex items-start gap-3">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatar}
                      alt=""
                      className="size-10 shrink-0 border-[2px] border-[var(--nb-black)] object-cover shadow-[2px_2px_0_0_var(--nb-black)]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center border-[2px] border-[var(--nb-black)] bg-[var(--nb-lilac)] text-sm font-black shadow-[2px_2px_0_0_var(--nb-black)]">
                      {(u.name ?? '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[var(--nb-black)]">
                        {u.name ?? '—'}
                      </span>
                      <span className={`inline-flex items-center gap-1 border-[2px] border-[var(--nb-black)] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${tierBadge}`}>
                        <Crown className="size-3" strokeWidth={2.5} />
                        {u.tier}
                      </span>
                      {u.siteRole !== 'USER' && (
                        <span className="border-[2px] border-[var(--nb-black)] bg-[var(--nb-coral)] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#fffef8]">
                          {u.siteRole}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[var(--bw-text-muted)]">
                      {u.email && <span>{u.email}</span>}
                      {u.discordId && <span className="font-mono">{u.discordId}</span>}
                      <span>Niv. {u.level} &middot; {u.xp} XP</span>
                      <span>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                <form action={adminUpdateUserFromForm} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="userId" value={u.id} />
                  <label className="flex flex-col gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--bw-text-muted)]">
                    Rôle site
                    <select
                      name="siteRole"
                      defaultValue={u.siteRole}
                      className="nb-input w-auto py-1.5 text-sm"
                    >
                      {Object.values(SiteRole).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--bw-text-muted)]">
                    Grade
                    <select
                      name="tier"
                      defaultValue={u.tier}
                      className="nb-input w-auto py-1.5 text-sm"
                    >
                      {Object.values(SubscriptionTier).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="nb-btn-primary py-2 text-xs">
                    Enregistrer
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
