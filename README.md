# TempAlert - Precision Monitoring

Système de surveillance de température en temps réel avec alertes e-mail intelligentes.

## 🚀 Pourquoi "App Hosting" ?
Cette application utilise **Next.js 15** avec des fonctionnalités serveur (Server Actions) pour :
1. **Envoyer des e-mails** via Nodemailer.
2. **Utiliser l'IA** de manière sécurisée.

Le "Firebase Hosting" classique ne supporte que les sites statiques. Pour que les alertes fonctionnent, vous **devez** utiliser **App Hosting**.

## 🛠️ Installation et Déploiement Facile

### 1. Installation Locale
1. Téléchargez les fichiers.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le serveur :
   ```bash
   npm run dev
   ```

### 2. Déploiement en 3 étapes (Production)
1. **GitHub** : Poussez votre code sur un dépôt GitHub (privé ou public).
2. **Console Firebase** : 
   - Allez dans **Build > App Hosting**.
   - Cliquez sur "Get Started" et connectez votre dépôt GitHub.
3. **Lien Magique** : Firebase va créer automatiquement une URL (se terminant par `.a.run.app` ou `.web.app`). C'est votre lien final !

## 📧 Configuration des Alertes
- Allez dans l'onglet **Settings** de l'application.
- Entrez jusqu'à **5 adresses e-mail** séparées par des virgules.
- Définissez votre seuil critique.
- Le système s'occupe du reste !

## 🔒 Sécurité
Les comptes sont gérés via **Firebase Authentication**. Par sécurité, l'inscription est désactivée dans l'interface. Créez vos utilisateurs directement dans la console Firebase sous l'onglet "Auth".
