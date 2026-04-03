import { ImageIcon, Scale, Shield, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminHomePage() {
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
        <Shield className="size-9 sm:size-10" strokeWidth={2.5} />
        Administration
      </h1>
      <p className="mb-10 max-w-2xl border-l-[4px] border-[var(--nb-black)] pl-4 text-sm font-bold uppercase tracking-wide text-[var(--nb-black)] opacity-80">
        Console de contrôle Botwolf — grades, règles et assets.
      </p>
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
              <h2 className="font-display text-lg font-bold text-[var(--nb-black)] group-hover:underline">
                {title}
              </h2>
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
