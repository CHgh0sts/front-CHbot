import type { Metadata } from 'next';
import { DM_Sans, Geist_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/SessionProvider';
import { SiteNav } from '@/components/SiteNav';

const dmSans = DM_Sans({
  variable: '--font-dm',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Botwolf — Espace joueur',
  description: 'Profil, XP et administration du bot Loup-Garou Discord',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="nb-app-bg flex min-h-full flex-col text-[var(--nb-black)]"
        suppressHydrationWarning
      >
        <div className="nb-stripe shrink-0" aria-hidden />
        <SessionProvider>
          <SiteNav />
          <div className="flex-1">{children}</div>
        </SessionProvider>
      </body>
    </html>
  );
}
