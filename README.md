# TempAlert - Precision Monitoring (Production ENIM)

Système de surveillance de température haute précision avec Dashboard Cloud et Alertes IA.

## 🔒 Sécurité & Bonnes Pratiques
**Pourquoi utilisons-nous un fichier `.env` ?**
Mettre des clés API directement dans le code source (Hardcoding) présente des risques majeurs :
1. **Fuite de données** : Vos clés sont visibles par toute personne accédant au code ou via les historiques Git.
2. **Abus de ressources** : Des robots peuvent voler vos clés pour utiliser vos quotas Gemini ou Firebase à vos frais.
3. **Rigidité** : Impossible de différencier les clés de Test et de Production sans modifier le code.

**Règle d'or :** Ne partagez jamais votre fichier `.env` et assurez-vous qu'il est listé dans votre `.gitignore`.

## 🚀 Configuration sur Render (Production)
Pour que l'application fonctionne une fois déployée, configurez ces variables dans l'onglet **Environment** de votre Web Service sur Render :

| Catégorie | Clé (Key) | Description |
| :--- | :--- | :--- |
| **Firebase** | `NEXT_PUBLIC_FIREBASE_...` | Les 6 clés de votre projet Firebase |
| **IA** | `GOOGLE_GENAI_API_KEY` | Votre clé Gemini (AI Studio) |
| **Email** | `EMAIL_USER` | Votre adresse Gmail pour les alertes |
| **Email** | `EMAIL_PASS` | Votre mot de passe d'application Google |

## 🤖 Activation de l'IA (Genkit)
L'IA est utilisée pour rédiger les e-mails d'alerte de manière professionnelle. Obtenez votre clé sur : [https://aistudio.google.com/](https://aistudio.google.com/)

## 🔌 Intégration Hardware (Arduino / ESP32)
Le dashboard affiche les données envoyées par vos capteurs en temps réel via Firestore. Assurez-vous que votre code Arduino pointe vers la collection `/users/{userId}/temperatureMeasurements/`.
