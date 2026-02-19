'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error) => {
    console.error("Auth Error:", error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
    // On utilise l'émetteur d'erreur pour notifier l'UI via le listener global ou local
    toastError("Erreur d'inscription", error.message);
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    // Notification simple en console et possiblement via toast si on avait accès au hook ici
    // Pour le prototype, on laisse le catch gérer l'échec silencieusement côté redirection
    console.error("Login failed:", error.message);
  });
}

// Note: Dans un environnement réel, on utiliserait un émetteur d'événements dédié aux erreurs d'auth.
