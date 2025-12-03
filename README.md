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
## Creación de la base de datos
```sql
CREATE DATABASE esp32_001;
USE  esp32_001;
```
## Cración de las tablas api_tokens y sensor_data
```sql
CREATE TABLE api_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);
```
```sql
CREATE TABLE sensor_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    sensor_type VARCHAR(50) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    estatus VARCHAR(50) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_id (device_id),
    INDEX idx_categoria (categoria),
    INDEX idx_created_at (created_at)
);
```
## Inserciones sobre api_tokens;
Primero creamos una variable llamada TOKEN a la cual se le asigna 'esp32_' seguido de una cadena aleatoria generada por openssl (genera n bytes aleatorios y los imprime en formato hexadecimal). De esta forma tenemos un token útil y único para autenticar nuestro dispositivo con ayuda de nuestra API.
```
[root@monitor api]# TOKEN="esp32_$(openssl rand -hex 24)"
[root@monitor api]# echo $TOKEN
```
```sql
INSERT INTO api_tokens (token, description, expires_at) VALUES ('$TOKEN', 'Automated ESP32 Token', DATE_ADD(NOW(), INTERVAL 365 DAY));
```
## Inserciones sobre sensor_data
```sql
INSERT INTO sensor_data (device_id, sensor_type, value, estatus, categoria, created_at) VALUES
-- ESP32_001 (industrial) - 20 registros
('ESP32_001', 'presion', 72.4, 'Muy Baja', 'industrial', '2025-11-11 16:30:10'),
('ESP32_001', 'presion', 98.6, 'Muy Baja', 'industrial', '2025-11-11 16:30:40'),
('ESP32_001', 'presion', 121.3, 'Baja', 'industrial', '2025-11-11 16:31:10'),
('ESP32_001', 'presion', 133.4, 'Baja', 'industrial', '2025-11-11 16:32:00'),
('ESP32_001', 'presion', 148.7, 'Normal', 'industrial', '2025-11-11 16:33:20'),
('ESP32_001', 'presion', 157.9, 'Normal', 'industrial', '2025-11-11 16:34:05'),
('ESP32_001', 'presion', 167.1, 'Alta', 'industrial', '2025-11-11 16:35:12'),
('ESP32_001', 'presion', 172.8, 'Alta', 'industrial', '2025-11-11 16:36:40'),
('ESP32_001', 'presion', 181.6, 'Muy Alta', 'industrial', '2025-11-11 16:37:15'),
('ESP32_001', 'presion', 189.2, 'Muy Alta', 'industrial', '2025-11-11 16:38:05'),
('ESP32_001', 'presion', 195.7, 'Muy Alta', 'industrial', '2025-11-11 16:39:50'),
('ESP32_001', 'presion', 43.9, 'Muy Baja', 'industrial', '2025-11-11 16:40:25'),
('ESP32_001', 'presion', 89.3, 'Muy Baja', 'industrial', '2025-11-11 16:41:10'),
('ESP32_001', 'presion', 112.4, 'Baja', 'industrial', '2025-11-11 16:42:05'),
('ESP32_001', 'presion', 139.7, 'Normal', 'industrial', '2025-11-11 16:43:00'),
('ESP32_001', 'presion', 154.8, 'Normal', 'industrial', '2025-11-11 16:44:15'),
('ESP32_001', 'presion', 168.3, 'Alta', 'industrial', '2025-11-11 16:45:05'),
('ESP32_001', 'presion', 179.5, 'Alta', 'industrial', '2025-11-11 16:46:00'),
('ESP32_001', 'presion', 188.6, 'Muy Alta', 'industrial', '2025-11-11 16:47:00'),
('ESP32_001', 'presion', 95.1, 'Muy Baja', 'industrial', '2025-11-11 16:48:00'),

-- ESP32_002 (domestico) - 20 registros
('ESP32_002', 'presion', 55.3, 'Muy Baja', 'domestico', '2025-11-11 16:49:00'),
('ESP32_002', 'presion', 87.5, 'Muy Baja', 'domestico', '2025-11-11 16:49:45'),
('ESP32_002', 'presion', 101.8, 'Baja', 'domestico', '2025-11-11 16:50:20'),
('ESP32_002', 'presion', 115.6, 'Baja', 'domestico', '2025-11-11 16:51:10'),
('ESP32_002', 'presion', 138.3, 'Normal', 'domestico', '2025-11-11 16:52:00'),
('ESP32_002', 'presion', 149.8, 'Normal', 'domestico', '2025-11-11 16:52:50'),
('ESP32_002', 'presion', 162.5, 'Normal', 'domestico', '2025-11-11 16:53:30'),
('ESP32_002', 'presion', 168.7, 'Alta', 'domestico', '2025-11-11 16:54:05'),
('ESP32_002', 'presion', 173.4, 'Alta', 'domestico', '2025-11-11 16:55:00'),
('ESP32_002', 'presion', 182.9, 'Muy Alta', 'domestico', '2025-11-11 16:55:40'),
('ESP32_002', 'presion', 188.1, 'Muy Alta', 'domestico', '2025-11-11 16:56:20'),
('ESP32_002', 'presion', 194.6, 'Muy Alta', 'domestico', '2025-11-11 16:57:00'),
('ESP32_002', 'presion', 63.2, 'Muy Baja', 'domestico', '2025-11-11 16:57:40'),
('ESP32_002', 'presion', 90.4, 'Muy Baja', 'domestico', '2025-11-11 16:58:30'),
('ESP32_002', 'presion', 108.9, 'Baja', 'domestico', '2025-11-11 16:59:10'),
('ESP32_002', 'presion', 130.7, 'Normal', 'domestico', '2025-11-11 17:00:00'),
('ESP32_002', 'presion', 147.5, 'Normal', 'domestico', '2025-11-11 17:01:00'),
('ESP32_002', 'presion', 159.3, 'Alta', 'domestico', '2025-11-11 17:02:00'),
('ESP32_002', 'presion', 177.4, 'Alta', 'domestico', '2025-11-11 17:03:00'),
('ESP32_002', 'presion', 105.2, 'Baja', 'domestico', '2025-11-11 17:04:00'),

-- ESP32_003 (automotriz) - 20 registros
('ESP32_003', 'presion', 92.4, 'Muy Baja', 'automotriz', '2025-11-11 17:05:00'),
('ESP32_003', 'presion', 104.3, 'Baja', 'automotriz', '2025-11-11 17:05:50'),
('ESP32_003', 'presion', 129.9, 'Baja', 'automotriz', '2025-11-11 17:06:30'),
('ESP32_003', 'presion', 140.2, 'Normal', 'automotriz', '2025-11-11 17:07:10'),
('ESP32_003', 'presion', 152.7, 'Normal', 'automotriz', '2025-11-11 17:08:10'),
('ESP32_003', 'presion', 164.1, 'Normal', 'automotriz', '2025-11-11 17:09:10'),
('ESP32_003', 'presion', 171.5, 'Alta', 'automotriz', '2025-11-11 17:10:10'),
('ESP32_003', 'presion', 174.2, 'Alta', 'automotriz', '2025-11-11 17:11:00'),
('ESP32_003', 'presion', 183.7, 'Muy Alta', 'automotriz', '2025-11-11 17:11:50'),
('ESP32_003', 'presion', 191.4, 'Muy Alta', 'automotriz', '2025-11-11 17:12:40'),
('ESP32_003', 'presion', 197.8, 'Muy Alta', 'automotriz', '2025-11-11 17:13:30'),
('ESP32_003', 'presion', 85.6, 'Muy Baja', 'automotriz', '2025-11-11 17:14:30'),
('ESP32_003', 'presion', 99.4, 'Baja', 'automotriz', '2025-11-11 17:15:20'),
('ESP32_003', 'presion', 118.8, 'Baja', 'automotriz', '2025-11-11 17:16:00'),
('ESP32_003', 'presion', 136.5, 'Normal', 'automotriz', '2025-11-11 17:17:00'),
('ESP32_003', 'presion', 149.2, 'Normal', 'automotriz', '2025-11-11 17:18:00'),
('ESP32_003', 'presion', 160.4, 'Alta', 'automotriz', '2025-11-11 17:19:00'),
('ESP32_003', 'presion', 172.9, 'Alta', 'automotriz', '2025-11-11 17:20:00'),
('ESP32_003', 'presion', 185.7, 'Muy Alta', 'automotriz', '2025-11-11 17:21:00'),
('ESP32_003', 'presion', 140.3, 'Normal', 'automotriz', '2025-11-11 17:22:00'),

-- ESP32_004 (refrigeracion) - 20 registros
('ESP32_004', 'presion', 48.2, 'Muy Baja', 'refrigeracion', '2025-11-11 17:23:00'),
('ESP32_004', 'presion', 76.5, 'Muy Baja', 'refrigeracion', '2025-11-11 17:23:40'),
('ESP32_004', 'presion', 113.7, 'Baja', 'refrigeracion', '2025-11-11 17:24:20'),
('ESP32_004', 'presion', 132.8, 'Baja', 'refrigeracion', '2025-11-11 17:25:10'),
('ESP32_004', 'presion', 145.9, 'Normal', 'refrigeracion', '2025-11-11 17:26:00'),
('ESP32_004', 'presion', 159.4, 'Normal', 'refrigeracion', '2025-11-11 17:27:00'),
('ESP32_004', 'presion', 166.7, 'Alta', 'refrigeracion', '2025-11-11 17:28:00'),
('ESP32_004', 'presion', 173.1, 'Alta', 'refrigeracion', '2025-11-11 17:29:00'),
('ESP32_004', 'presion', 181.4, 'Muy Alta', 'refrigeracion', '2025-11-11 17:30:00'),
('ESP32_004', 'presion', 187.9, 'Muy Alta', 'refrigeracion', '2025-11-11 17:31:00'),
('ESP32_004', 'presion', 194.2, 'Muy Alta', 'refrigeracion', '2025-11-11 17:32:00'),
('ESP32_004', 'presion', 69.3, 'Muy Baja', 'refrigeracion', '2025-11-11 17:33:00'),
('ESP32_004', 'presion', 83.2, 'Muy Baja', 'refrigeracion', '2025-11-11 17:34:00'),
('ESP32_004', 'presion', 108.5, 'Baja', 'refrigeracion', '2025-11-11 17:35:00'),
('ESP32_004', 'presion', 127.9, 'Baja', 'refrigeracion', '2025-11-11 17:36:00'),
('ESP32_004', 'presion', 142.6, 'Normal', 'refrigeracion', '2025-11-11 17:37:00'),
('ESP32_004', 'presion', 155.3, 'Normal', 'refrigeracion', '2025-11-11 17:38:00'),
('ESP32_004', 'presion', 168.9, 'Alta', 'refrigeracion', '2025-11-11 17:39:00'),
('ESP32_004', 'presion', 178.4, 'Alta', 'refrigeracion', '2025-11-11 17:40:00'),
('ESP32_004', 'presion', 160.7, 'Alta', 'refrigeracion', '2025-11-11 17:41:00');
```


