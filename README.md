# TempAlert - ENIM Monastir (Production)

Système de surveillance thermique haute précision pour les laboratoires de l'École Nationale d'Ingénieurs de Monastir.

## 🚀 Comment envoyer vers votre GitHub ?

Ouvrez un terminal dans le dossier du projet et exécutez ces commandes :

```bash
# Initialiser git (si ce n'est pas déjà fait)
git init

# Ajouter votre dépôt distant
git remote add origin https://github.com/Benzarti-Ahmed-Yassine/Enim_app.git

# Ajouter tous les fichiers
git add .

# Créer votre premier message de validation
git commit -m "Déploiement initial de TempAlert v3.0 - Interface ENIM"

# Envoyer vers GitHub
git push -u origin main
```

## 🛡️ Configuration Sécurisée
L'application est configurée avec les clés Firebase institutionnelles. 
- **Projet** : studio-1892302408-8f785
- **Admin** : informatique@enim.tn

## 🤖 Intelligence Artificielle
Utilise **Genkit** et **Gemini 2.5 Flash** pour l'analyse des dépassements de seuils et l'envoi d'alertes formelles par e-mail via Nodemailer.

## 🌡️ Connexion Matérielle (ESP32)
Le système est compatible avec les capteurs PT100/MAX31865 envoyant des données au format JSON vers Firestore.
