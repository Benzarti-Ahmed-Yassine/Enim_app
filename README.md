# TempAlert - ENIM Monastir (Production)

Système de surveillance thermique haute précision pour les laboratoires de l'École Nationale d'Ingénieurs de Monastir.

## 🚀 Déploiement vers GitHub

```bash
git add .
git commit -m "Mise à jour configuration SMTP - Mot de passe actif"
git push
```

## 🌐 Configuration Production (Netlify/Render)

Variables d'environnement à configurer :
- `GOOGLE_GENAI_API_KEY` : [VOTRE_CLÉ_GEMINI]
- `EMAIL_USER` : `benzartiahmedyassine@gmail.com`
- `EMAIL_PASS` : `komg tkjt ezia ryoq`

## 🛡️ Sécurité
Le système utilise désormais le mot de passe d'application Google sécurisé de 16 caractères pour l'envoi des alertes.
