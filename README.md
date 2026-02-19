# TempAlert - Precision Monitoring

Système de surveillance de température en temps réel avec alertes e-mail intelligentes.

## Architecture
- **Framework :** Next.js 15 (App Router)
- **Base de données :** Firestore (Temps réel)
- **Authentification :** Firebase Auth (E-mail/Mot de passe)
- **IA/Alertes :** Genkit + Nodemailer (Gmail)

## Procédure d'Hébergement (Firebase App Hosting)

### 1. Préparation du projet
L'application est configurée pour être déployée via **Firebase App Hosting**, qui gère automatiquement le build Next.js et les Server Actions.

### 2. Déploiement vers GitHub
1. Créez un nouveau dépôt sur GitHub.
2. Poussez votre code :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/VOTRE_NOM/VOTRE_REPO.git
   git push -u origin main
   ```

### 3. Configuration dans la Console Firebase
1. Allez sur la [Console Firebase](https://console.firebase.google.com/).
2. Sélectionnez votre projet.
3. Dans le menu de gauche, allez dans **Build > App Hosting**.
4. Cliquez sur **Get Started** et connectez votre compte GitHub.
5. Sélectionnez votre dépôt et branche (`main`).
6. Firebase créera automatiquement un backend App Hosting et déploiera votre application à chaque "push" sur GitHub.

### 4. Variables d'environnement
Dans la console App Hosting, assurez-vous d'ajouter vos secrets si nécessaire (comme `GEMINI_API_KEY` pour Genkit).

## Sécurité
Les règles Firestore (`firestore.rules`) garantissent que chaque utilisateur ne peut lire et écrire que ses propres données de capteurs et réglages.