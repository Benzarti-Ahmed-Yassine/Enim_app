# TempAlert - Precision Monitoring (Mode Production)

Système de surveillance de température avec Dashboard Cloud et Alertes Multi-E-mails.

## 🔒 Sécurité & Comptes
Pour cette version, la création de compte est **désactivée pour le public**. Seul l'administrateur peut ajouter des utilisateurs :
1. Accédez à la [Console Firebase](https://console.firebase.google.com/).
2. Allez dans **Build > Authentication**.
3. Cliquez sur **Add user** pour créer un identifiant (Email/Mot de passe).

## 🚀 Déploiement (Firebase App Hosting)

Cette application utilise **Firebase App Hosting** pour supporter les fonctionnalités serveurs.

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
- Menu de gauche : **Build > App Hosting**.
- Cliquez sur **Commencer**.
- Connectez votre compte GitHub et sélectionnez votre dépôt.
- Laissez les paramètres par défaut et cliquez sur **Déployer**.

### 3. Plan Blaze
Note : Firebase App Hosting nécessite le plan **Blaze**. Les services restent gratuits tant que vous restez dans les limites du quota gratuit.

## 📧 Alertes Multi-E-mails
Vous pouvez configurer jusqu'à **5 adresses e-mail** dans les paramètres. Le système enverra une alerte IA personnalisée à tous les destinataires simultanément en cas de dépassement de seuil.