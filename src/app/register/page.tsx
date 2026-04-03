import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { RegisterForm } from './RegisterForm';

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/profile');
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <div className="nb-card p-6 sm:p-8">
        <h1 className="font-display mb-2 text-3xl text-[var(--nb-black)] sm:text-4xl">
          Inscription
        </h1>
        <p className="mb-8 text-sm font-bold uppercase tracking-wider text-[var(--nb-black)] opacity-70">
          Nouveau sur Botwolf
        </p>
        <RegisterForm />
      </div>
      <p className="mt-8 text-center text-sm font-bold text-[var(--nb-black)]">
        Déjà un compte ?{' '}
        <Link
          href="/login"
          className="border-b-[3px] border-[var(--nb-black)] bg-[var(--nb-yellow)] px-1 font-extrabold uppercase tracking-wide hover:bg-[var(--nb-mint)]"
        >
          Connexion
        </Link>
      </p>
    </main>
  );
}
