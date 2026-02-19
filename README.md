
# TempAlert - Precision Monitoring (Mode Gratuit)

Système de surveillance de température avec Dashboard Cloud.

## 🌟 Mode Plan Gratuit (Spark)
Cette version est configurée pour fonctionner sur le plan **Spark** de Firebase. 
- **Ce qui marche :** Authentification, Base de données temps réel (Firestore), Dashboard, Historique.
- **Ce qui est désactivé :** L'envoi automatique d'e-mails d'alerte (nécessite le plan Blaze).

## 🚀 Déploiement Facile (Hosting Classique)

### 1. Préparation
Assurez-vous d'avoir installé les outils Firebase sur votre ordinateur :
```bash
npm install -g firebase-tools
```

### 2. Initialisation
Dans le dossier du projet :
```bash
firebase login
firebase init hosting
```
- Sélectionnez votre projet : `studio-1892302408-8f785`
- Répertoire public : `out` (très important !)
- Configurer comme single-page app : `Yes`
- Déploiements automatiques avec GitHub : `No` (ou `Yes` si vous voulez)

### 3. Déploiement
Chaque fois que vous voulez mettre à jour le site :
```bash
npm run build
firebase deploy --only hosting
```

## 📧 Note sur les Alertes
Puisque le mode gratuit ne permet pas d'envoyer des mails via le serveur, l'alerte visuelle s'affichera toujours sur le Dashboard, mais l'e-mail ne sera pas expédié.
