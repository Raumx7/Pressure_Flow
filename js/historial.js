// historial.js
let sensorData = [];

// Función para obtener datos de la API
async function fetchSensorData(deviceId = '') {
    try {
        let url = 'api.php?action=sensor_data';
        if (deviceId) {
            url += `&device_id=${deviceId}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        return [];
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

// Función para formatear la fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()},${(date.getMonth() + 1).toString().padStart(2, '0')},${date.getDate().toString().padStart(2, '0')}`;
}

// Función para formatear la hora
function formatTime(dateString) {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
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

// Función para cargar datos y renderizar gráfico y tabla
async function loadHistorialData() {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id');
    
    if (!deviceId) {
        window.location.href = 'index.html';
        return;
    }
    
    sensorData = await fetchSensorData(deviceId);
    loadCurrentDevice(deviceId);
    renderChart();
    renderTable();
    
    const now = new Date();
    const lastUpdateElement = document.getElementById('lastUpdate');
    lastUpdateElement.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
}

// Función para renderizar el gráfico
function renderChart() {
    const ctx = document.getElementById('pressureChart').getContext('2d');
    
    // Filtrar datos del dispositivo actual
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id');
    const deviceData = sensorData.filter(reading => reading.device_id === deviceId);
    
    // Ordenar por fecha
    deviceData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    const labels = deviceData.map(reading => {
        const date = new Date(reading.created_at);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    });
    
    const values = deviceData.map(reading => reading.value);
    
    // Destruir gráfico anterior si existe
    if (window.pressureChartInstance) {
        window.pressureChartInstance.destroy();
    }
    
    window.pressureChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Presión (PSI)',
                data: values,
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Historial de Presión - ${deviceId}`
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'PSI'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hora'
                    }
                }
            }
        }
    });
}

// Función para renderizar la tabla
function renderTable() {
    const tableBody = document.getElementById('pressureTableBody');
    tableBody.innerHTML = '';

    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id');
    const deviceData = sensorData.filter(reading => reading.device_id === deviceId);
    
    // Ordenar por fecha descendente (más reciente primero)
    deviceData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    deviceData.forEach((reading, index) => {
        const row = document.createElement('tr');
        const statusClass = getStatusClass(reading.estatus);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${reading.value} PSI</td>
            <td><span class="${statusClass}">${reading.estatus}</span></td>
            <td>${formatDate(reading.created_at)}</td>
            <td>${formatTime(reading.created_at)}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    loadHistorialData();
    
    // Configurar actualización automática
    setInterval(loadHistorialData, 30000);
    
    // Botones de control de la gráfica
    const filterBtn = document.getElementById('filterBtn');
    const trendlineBtn = document.getElementById('trendlineBtn');
    
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            alert('Funcionalidad de filtro en desarrollo');
        });
    }
    
    if (trendlineBtn) {
        trendlineBtn.addEventListener('click', function() {
            alert('Funcionalidad de línea de tendencia en desarrollo');
        });
    }
    
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
                            <h3>Ayuda - Historial</h3>
                            <span class="close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="help-section">
                                <h4>Página de Historial</h4>
                                <p>Esta página muestra el historial de lecturas de presión del dispositivo seleccionado.</p>
                                
                                <div class="help-item">
                                    <strong>Gráfica de Presión:</strong>
                                    <p>La gráfica muestra la evolución de la presión a lo largo del tiempo. Puedes usar los controles para filtrar o ajustar la línea de tendencia.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Tabla de Registros:</strong>
                                    <p>La tabla muestra todas las lecturas de presión con su estatus, fecha y hora.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Recomendaciones:</strong>
                                    <p>El panel lateral proporciona recomendaciones para el mantenimiento y monitoreo del dispositivo.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Actualización Automática:</strong>
                                    <p>Los datos se actualizan automáticamente cada 30 segundos.</p>
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