
# TempAlert - Precision Monitoring (Production ENIM)

Système de surveillance de température haute précision avec Dashboard Cloud et Alertes IA.

## 🔒 Accès & Sécurité
- **Mode Connexion Uniquement** : La création de compte publique est désactivée.
- **Gestion Admin** : Seul l'administrateur peut créer des accès via la [Console Firebase > Authentication](https://console.firebase.google.com/).

## 🤖 Activation de l'IA (Genkit)
Ce projet utilise **Google AI Studio (Gemini)**. 
- **Coût** : L'utilisation est gratuite via le "Free Tier" de Google (pas de charge monétaire).
- **Configuration** : Pour que le système d'alerte IA fonctionne après le déploiement (sur Render, Vercel ou App Hosting) :
  1. Générez une clé API sur [Google AI Studio](https://aistudio.google.com/).
  2. Ajoutez une variable d'environnement dans votre plateforme de déploiement :
     - **Nom** : `GOOGLE_GENAI_API_KEY`
     - **Valeur** : *Votre_Clé_API*

## 🔌 Intégration Hardware (Arduino / ESP32)
Le dashboard affiche les données envoyées par vos capteurs en temps réel via Firestore. **Aucune donnée n'est générée aléatoirement par l'application.**

### 1. Configuration Arduino (Exemple ESP32)
Utilisez le code suivant pour envoyer vos données :

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "VOTRE_WIFI";
const char* password = "VOTRE_MOT_DE_PASSE";

// --- CONFIGURATION FIREBASE ---
const String projectId = "studio-1892302408-8f785";
const String userId = "VOTRE_USER_UID"; // Trouvez l'UID dans Firebase Console > Auth > Users
const String apiKey = "AIzaSyAfe1yAsHi5gHCxDPPk0tJyP-Y5D7KBF28";   

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    // URL pointant vers votre collection Firestore spécifique
    String url = "https://firestore.googleapis.com/v1/projects/" + projectId + "/databases/(default)/documents/users/" + userId + "/temperatureMeasurements?key=" + apiKey;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    float temp = 22.0 + random(0, 100) / 10.0; 
    String json = "{\"fields\": {"
                  "\"ownerUserId\": {\"stringValue\": \"" + userId + "\"},"
                  "\"value\": {\"doubleValue\": " + String(temp) + "},"
                  "\"unit\": {\"stringValue\": \"Celsius\"},"
                  "\"timestamp\": {\"stringValue\": \"2024-05-20T12:00:00Z\"}" 
                  "}}";

    int httpResponseCode = http.POST(json);
    http.end();
  }
  delay(10000); 
}
```

## 🚀 Déploiement
1. Poussez votre code sur GitHub.
2. Connectez votre dépôt à Render ou Firebase App Hosting.
3. Configurez les variables d'environnement (Firebase Config + Clé IA).
