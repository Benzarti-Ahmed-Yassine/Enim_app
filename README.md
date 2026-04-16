# TempAlert - ENIM Monastir (Production)

Système de surveillance thermique haute précision pour les laboratoires de l'École Nationale d'Ingénieurs de Monastir.

## 🚀 Déploiement vers GitHub

Ouvrez un terminal dans le dossier du projet et exécutez ces commandes :

```bash
# Initialiser git
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

## 🌐 Configuration Netlify (Recommandé)

Lors du déploiement sur Netlify, utilisez ces paramètres :

- **Base directory** : (Laisser vide)
- **Build command** : `npm run build`
- **Publish directory** : `.next`
- **Functions directory** : (Laisser vide)

### Variables d'environnement à ajouter sur Netlify/Render :
Vous devez ajouter ces clés dans les paramètres de votre hébergeur pour que le système fonctionne :
- `GOOGLE_GENAI_API_KEY` : Votre clé Gemini (AI).
- `EMAIL_USER` : `benzartiahmedyassine@gmail.com`
- `EMAIL_PASS` : `ozhh jdsc ecyj tfsx` (Mot de passe d'application Google)

## 🛡️ Sécurité Firestore
L'application utilise les clés Firebase intégrées dans `src/firebase/config.ts`. Les règles de sécurité Firestore garantissent que seul le propriétaire du compte `informatique@enim.tn` peut accéder aux données.

## 🤖 Intelligence Artificielle
Utilise **Genkit** et **Gemini 2.5 Flash** pour l'analyse des dépassements de seuils et l'envoi d'alertes formelles par e-mail.

## 🌡️ Connexion Matérielle (ESP32)
Le système est compatible avec les capteurs PT100. L'ESP32 doit envoyer les données en format JSON vers la collection `/users/L18uhhHbCdNDvhiCCaqjR28ccvB2/temperatureMeasurements`.
