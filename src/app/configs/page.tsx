import { ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { SubscriptionTier } from '@/generated/prisma';
import { PartyConfigForm } from './PartyConfigForm';

export const dynamic = 'force-dynamic';

export default async function ConfigsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/configs');
  }

  const presets = await prisma.partyConfigPreset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: { publicCode: true, name: true, createdAt: true },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <p className="mb-6">
        <Link
          href="/profile"
          className="text-sm text-[var(--bw-text-muted)] underline-offset-2 hover:text-[var(--bw-accent)] hover:underline"
        >
          ← Profil
        </Link>
      </p>
      <h1 className="font-display mb-4 flex flex-wrap items-center gap-3 text-3xl font-bold text-[var(--nb-black)] sm:text-4xl">
        <span className="inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-yellow)] p-2 shadow-[4px_4px_0_0_var(--nb-black)]">
          <ClipboardList className="size-8 sm:size-10" strokeWidth={2.5} />
        </span>
        Config de parties
      </h1>
      <p className="mb-8 leading-relaxed text-[var(--bw-text-muted)]">
        Enregistre une composition Loup-Garou : tu reçois un{' '}
        <strong className="text-[var(--bw-text)]">code à 5 caractères</strong>.
        Sur Discord, lance{' '}
        <code className="rounded-md bg-[var(--bw-muted-bg)] px-1.5 py-0.5 font-mono text-sm text-[var(--bw-text)]">
          /lg-init
        </code>{' '}
        et renseigne l’option <strong>preset</strong> avec ce code (le bot doit
        avoir{' '}
        <code className="rounded-md bg-[var(--bw-muted-bg)] px-1.5 py-0.5 font-mono text-sm">
          STATS_API_BASE_URL
        </code>{' '}
        et le même secret que le site).
      </p>
      <PartyConfigForm
        existing={presets}
        isPremium={session.user.tier === SubscriptionTier.PREMIUM}
      />
    </main>
  );
}
