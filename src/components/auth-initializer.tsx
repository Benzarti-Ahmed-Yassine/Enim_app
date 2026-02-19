
'use client';

import { useEffect } from 'react';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';

/**
 * Initialise une session anonyme automatiquement si aucun utilisateur n'est connecté.
 * Cela garantit que les fonctionnalités Firestore liées à l'utilisateur (comme les paramètres) fonctionnent immédiatement.
 */
export function AuthInitializer() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  return null;
}
