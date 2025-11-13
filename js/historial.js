// Datos de ejemplo para el historial (últimos 10 registros)
const historialData = [
    {
        "id": 1,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 70.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:22:45",
        "categoria": "automotriz"
    },
    {
        "id": 2,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 100.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:23:45",
        "categoria": "automotriz"
    },
    {
        "id": 3,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 167.0,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:24:45",
        "categoria": "automotriz"
    },
    {
        "id": 4,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 50.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:25:45",
        "categoria": "automotriz"
    },
    {
        "id": 5,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 180.0,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:26:45",
        "categoria": "automotriz"
    },
    {
        "id": 6,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 200.0,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:27:45",
        "categoria": "automotriz"
    },
    {
        "id": 7,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 220.0,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:28:45",
        "categoria": "automotriz"
    },
    {
        "id": 8,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 280.0,
        "estatus": "Alta",
        "created_at": "2025-11-11 16:29:45",
        "categoria": "automotriz"
    },
    {
        "id": 9,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 320.0,
        "estatus": "Falla Alta",
        "created_at": "2025-11-11 16:30:45",
        "categoria": "automotriz"
    },
    {
        "id": 10,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 15.0,
        "estatus": "Falla Baja",
        "created_at": "2025-11-11 16:31:45",
        "categoria": "automotriz"
    }
];

// Variables globales
let pressureChart;
let showTrendline = false;

// Función para formatear fecha (YYYY/MM/DD)
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
}

// Función para formatear hora (HH:MM:SS)
function formatTime(dateString) {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}

// Función para obtener el color según el estatus
function getStatusColor(estatus) {
    const colorMap = {
        "Baja": "#f39c12",
        "Normal": "#2ecc71",
        "Alta": "#f39c12",
        "Falla Baja": "#e74c3c",
        "Falla Alta": "#e74c3c"
    };
    return colorMap[estatus] || "#95a5a6";
}

// Función para calcular la línea de tendencia
function calculateTrendline(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    data.forEach((point, index) => {
        sumX += index;
        sumY += point;
        sumXY += index * point;
        sumX2 += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((_, index) => intercept + slope * index);
}

// Función para crear la gráfica
function createChart() {
    const ctx = document.getElementById('pressureChart').getContext('2d');

    // Preparar datos
    const labels = historialData.map(item => formatTime(item.created_at));
    const pressures = historialData.map(item => item.value);
    const statusColors = historialData.map(item => getStatusColor(item.estatus));

    // Calcular línea de tendencia si está activa
    const trendlineData = showTrendline ? calculateTrendline(pressures) : [];

    // Configuración de la gráfica
    const chartConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Presión (PSI)',
                    data: pressures,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: statusColors,
                    pointBorderColor: '#2c3e50',
                    pointBorderWidth: 1,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Historial de Presiones - Últimos 10 Registros',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Presión: ${context.parsed.y} PSI`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Hora'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Presión (PSI)'
                    },
                    min: 0,
                    max: 350,
                    grid: {
                        color: function(context) {
                            // Crear regiones de color para los rangos de presión
                            if (context.tick.value >= 0 && context.tick.value < 25) {
                                return 'rgba(231, 76, 60, 0.2)'; // Falla Baja
                            } else if (context.tick.value >= 25 && context.tick.value < 150) {
                                return 'rgba(243, 156, 18, 0.2)'; // Baja
                            } else if (context.tick.value >= 150 && context.tick.value < 250) {
                                return 'rgba(46, 204, 113, 0.2)'; // Normal
                            } else if (context.tick.value >= 250 && context.tick.value < 310) {
                                return 'rgba(243, 156, 18, 0.2)'; // Alta
                            } else if (context.tick.value >= 310) {
                                return 'rgba(231, 76, 60, 0.2)'; // Falla Alta
                            }
                            return 'rgba(0, 0, 0, 0.1)';
                        }
                    }
                }
            }
        }
    };

    // Añadir línea de tendencia si está activa
    if (showTrendline) {
        chartConfig.data.datasets.push({
            label: 'Línea de Tendencia',
            data: trendlineData,
            borderColor: '#e74c3c',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0
        });
    }

    // Crear o actualizar la gráfica
    if (pressureChart) {
        pressureChart.destroy();
    }
    pressureChart = new Chart(ctx, chartConfig);
}

// Función para cargar la tabla
function loadTable() {
    const tableBody = document.getElementById('pressureTableBody');
    tableBody.innerHTML = '';

    historialData.forEach(item => {
        const row = document.createElement('tr');
        const statusClass = `status-${item.estatus.toLowerCase().replace(' ', '-')}`;

        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.value}</td>
            <td class="${statusClass}">${item.estatus}</td>
            <td>${formatDate(item.created_at)}</td>
            <td>${formatTime(item.created_at)}</td>
        `;

        tableBody.appendChild(row);
    });
}

// Función para cargar el nombre del dispositivo actual
function loadCurrentDevice() {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id') || 'ESP32_001';

    const currentDeviceBtn = document.getElementById('currentDeviceBtn');
    const currentDeviceName = document.getElementById('currentDeviceName');

    currentDeviceName.textContent = deviceId;
    currentDeviceBtn.href = `device.html?device_id=${deviceId}`;
}

// Función para inicializar la página
function initializePage() {
    loadCurrentDevice();
    createChart();
    loadTable();

    // Actualizar la última hora de actualización
    const now = new Date();
    const lastUpdateElement = document.getElementById('lastUpdate');
    lastUpdateElement.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializePage();

    // Manejar el botón de línea de tendencia
    const trendlineBtn = document.getElementById('trendlineBtn');
    if (trendlineBtn) {
        trendlineBtn.addEventListener('click', function() {
            showTrendline = !showTrendline;
            this.classList.toggle('active', showTrendline);
            createChart();
        });
    }

    // Manejar el botón de filtrar
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            // Crear modal de filtro
            let filterModal = document.getElementById('filterModal');
            if (!filterModal) {
                filterModal = document.createElement('div');
                filterModal.id = 'filterModal';
                filterModal.className = 'modal';
                filterModal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Filtrar Historial</h3>
                            <span class="close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="filter-options-modal">
                                <div class="filter-group">
                                    <label for="dateRange">Rango de Fechas:</label>
                                    <select id="dateRange" class="filter-select">
                                        <option value="all">Todos los registros</option>
                                        <option value="today">Hoy</option>
                                        <option value="week">Esta semana</option>
                                        <option value="month">Este mes</option>
                                    </select>
                                </div>
                                
                                <div class="filter-group">
                                    <label for="statusFilter">Filtrar por Estado:</label>
                                    <select id="statusFilter" class="filter-select">
                                        <option value="all">Todos los estados</option>
                                        <option value="normal">Solo Normal</option>
                                        <option value="baja">Solo Baja</option>
                                        <option value="alta">Solo Alta</option>
                                        <option value="falla">Solo Fallas</option>
                                    </select>
                                </div>
                                
                                <div class="filter-actions">
                                    <button id="applyFilter" class="control-btn" style="width: 100%; margin-top: 15px;">
                                        <i class="fas fa-check"></i> Aplicar Filtros
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(filterModal);

                // Añadir funcionalidad para cerrar el modal
                const closeBtn = filterModal.querySelector('.close');
                closeBtn.addEventListener('click', function() {
                    filterModal.style.display = 'none';
                });

                // Cerrar modal al hacer clic fuera
                window.addEventListener('click', function(event) {
                    if (event.target === filterModal) {
                        filterModal.style.display = 'none';
                    }
                });

                // Aplicar filtros
                const applyFilter = filterModal.querySelector('#applyFilter');
                applyFilter.addEventListener('click', function() {
                    const dateRange = filterModal.querySelector('#dateRange').value;
                    const statusFilter = filterModal.querySelector('#statusFilter').value;
                    
                    // Aquí iría la lógica para aplicar los filtros
                    console.log('Aplicando filtros:', { dateRange, statusFilter });
                    alert('Funcionalidad de filtro en desarrollo. Filtros seleccionados:\n' +
                          `Rango de fechas: ${dateRange}\n` +
                          `Estado: ${statusFilter}`);
                    
                    filterModal.style.display = 'none';
                });
            }

            filterModal.style.display = 'block';
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
                                <p>Esta página muestra el historial completo de lecturas del dispositivo.</p>
                                
                                <div class="help-item">
                                    <strong>Gráfica de Presiones:</strong>
                                    <p>La gráfica muestra la evolución de las lecturas de presión a lo largo del tiempo.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Línea de Tendencia:</strong>
                                    <p>El botón "Ajustar Línea de Tendencia" muestra u oculta una línea que indica la tendencia general de las lecturas.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Tabla de Datos:</strong>
                                    <p>La tabla muestra todos los registros con información detallada de cada lectura.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Colores de Estado:</strong>
                                    <p>Los estados se muestran con colores:
                                    <ul>
                                        <li><span style="color: #e74c3c">Falla Baja/Alta:</span> Rojo</li>
                                        <li><span style="color: #f39c12">Baja/Alta:</span> Naranja</li>
                                        <li><span style="color: #2ecc71">Normal:</span> Verde</li>
                                    </ul>
                                    </p>
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