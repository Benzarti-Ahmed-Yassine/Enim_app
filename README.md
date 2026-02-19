# TempAlert - Precision Monitoring

Système de surveillance de température en temps réel avec alertes e-mail intelligentes.

## 🚀 Comment exporter/télécharger ce projet
1. **Copie manuelle** : Copiez le contenu des fichiers affichés dans cette interface vers votre ordinateur local.
2. **Structure du projet** :
   - `/src` : Code source Next.js (Frontend & Server Actions)
   - `/public` : Actifs statiques
   - `package.json` : Dépendances
   - `firestore.rules` : Sécurité de la base de données
   - `.env` : Vos clés secrètes (API Key, etc.)

## 🛠️ Installation Locale
1. Installez les dépendances :
   ```bash
   npm install
   ```
2. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## ☁️ Hébergement (Firebase App Hosting)
L'application est conçue pour **Firebase App Hosting** (Next.js 15).

1. **GitHub** : Poussez votre code sur un dépôt GitHub.
2. **Console Firebase** : 
   - Allez dans **Build > App Hosting**.
   - Connectez votre dépôt.
   - Firebase s'occupe de tout (Build, SSL, CDN).
3. **Important** : N'utilisez pas "Firebase Hosting" classique (statique), car il ne supporte pas les fonctions serveur de Next.js nécessaires pour l'envoi d'e-mails.

## 🔒 Sécurité
Les règles Firestore (`firestore.rules`) protègent vos données. Seul l'utilisateur connecté peut accéder à son propre historique et à ses réglages.

## 📧 Alertes
Configurez jusqu'à **5 destinataires** dans l'onglet "Settings". Le système utilise Genkit pour générer des messages d'alerte professionnels.