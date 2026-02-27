'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseSdks {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

/**
 * Initialise Firebase de manière sécurisée.
 * Si les clés sont invalides ou manquantes, retourne des instances nulles
 * au lieu de faire planter l'application.
 */
export function initializeFirebase(): FirebaseSdks {
  // Vérification si la config semble valide (pas les valeurs par défaut ou vides)
  const isConfigValid = !!firebaseConfig.apiKey && 
                        firebaseConfig.apiKey !== 'votre_api_key' && 
                        firebaseConfig.apiKey.length > 10;

  try {
    if (!getApps().length) {
      let firebaseApp: FirebaseApp;
      
      try {
        // Tentative via App Hosting (automatique en prod)
        firebaseApp = initializeApp();
      } catch (e) {
        // Fallback sur le fichier config
        if (!isConfigValid) {
          console.warn("Firebase: Configuration manquante ou clé API invalide dans .env");
          return { firebaseApp: null, auth: null, firestore: null };
        }
        firebaseApp = initializeApp(firebaseConfig);
      }

      return getSdks(firebaseApp);
    }

    return getSdks(getApp());
  } catch (error) {
    console.error("Erreur lors de l'initialisation Firebase:", error);
    return { firebaseApp: null, auth: null, firestore: null };
  }
}

export function getSdks(firebaseApp: FirebaseApp): FirebaseSdks {
  try {
    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp)
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des SDKs:", error);
    return { firebaseApp: null, auth: null, firestore: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
