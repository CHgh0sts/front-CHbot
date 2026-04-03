import {
  ArrowRight,
  Gamepad2,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative mx-auto max-w-5xl px-4 py-12 sm:py-20">
      <div
        className="pointer-events-none absolute -right-4 top-8 hidden h-24 w-24 rotate-12 border-[3px] border-[var(--nb-black)] bg-[var(--nb-mint)] shadow-[6px_6px_0_0_var(--nb-black)] sm:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-2 bottom-24 hidden h-16 w-16 -rotate-6 border-[3px] border-[var(--nb-black)] bg-[var(--nb-lilac)] shadow-[5px_5px_0_0_var(--nb-black)] lg:block"
        aria-hidden
      />

      <div className="relative mb-10 inline-flex flex-wrap items-center gap-2">
        <span className="nb-badge">Discord</span>
        <span className="nb-badge bg-[var(--nb-mint)]">Loup-Garou</span>
        <span className="nb-badge bg-[var(--nb-coral)] text-[#fffef8]">
          XP & grades
        </span>
      </div>

      <h1 className="nb-hero-title font-display mb-6 max-w-4xl text-[var(--nb-black)]">
        Le hub qui lie ton{' '}
        <span className="relative inline-block bg-[var(--nb-yellow)] px-1 decoration-clone box-decoration-clone">
          serveur
        </span>{' '}
        à ton compte joueur.
      </h1>

      <p className="mb-12 max-w-2xl text-lg font-medium leading-relaxed text-[var(--nb-black)] opacity-90">
        Presets de partie, images de cartes, progression et admin — tout avec un
        style qui assume. Crée ton compte, colle ton code{' '}
        <code className="border-[2px] border-[var(--nb-black)] bg-[var(--nb-white)] px-1.5 py-0.5 font-mono text-sm font-bold shadow-[2px_2px_0_0_var(--nb-black)]">
          /lg-init
        </code>{' '}
        sur Discord, c’est parti.
      </p>

      <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <Link href="/login" className="nb-btn-primary min-h-[3rem] px-8 py-4 text-sm">
          <Sparkles className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
          <span className="whitespace-nowrap">Connexion</span>
          <ArrowRight className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
        </Link>
        <Link href="/register" className="nb-btn-coral min-h-[3rem] px-8 py-4 text-sm">
          <Users className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
          <span className="whitespace-nowrap">Créer un compte</span>
        </Link>
        <Link href="/profile" className="nb-btn-ghost min-h-[3rem] px-8 py-4 text-sm">
          <Trophy className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
          <span className="whitespace-nowrap">Mon profil</span>
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <article className="nb-card group p-5 transition-transform hover:-rotate-1">
          <div className="mb-4 inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-yellow)] p-3 shadow-[3px_3px_0_0_var(--nb-black)]">
            <SlidersHorizontal
              className="size-7 text-[var(--nb-black)]"
              strokeWidth={2.5}
            />
          </div>
          <h2 className="font-display mb-2 text-xl text-[var(--nb-black)]">
            Presets
          </h2>
          <p className="text-sm font-medium leading-snug opacity-85">
            Composition sauvegardée, code à 5 caractères, import direct dans le
            bot.
          </p>
        </article>
        <article className="nb-card group p-5 transition-transform hover:rotate-1">
          <div className="mb-4 inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-mint)] p-3 shadow-[3px_3px_0_0_var(--nb-black)]">
            <Trophy className="size-7 text-[var(--nb-black)]" strokeWidth={2.5} />
          </div>
          <h2 className="font-display mb-2 text-xl text-[var(--nb-black)]">
            XP
          </h2>
          <p className="text-sm font-medium leading-snug opacity-85">
            Historique des parties, niveaux et récompenses quand le bot est
            relié au site.
          </p>
        </article>
        <article className="nb-card group p-5 md:col-span-1">
          <div className="mb-4 inline-flex border-[3px] border-[var(--nb-black)] bg-[var(--nb-lilac)] p-3 shadow-[3px_3px_0_0_var(--nb-black)]">
            <Gamepad2 className="size-7 text-[var(--nb-black)]" strokeWidth={2.5} />
          </div>
          <h2 className="font-display mb-2 text-xl text-[var(--nb-black)]">
            Premium
          </h2>
          <p className="text-sm font-medium leading-snug opacity-85">
            Images de cartes par rôle, options avancées — gérées depuis l’admin
            et ton grade.
          </p>
        </article>
      </div>
    </main>
  );
}
