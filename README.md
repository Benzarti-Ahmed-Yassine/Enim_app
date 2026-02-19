# TempAlert - Precision Monitoring

Système de surveillance de température en temps réel avec alertes e-mail intelligentes.

## 🚀 Pourquoi "App Hosting" ?
Cette application utilise **Next.js 15** avec des fonctionnalités serveur (Server Actions) pour :
1. **Envoyer des e-mails** via Nodemailer.
2. **Utiliser l'IA** de manière sécurisée.

Le "Firebase Hosting" classique ne supporte que les sites statiques. Pour que les alertes fonctionnent, vous **devez** utiliser **App Hosting**.

## 🛠️ Comment pousser ce projet sur GitHub (Étapes simples)

### 1. Créez un dépôt sur GitHub
- Allez sur [github.com/new](https://github.com/new).
- Nommez votre projet (ex: `temp-alert-precision`).
- Ne cochez **aucune** case (README, .gitignore).
- Cliquez sur "Create repository".

### 2. Exécutez ces commandes dans votre terminal
Ouvrez le terminal dans le dossier du projet et copiez-collez ces lignes une par une :

```bash
git init
git add .
git commit -m "Initial commit: TempAlert setup"
git branch -M main
git remote add origin https://github.com/VOTRE_NOM_UTILISATEUR/VOTRE_NOM_REPO.git
git push -u origin main
```
*(Remplacez l'URL par celle fournie par GitHub)*.

## 🌐 Déploiement Firebase App Hosting
1. Allez dans la [Console Firebase](https://console.firebase.google.com/project/studio-1892302408-8f785/apphosting).
2. Cliquez sur **"Get Started"** (Commencer).
3. Connectez votre compte GitHub.
4. Sélectionnez le dépôt que vous venez de créer.
5. Firebase déploiera automatiquement votre application et vous donnera le lien final !

## 📧 Configuration des Alertes
- Allez dans l'onglet **Settings** de l'application.
- Entrez jusqu'à **5 adresses e-mail** séparées par des virgules.
- Définissez votre seuil critique.
- Le système s'occupe du reste !