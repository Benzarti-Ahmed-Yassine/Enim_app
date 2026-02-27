
# TempAlert - Precision Monitoring (Production ENIM)

Système de surveillance de température haute précision avec Dashboard Cloud et Alertes IA.

## 🔒 Sécurité & GitHub
**Ne partagez jamais votre fichier `.env` sur GitHub.** 
Ce projet est configuré pour utiliser des variables d'environnement. Pour protéger vos clés :
1. Le fichier `.env` est ignoré par Git (via `.gitignore`).
2. En production, les clés sont injectées via l'interface de votre hébergeur.

## 🚀 Configuration sur Render (Production)
Pour que l'application fonctionne une fois déployée sur [Render](https://render.com), suivez ces étapes :

1. Allez dans le tableau de bord **Render**.
2. Sélectionnez votre **Web Service**.
3. Cliquez sur l'onglet **Environment**.
4. Cliquez sur **Add Environment Variable** pour chaque ligne suivante :

| Clé (Key) | Valeur (Value) |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | *Votre clé API Firebase* |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | *votre-projet.firebaseapp.com* |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | *votre-id-projet* |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | *votre-projet.appspot.com* |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *votre-sender-id* |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | *votre-app-id* |
| `GOOGLE_GENAI_API_KEY` | *Votre clé Gemini (AI Studio)* |

5. Cliquez sur **Save Changes**. Render redéployera automatiquement l'application avec ces paramètres sécurisés.

## 🤖 Activation de l'IA (Genkit)
Ce projet utilise **Google AI Studio (Gemini)** en mode **Free Tier** (Gratuit).
- Obtenez votre clé sur : [https://aistudio.google.com/](https://aistudio.google.com/)

## 🔌 Intégration Hardware (Arduino / ESP32)
Le dashboard affiche les données envoyées par vos capteurs en temps réel via Firestore. Assurez-vous que votre code Arduino pointe vers la bonne collection `/users/{userId}/temperatureMeasurements/`.
