# TempAlert - Precision Monitoring (Production ENIM)

Système de surveillance de température haute précision avec Dashboard Cloud et Alertes IA.

## 🔒 Sécurité & GitHub
**Ne partagez jamais votre fichier `.env` ou vos secrets sur GitHub.** 
Ce projet utilise des variables d'environnement pour protéger vos clés. Le fichier `configuration-render.txt` contient le récapitulatif des variables à configurer.

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