import { Gamepad2, ImageIcon, Scale, Shield, Swords, Ticket, Users } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  const [userCount, gameCount, presetCount] = await Promise.all([
    prisma.user.count(),
    prisma.gameParticipation.count(),
    prisma.partyConfigPreset.count(),
  ]);

  const stats = [
    { label: 'Utilisateurs', value: userCount, icon: Users, color: 'bg-[var(--nb-mint)]' },
    { label: 'Parties jouées', value: gameCount, icon: Swords, color: 'bg-[var(--nb-yellow)]' },
    { label: 'Presets créés', value: presetCount, icon: Ticket, color: 'bg-[var(--nb-lilac)]' },
  ];

  const tiles = [
    {
      href: '/admin/users',
      icon: Users,
      title: 'Utilisateurs',
      desc: 'Palier Premium, promotion admin / modérateur.',
      bg: 'bg-[var(--nb-mint)]',
    },
    {
      href: '/admin/rules',
      icon: Scale,
      title: 'Règles de composition',
      desc: 'Quelle option exige quel grade minimum.',
      bg: 'bg-[var(--nb-lilac)]',
    },
    {
      href: '/admin/role-cards',
      icon: ImageIcon,
      title: 'Images des cartes',
      desc: 'Visuels par défaut pour chaque rôle.',
      bg: 'bg-[var(--nb-yellow)]',
    },
  ] as const;

  return (
    <div>
      <h1 className="font-display mb-3 flex items-center gap-3 text-3xl font-bold text-[var(--nb-black)] sm:text-4xl">
        <span className="inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-coral)] p-2 shadow-[4px_4px_0_0_var(--nb-black)]">
          <Shield className="size-8 text-[#fffef8] sm:size-10" strokeWidth={2.5} />
        </span>
        Administration
      </h1>
      <p className="mb-8 text-sm font-medium text-[var(--bw-text-muted)]">
        Console de contrôle Botwolf — grades, règles et assets.
      </p>

      {/* Stats overview */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="nb-card flex items-center gap-4 p-5">
            <div className={`inline-flex border-[3px] border-[var(--nb-black)] ${color} p-3 shadow-[3px_3px_0_0_var(--nb-black)]`}>
              <Icon className="size-6 text-[var(--nb-black)]" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-[var(--nb-black)]">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--bw-text-muted)]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation tiles */}
      <h2 className="font-display mb-4 text-lg font-bold text-[var(--nb-black)]">
        <Gamepad2 className="mr-2 inline-block size-5" strokeWidth={2.5} />
        Gestion
      </h2>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ href, icon: Icon, title, desc, bg }) => (
          <li key={href}>
            <Link
              href={href}
              className="nb-card group block h-full p-5 transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0_0_var(--nb-black)]"
            >
              <div
                className={`mb-4 inline-flex border-[3px] border-[var(--nb-black)] p-3 shadow-[3px_3px_0_0_var(--nb-black)] ${bg}`}
              >
                <Icon className="size-7 text-[var(--nb-black)]" strokeWidth={2.5} />
              </div>
              <h3 className="font-display text-lg font-bold text-[var(--nb-black)] group-hover:underline">
                {title}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-snug opacity-80">
                {desc}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
