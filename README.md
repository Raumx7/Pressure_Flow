# Pressure_Flow
Proyecto final de moniroreo de presión en tiempo real, aquí se encuentra la estructura de cada parte del sistema IOT.
## Código utilizado en el ESP32 para medir presión y mandar los datos al servidor
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// -------------------- CONFIGURACIÓN WiFi --------------------
const char* ssid = "Simulacion_IOT";
const char* password = "PruebasIOT";

// -------------------- CONFIGURACIÓN API --------------------
const char* serverURL = "https://tec1.rmcnet.com.mx/api/data.php";
const char* apiToken = "esp32_2f185927040cf528ac8be1b3c6c084ae4cc150663b1f9f16";
const char* rootCACertificate = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIFBjCCAu6gAwIBAgIRAMISMktwqbSRcdxA9+KFJjwwDQYJKoZIhvcNAQELBQAw\n" \
"...(certificado completo)...\n" \
"-----END CERTIFICATE-----\n";

// -------------------- PINES --------------------
const int potPin = 34;  
const int ledRojo = 14;
const int ledAmarillo = 12;
const int ledVerde = 13;
const int ledWifi = 21;
const int ledUpload = 5;

// -------------------- CONSTANTES --------------------
const int ADC_MIN = 1530;
const int ADC_MAX = 4095;
const float PRESION_MAX = 200.0;

// -------------------- VARIABLES GLOBALES --------------------
unsigned long lastReconnectAttempt = 0;
const unsigned long RECONNECT_INTERVAL = 10000; // 10 segundos
bool wifiConnecting = false;

// -------------------- FUNCIONES --------------------

String obtenerEstatus(float presion) {
  if (presion < 100) return "Muy Baja";
  if (presion < 135) return "Baja";
  if (presion < 165) return "Normal";
  if (presion < 180) return "Alta";
  return "Muy Alta";
}

void controlarLEDsPresion(String estatus) {
  digitalWrite(ledRojo, LOW);
  digitalWrite(ledAmarillo, LOW);
  digitalWrite(ledVerde, LOW);
  
  if (estatus == "Muy Baja" || estatus == "Muy Alta") {
    digitalWrite(ledRojo, HIGH);
  } else if (estatus == "Baja" || estatus == "Alta") {
    digitalWrite(ledAmarillo, HIGH);
  } else if (estatus == "Normal") {
    digitalWrite(ledVerde, HIGH);
  }
}

void reconectarWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    unsigned long currentTime = millis();

    if (currentTime - lastReconnectAttempt >= RECONNECT_INTERVAL) {
      Serial.println("WiFi desconectado. Intentando reconectar...");
      wifiConnecting = true;
      lastReconnectAttempt = currentTime;
      
      WiFi.reconnect();
    }

    if (wifiConnecting) {
      digitalWrite(ledWifi, !digitalRead(ledWifi));

      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("WiFi reconectado!");
        digitalWrite(ledWifi, HIGH);
        wifiConnecting = false;
      }
    }
  }
}

void sendDataToServer(float presion, String estatus) {
  WiFiClientSecure client;
  HTTPClient http;

  client.setCACert(rootCACertificate);
  http.begin(client, serverURL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(apiToken));

  DynamicJsonDocument doc(512);
  doc["device_id"]  = "ESP32_001";
  doc["sensor_type"] = "presion";
  doc["value"] = presion;
  doc["estatus"] = estatus;
  doc["categoria"] = "industrial";

  String jsonData;
  serializeJson(doc, jsonData);

  int httpResponseCode = http.POST(jsonData);

  if (httpResponseCode == HTTP_CODE_OK) {
    Serial.println("===== DATOS ENVIADOS CON ÉXITO! =====");
    digitalWrite(ledUpload, HIGH);
    delay(2000);
    digitalWrite(ledUpload, LOW);
  } else {
    Serial.printf("===== ERROR AL ENVIAR DATOS\nCÓDIGO: %d =====\n", httpResponseCode);
  }

  http.end();
}

float calcularPresion(int valorADC) {
  return PRESION_MAX / (ADC_MAX - ADC_MIN) * (valorADC - ADC_MIN);
}

// -------------------- SETUP --------------------
void setup() {
  Serial.begin(115200);

  pinMode(ledRojo, OUTPUT);
  pinMode(ledAmarillo, OUTPUT);
  pinMode(ledVerde, OUTPUT);
  pinMode(ledWifi, OUTPUT);
  pinMode(ledUpload, OUTPUT);

  digitalWrite(ledRojo, LOW);
  digitalWrite(ledAmarillo, LOW);
  digitalWrite(ledVerde, LOW);
  digitalWrite(ledWifi, LOW);
  digitalWrite(ledUpload, LOW);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(ledWifi, HIGH);
    delay(500);
    digitalWrite(ledWifi, LOW);
    delay(1000);
    Serial.print(".");
  }

  Serial.println("\nWiFi conectado!");
  digitalWrite(ledWifi, HIGH);
}

// -------------------- LOOP --------------------
int contsec = 0;

void loop() {
  reconectarWiFi();

  int valorADC = analogRead(potPin);
  float presion = calcularPresion(valorADC);
  String estatus = obtenerEstatus(presion);

  Serial.printf("ADC: %d | Presión: %.1f psi | Estatus: %s\n",
    valorADC, presion, estatus.c_str());

  controlarLEDsPresion(estatus);

  if (WiFi.status() == WL_CONNECTED) {
    if (contsec >= 60) {
      sendDataToServer(presion, estatus);
      contsec = 0;
    }
  } else {
    Serial.println("Sin conexión WiFi - No se puede enviar datos");
  }

  contsec++;
  delay(1000);
}
```

