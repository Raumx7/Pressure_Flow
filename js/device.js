// device.js
let sensorData = [];
let alertData = {};

// Función para obtener datos de la API
async function fetchSensorData() {
    try {
        const response = await fetch('api.php?action=sensor_data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        return [];
    }
}

// Función para obtener alertas
async function fetchAlerts() {
    try {
        const response = await fetch('api.php?action=alerts');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
    }
}

// Función para cargar todos los datos
async function loadAllData() {
    sensorData = await fetchSensorData();
    const alerts = await fetchAlerts();
    
    // Convertir alertas a formato por dispositivo
    alertData = {};
    alerts.forEach(alert => {
        const deviceMatch = alert.title.match(/(ESP32_\d+)/);
        if (deviceMatch) {
            const deviceId = deviceMatch[1];
            if (!alertData[deviceId]) {
                alertData[deviceId] = [];
            }
            alertData[deviceId].push(alert);
        }
    });
}

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

// Función para actualizar el manómetro
function updateGauge(pressure) {
    const gaugeNeedle = document.getElementById('gaugeNeedle');
    const gaugeValue = document.getElementById('gaugeValue');
    
    // Calcular la rotación basada en los nuevos rangos (0-580 PSI)
    // El manómetro tiene 360 grados
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

// Función para cargar el nombre del dispositivo actual en el sidebar
function loadCurrentDevice(deviceId) {
    const currentDeviceBtn = document.getElementById('currentDeviceBtn');
    const currentDeviceName = document.getElementById('currentDeviceName');
    
    if (currentDeviceBtn && currentDeviceName) {
        currentDeviceName.textContent = deviceId;
        currentDeviceBtn.href = `device.html?device_id=${deviceId}`;
    }
    
    // Actualizar el enlace de historial con el device_id
    const historialLink = document.getElementById('historialLink');
    if (historialLink) {
        historialLink.href = `historial.html?device_id=${deviceId}`;
    }
}

// Función para cargar los datos del dispositivo
async function loadDeviceData() {
    await loadAllData();
    
    // Obtener el device_id de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id');
    
    if (!deviceId) {
        // Redirigir a index.html si no hay device_id
        window.location.href = 'index.html';
        return;
    }
    
    // Cargar el nombre del dispositivo en el sidebar
    loadCurrentDevice(deviceId);
    
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
async function simulateDataUpdate() {
    await loadAllData();
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id');
    const deviceData = getLatestDeviceData(deviceId);
    
    if (deviceData) {
        updateGauge(deviceData.value);
        
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const statusClass = getStatusColor(deviceData.value);
        const statusDisplayText = getStatusText(deviceData.value);
        
        statusIndicator.className = `status-indicator ${statusClass}`;
        statusText.textContent = statusDisplayText;
        
        // Actualizar última hora de actualización
        const now = new Date();
        const lastUpdateElement = document.getElementById('lastUpdate');
        lastUpdateElement.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Cargar los datos del dispositivo
    loadDeviceData();
    
    // Configurar la actualización automática cada 30 segundos
    setInterval(simulateDataUpdate, 30000);
    
    // Botón de ayuda
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
            // Crear modal de ayuda si no existe
            let helpModal = document.getElementById('helpModal');
            if (!helpModal) {
                helpModal = document.createElement('div');
                helpModal.id = 'helpModal';
                helpModal.className = 'modal';
                helpModal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Ayuda - Dispositivo</h3>
                            <span class="close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="help-section">
                                <h4>Página de Dispositivo</h4>
                                <p>Esta página muestra información detallada del dispositivo seleccionado.</p>
                                
                                <div class="help-item">
                                    <strong>Manómetro:</strong>
                                    <p>El manómetro muestra la presión actual en PSI con colores que indican el estado:</p>
                                    <ul>
                                        <li><span style="color: #e74c3c">● Rojo:</span> Falla (muy baja o muy alta)</li>
                                        <li><span style="color: #FFD900">● Amarillo:</span> Presión baja o alta</li>
                                        <li><span style="color: #2ecc71">● Verde:</span> Presión normal</li>
                                    </ul>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Información del Dispositivo:</strong>
                                    <p>Muestra detalles técnicos como ID del dispositivo, tipo de sensor, última medición y categoría.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Alertas:</strong>
                                    <p>El panel lateral muestra alertas específicas para este dispositivo.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Navegación:</strong>
                                    <p>Usa el menú lateral para ir al Historial o buscar Reparaciones.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(helpModal);

                // Añadir funcionalidad para cerrar el modal
                const closeBtn = helpModal.querySelector('.close');
                closeBtn.addEventListener('click', function() {
                    helpModal.style.display = 'none';
                });

                // Cerrar modal al hacer clic fuera
                window.addEventListener('click', function(event) {
                    if (event.target === helpModal) {
                        helpModal.style.display = 'none';
                    }
                });
            }

            helpModal.style.display = 'block';
        });
    }
});