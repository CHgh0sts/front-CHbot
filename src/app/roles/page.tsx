import { BookOpen, Shield, Skull, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import {
  BOT_ROLE_KEYS,
  BOT_ROLE_LABELS_FR,
  BOT_ROLE_DESCRIPTIONS_FR,
  BOT_ROLE_CAMPS,
} from '@/lib/role-keys';

export const metadata: Metadata = {
  title: 'Rôles — Botwolf',
  description: 'Encyclopédie des rôles du Loup-Garou : descriptions, camps et images.',
};

const CAMP_CONFIG = {
  loup: {
    label: 'Loup',
    color: 'bg-[var(--nb-coral)]',
    textColor: 'text-[#fffef8]',
    icon: Skull,
  },
  village: {
    label: 'Village',
    color: 'bg-[var(--nb-mint)]',
    textColor: 'text-[var(--nb-black)]',
    icon: Shield,
  },
  solo: {
    label: 'Solo',
    color: 'bg-[var(--nb-lilac)]',
    textColor: 'text-[var(--nb-black)]',
    icon: Sparkles,
  },
} as const;

export default function RolesPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display mb-2 flex items-center gap-3 text-3xl font-bold text-[var(--nb-black)] sm:text-4xl">
        <span className="inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-lilac)] p-2 shadow-[4px_4px_0_0_var(--nb-black)]">
          <BookOpen className="size-8 sm:size-10" strokeWidth={2.5} />
        </span>
        Rôles du jeu
      </h1>
      <p className="mb-8 text-sm font-medium text-[var(--bw-text-muted)]">
        Découvre tous les rôles disponibles dans le Loup-Garou de Botwolf.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BOT_ROLE_KEYS.map((key) => {
          const camp = BOT_ROLE_CAMPS[key];
          const campCfg = CAMP_CONFIG[camp];
          const CampIcon = campCfg.icon;
          const imgUrl = `/api/public/role-card-default/${encodeURIComponent(key)}`;

          return (
            <article key={key} className="nb-card group overflow-hidden transition-transform hover:-rotate-1">
              <div className="relative aspect-[4/3] overflow-hidden border-b-[3px] border-[var(--nb-black)] bg-[var(--nb-black)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={BOT_ROLE_LABELS_FR[key]}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className={`absolute right-2 top-2 inline-flex items-center gap-1 border-[2px] border-[var(--nb-black)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide shadow-[2px_2px_0_0_var(--nb-black)] ${campCfg.color} ${campCfg.textColor}`}>
                  <CampIcon className="size-3" strokeWidth={2.5} />
                  {campCfg.label}
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-display mb-1 text-lg font-bold text-[var(--nb-black)]">
                  {BOT_ROLE_LABELS_FR[key]}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--bw-text-muted)]">
                  {BOT_ROLE_DESCRIPTIONS_FR[key]}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
