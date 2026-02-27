import type {Metadata} from 'next';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthInitializer } from '@/components/auth-initializer';

export const metadata: Metadata = {
  title: 'TempAlert - ENIM Monastir',
  description: 'Système de surveillance de température en temps réel - ENIM',
  icons: {
    icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAA9PUorWwTxECMDSjnBOt3vG3hxX84Qu05A&s',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-slate-50 min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <AuthInitializer />
          <Navigation />
          <main className="flex-1 pb-24 pt-28 px-4 max-w-5xl mx-auto w-full">
            {children}
          </main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
