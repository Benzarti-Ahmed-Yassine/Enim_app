
# TempAlert - Precision Monitoring (Production ENIM)

Système de surveillance de température haute précision avec Dashboard Cloud et Alertes IA.

## 🔒 Sécurité & GitHub
**Ne partagez jamais votre fichier `.env` sur GitHub.**
Pour protéger vos clés :
1. Assurez-vous que `.env` est listé dans votre fichier `.gitignore`.
2. En production (Render/Vercel), ajoutez toutes les variables listées dans `.env` dans les paramètres "Environment Variables" de votre hébergeur.

## 🤖 Activation de l'IA (Genkit)
Ce projet utilise **Google AI Studio (Gemini)** en mode **Free Tier** (Gratuit).

### Configuration :
1. Créez une clé sur [Google AI Studio](https://aistudio.google.com/).
2. Ajoutez `GOOGLE_GENAI_API_KEY` dans vos variables d'environnement.

## 🔌 Intégration Hardware (Arduino / ESP32)
Le dashboard affiche les données envoyées par vos capteurs en temps réel via Firestore.

### 1. Configuration Arduino
Utilisez le code suivant pour envoyer vos données (remplacez les valeurs par vos identifiants réels trouvés dans la console Firebase) :

```cpp
// --- CONFIGURATION FIREBASE ---
const String projectId = "votre_project_id";
const String userId = "votre_uid_utilisateur"; // Console Firebase > Auth > Users
const String apiKey = "votre_api_key_web";     // Console Firebase > Paramètres Projet
```
