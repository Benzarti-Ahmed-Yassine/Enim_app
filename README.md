# TempAlert - Precision Monitoring (Production ENIM)

Système de surveillance de température haute précision avec Dashboard Cloud et Alertes IA.

## 🚀 Guide de Déploiement Rapide

L'application est configurée pour fonctionner sur **Render.com** ou **Vercel**.

### 1. Préparation du Code
- Assurez-vous que votre dépôt GitHub est à jour.
- Ne poussez **JAMAIS** votre fichier `.env` sur GitHub (il est déjà dans le `.gitignore`).

### 2. Configuration sur Render (Onglet Environment)
Ajoutez les variables suivantes dans le tableau de bord de votre service :

| Variable | Source / Valeur |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Console Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Console Firebase |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Console Firebase |
| `GOOGLE_GENAI_API_KEY` | [AI Studio](https://aistudio.google.com/) |
| `EMAIL_USER` | Votre Gmail |
| `EMAIL_PASS` | Mot de passe d'application Google |

### 3. Commandes de Build
Sur Render, utilisez ces paramètres :
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`

## 🛡️ Sécurité Institutionnelle
L'application utilise le mode **Strict Environment**. Si une clé est manquante en production, le système se verrouille automatiquement pour protéger l'infrastructure de l'ENIM.

## 🤖 Intelligence Artificielle
Le moteur **Gemini 2.5 Flash** analyse les dépassements de seuils pour générer des rapports d'incidents formels envoyés par e-mail aux responsables de laboratoire.