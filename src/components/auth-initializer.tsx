
'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Gère la redirection des utilisateurs non connectés.
 * Si l'utilisateur n'est pas sur la page de login et n'est pas connecté,
 * il est redirigé vers /login.
 */
export function AuthInitializer() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // On ne redirige que si le chargement de l'auth est fini, qu'il n'y a pas d'utilisateur,
    // et qu'on n'est pas déjà sur la page de login.
    if (!isUserLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isUserLoading, pathname, router]);

  return null;
}
