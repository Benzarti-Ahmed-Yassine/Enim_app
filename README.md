# TempAlert - Precision Monitoring (Production)

Système de surveillance de température haute précision avec Dashboard Cloud et Alertes IA.

## 🔒 Accès & Sécurité
- **Mode Connexion Uniquement** : La création de compte publique est désactivée.
- **Gestion Admin** : Seul l'administrateur peut créer des accès via la [Console Firebase > Authentication](https://console.firebase.google.com/).

## 🔌 Intégration Hardware (Arduino / ESP32)
Le dashboard est conçu pour afficher les données envoyées par vos capteurs en temps réel via Firestore.

### 1. Configuration Arduino (Exemple ESP32)
Utilisez le code suivant pour envoyer vos données de température (via un capteur DS18B20 ou DHT22) directement à votre base de données :

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "VOTRE_WIFI";
const char* password = "VOTRE_MOT_DE_PASSE";

// Identifiants de votre projet
const String projectId = "studio-1892302408-8f785";
const String userId = "VOTRE_USER_UID_PROPRIETAIRE"; // Trouvez-le dans la console Auth
const String apiKey = "VOTRE_API_KEY";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi Connecté");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    // URL REST API pour Firestore
    String url = "https://firestore.googleapis.com/v1/projects/" + projectId + "/databases/(default)/documents/users/" + userId + "/temperatureMeasurements?key=" + apiKey;
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    float temp = 25.5 + random(0, 50) / 10.0; // Remplacez par votre lecture capteur reelle
    
    String json = "{\"fields\": {"
                  "\"ownerUserId\": {\"stringValue\": \"" + userId + "\"},"
                  "\"value\": {\"doubleValue\": " + String(temp) + "},"
                  "\"unit\": {\"stringValue\": \"Celsius\"},"
                  "\"timestamp\": {\"stringValue\": \"2024-05-20T12:00:00Z\"}" // Generer un ISO8601 dynamique si possible
                  "}}";

    int httpResponseCode = http.POST(json);
    Serial.print("HTTP Code: "); Serial.println(httpResponseCode);
    http.end();
  }
  delay(10000); // Envoi toutes les 10 secondes
}
```

## 🚀 Déploiement Cloud (App Hosting)
1. Poussez votre code sur GitHub.
2. Allez dans la [Console Firebase > App Hosting](https://console.firebase.google.com/).
3. Connectez votre dépôt.
4. Le lien public sera généré automatiquement à la fin du déploiement.

## 📧 Alertes IA
Configurez jusqu'à **5 e-mails** dans les paramètres. En cas de dépassement, une alerte rédigée par Gemini AI sera envoyée à tous les destinataires simultanément.
