
# TempAlert - Precision Monitoring (Mode Production)

Système de surveillance de température avec Dashboard Cloud et Alertes Multi-E-mails.

## 🚀 Déploiement (Firebase App Hosting)

Cette application utilise **Firebase App Hosting** pour supporter les fonctionnalités serveurs (Next.js Server Actions, Genkit AI, Nodemailer).

### 1. Préparation GitHub
- Créez un nouveau dépôt sur GitHub.
- Poussez votre code :
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_NOM/VOTRE_PROJET.git
git push -u origin main
```

### 2. Configuration Firebase Console
- Allez dans la [Console Firebase](https://console.firebase.google.com/).
- Sélectionnez votre projet : `studio-1892302408-8f785`.
- Menu de gauche : **Build > App Hosting**.
- Cliquez sur **Commencer**.
- Connectez votre compte GitHub et sélectionnez votre dépôt.
- Laissez les paramètres par défaut et cliquez sur **Déployer**.

### 3. Plan Blaze
Note : Firebase App Hosting nécessite que le projet soit sur le plan **Blaze** (paiement à l'usage). Les services resteront gratuits tant que vous restez dans les limites du quota gratuit de Google Cloud.

## 📧 Alertes Multi-E-mails
Vous pouvez configurer jusqu'à 5 adresses e-mail dans les paramètres (séparées par des virgules). Le système enverra une alerte à tous les destinataires simultanément en cas de dépassement de seuil.
