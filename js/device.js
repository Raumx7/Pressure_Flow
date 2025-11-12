// Datos de ejemplo proporcionados (mismos que en index.html)
const sensorData = [
    {
        "id": 1,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 70.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "automotriz"
    },
    {
        "id": 2,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 100.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "automotriz"
    },
    {
        "id": 3,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 167.0,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "automotriz"
    },
    {
        "id": 4,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 50.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "automotriz"
    },
    {
        "id": 1,
        "device_id": "ESP32_002",
        "sensor_type": "presion",
        "value": 70.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "domestico"
    },
    {
        "id": 2,
        "device_id": "ESP32_002",
        "sensor_type": "presion",
        "value": 100.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "domestico"
    },
    {
        "id": 3,
        "device_id": "ESP32_002",
        "sensor_type": "presion",
        "value": 167.0,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "domestico"
    },
    {
        "id": 4,
        "device_id": "ESP32_002",
        "sensor_type": "presion",
        "value": 180.5,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "domestico"
    },
    {
        "id": 1,
        "device_id": "ESP32_003",
        "sensor_type": "presion",
        "value": 70.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "industrial"
    },
    {
        "id": 2,
        "device_id": "ESP32_003",
        "sensor_type": "presion",
        "value": 100.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "industrial"
    },
    {
        "id": 3,
        "device_id": "ESP32_003",
        "sensor_type": "presion",
        "value": 167.0,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "industrial"
    },
    {
        "id": 4,
        "device_id": "ESP32_003",
        "sensor_type": "presion",
        "value": 300.7,
        "estatus": "Alta",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "industrial"
    },
    {
        "id": 1,
        "device_id": "ESP32_004",
        "sensor_type": "presion",
        "value": 70.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "refrigeracion"
    },
    {
        "id": 2,
        "device_id": "ESP32_004",
        "sensor_type": "presion",
        "value": 100.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "refrigeracion"
    },
    {
        "id": 3,
        "device_id": "ESP32_004",
        "sensor_type": "presion",
        "value": 167.0,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "refrigeracion"
    },
    {
        "id": 4,
        "device_id": "ESP32_004",
        "sensor_type": "presion",
        "value": 15.2,
        "estatus": "Falla Baja",
        "created_at": "2025-11-11 16:21:45",
        "categoria": "refrigeracion"
    }
];

// Alertas específicas por dispositivo
const alertData = {
    "ESP32_001": [
        {
            id: 1,
            title: "Presión Baja",
            message: "La presión está por debajo del rango normal",
            type: "warning",
            time: "2025-11-11 16:21:45"
        }
    ],
    "ESP32_002": [
        {
            id: 1,
            title: "Funcionamiento Normal",
            message: "El dispositivo está operando dentro de los parámetros normales",
            type: "info",
            time: "2025-11-11 16:21:45"
        }
    ],
    "ESP32_003": [
        {
            id: 1,
            title: "Presión Alta",
            message: "La presión está por encima del rango normal",
            type: "warning",
            time: "2025-11-11 16:21:45"
        }
    ],
    "ESP32_004": [
        {
            id: 1,
            title: "Falla Baja",
            message: "El dispositivo ha detectado una presión anormalmente baja",
            type: "critical",
            time: "2025-11-11 16:21:45"
        }
    ]
};

// Función para obtener el último registro de un dispositivo
function getLatestDeviceData(deviceId) {
    const deviceReadings = sensorData.filter(reading => reading.device_id === deviceId);
    if (deviceReadings.length === 0) return null;
    
    // Ordenar por ID descendente y tomar el primero (mayor ID)
    deviceReadings.sort((a, b) => b.id - a.id);
    return deviceReadings[0];
}

// Función para obtener la clase CSS según el estado
function getStatusClass(estatus) {
    const statusMap = {
        "Baja": "status-baja",
        "Normal": "status-normal",
        "Alta": "status-alta",
        "Falla Baja": "status-falla-baja",
        "Falla Alta": "status-falla-alta"
    };
    return statusMap[estatus] || "status-normal";
}

// Función para obtener el nombre de la categoría
function getCategoryName(category) {
    const categoryMap = {
        "automotriz": "Automotriz",
        "domestico": "Doméstico",
        "industrial": "Industrial",
        "refrigeracion": "Refrigeración"
    };
    return categoryMap[category] || category;
}

// Función para formatear la fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()},${(date.getMonth() + 1).toString().padStart(2, '0')},${date.getDate().toString().padStart(2, '0')}`;
}

// Función para actualizar el manómetro con los nuevos rangos
function updateGauge(pressure) {
    const gaugeNeedle = document.getElementById('gaugeNeedle');
    const gaugeValue = document.getElementById('gaugeValue');
    
    // Calcular la rotación basada en los nuevos rangos (0-580 PSI)
    // El manómetro tiene 360 grados, pero usamos 270 para el arco visible
    const maxPressure = 580;
    const rotation = (pressure / maxPressure) * 360;
    gaugeNeedle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
    gaugeValue.textContent = `${pressure} PSI`;
}

// Función para determinar el color del indicador de estatus basado en la presión
function getStatusColor(pressure) {
    if (pressure >= 0 && pressure < 25) {
        return "status-falla-baja";
    } else if (pressure >= 25 && pressure < 150) {
        return "status-baja";
    } else if (pressure >= 150 && pressure < 250) {
        return "status-normal";
    } else if (pressure >= 250 && pressure < 310) {
        return "status-alta";
    } else if (pressure >= 310 && pressure <= 580) {
        return "status-falla-alta";
    } else {
        return "status-normal";
    }
}

// Función para obtener el texto de estatus basado en la presión
function getStatusText(pressure) {
    if (pressure >= 0 && pressure < 25) {
        return "Falla Baja";
    } else if (pressure >= 25 && pressure < 150) {
        return "Baja";
    } else if (pressure >= 150 && pressure < 250) {
        return "Normal";
    } else if (pressure >= 250 && pressure < 310) {
        return "Alta";
    } else if (pressure >= 310 && pressure <= 580) {
        return "Falla Alta";
    } else {
        return "Desconocido";
    }
}

// Modificar la función loadDeviceData para usar las nuevas funciones
function loadDeviceData() {
    // Obtener el device_id de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id');
    
    if (!deviceId) {
        // Redirigir a index.html si no hay device_id
        window.location.href = 'index.html';
        return;
    }
    
    // Obtener el último registro del dispositivo
    const deviceData = getLatestDeviceData(deviceId);
    
    if (!deviceData) {
        // Redirigir a index.html si no se encuentra el dispositivo
        window.location.href = 'index.html';
        return;
    }
    
    // Actualizar el título y header
    document.getElementById('deviceHeader').textContent = `${deviceData.device_id} _ ${getCategoryName(deviceData.categoria)}`;
    document.getElementById('deviceTitle').textContent = `Estatus del sistema de ${getCategoryName(deviceData.categoria).toLowerCase()}`;
    
    // Actualizar el fondo según la categoría
    const mainContent = document.getElementById('mainContent');
    mainContent.className = `content ${deviceData.categoria}`;
    
    // Actualizar el manómetro
    updateGauge(deviceData.value);
    
    // Actualizar el indicador de estatus basado en la presión
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const statusClass = getStatusColor(deviceData.value);
    const statusDisplayText = getStatusText(deviceData.value);
    
    statusIndicator.className = `status-indicator ${statusClass}`;
    statusText.textContent = statusDisplayText;
    
    // El resto de la función permanece igual...
    // Actualizar la información del dispositivo
    const deviceInfo = document.getElementById('deviceInfo');
    deviceInfo.innerHTML = `
        <div class="device-info-row">
            <span class="device-info-label">Device ID:</span>
            <span class="device-info-value">${deviceData.device_id}</span>
        </div>
        <div class="device-info-row">
            <span class="device-info-label">Tipo de Sensor:</span>
            <span class="device-info-value">${deviceData.sensor_type}</span>
        </div>
        <div class="device-info-row">
            <span class="device-info-label">Última Medición:</span>
            <span class="device-info-value">${deviceData.value} PSI</span>
        </div>
        <div class="device-info-row">
            <span class="device-info-label">Estatus:</span>
            <span class="device-info-value">${statusDisplayText}</span>
        </div>
        <div class="device-info-row">
            <span class="device-info-label">Último Registro:</span>
            <span class="device-info-value">${formatDate(deviceData.created_at)}</span>
        </div>
        <div class="device-info-row">
            <span class="device-info-label">Categoría:</span>
            <span class="device-info-value">${getCategoryName(deviceData.categoria)}</span>
        </div>
    `;
    
    // Actualizar las alertas
    const alertsList = document.getElementById('alertsList');
    const deviceAlerts = alertData[deviceId] || [];
    
    if (deviceAlerts.length === 0) {
        alertsList.innerHTML = '<div class="no-alerts">No hay alertas para este dispositivo.</div>';
    } else {
        alertsList.innerHTML = '';
        deviceAlerts.forEach(alert => {
            const alertItem = document.createElement('div');
            alertItem.className = `alert-item ${alert.type}`;
            
            const iconClass = alert.type === 'critical' ? 'fa-exclamation-circle' : 
                             alert.type === 'warning' ? 'fa-exclamation-triangle' : 
                             'fa-info-circle';
            
            alertItem.innerHTML = `
                <div class="alert-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${alert.time}</div>
                </div>
            `;
            
            alertsList.appendChild(alertItem);
        });
    }
    
    // Actualizar la última hora de actualización
    const now = new Date();
    const lastUpdateElement = document.getElementById('lastUpdate');
    lastUpdateElement.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
}

// Función para simular actualización de datos
function simulateDataUpdate() {
    // En una implementación real, aquí se haría una llamada a la API
    // Por ahora, solo volvemos a cargar los datos
    loadDeviceData();
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Cargar los datos del dispositivo
    loadDeviceData();
    
    // Configurar la actualización automática cada 30 segundos
    setInterval(simulateDataUpdate, 30000);
    
    // Manejar el menú hamburguesa (para móviles)
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic fuera de él (para móviles)
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
});