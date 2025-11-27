// historial.js
let sensorData = [];
let originalData = [];
let showTrendline = false;
let currentFilters = {
    date: '',
    status: '',
    timeRange: 'all'
};

// Función para obtener datos de la API
async function fetchSensorData(deviceId = '') {
    try {
        let url = 'api/api.php?action=sensor_data';
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
}

// Función para formatear la fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
}

// Función para formatear la hora
function formatTime(dateString) {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}

// Función para obtener la clase CSS según el estado
function getStatusClass(estatus) {
    const statusMap = {
        "Muy Baja": "status-muy-baja",
        "Baja": "status-baja",
        "Normal": "status-normal",
        "Alta": "status-alta",
        "Muy Alta": "status-muy-alta"
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
    originalData = [...sensorData];
    loadCurrentDevice(deviceId);
    applyFilters();
    
    const now = new Date();
    const lastUpdateElement = document.getElementById('lastUpdate');
    lastUpdateElement.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
}

// Función para calcular la línea de tendencia (regresión lineal)
function calculateTrendline(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    data.forEach((point, index) => {
        const x = index;
        const y = point.value;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((_, index) => ({
        x: index,
        y: slope * index + intercept
    }));
}

// Función para aplicar filtros
function applyFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id');
    let filteredData = originalData.filter(reading => reading.device_id === deviceId);
    
    // Aplicar filtro por fecha
    if (currentFilters.date) {
        filteredData = filteredData.filter(reading => {
            const readingDate = new Date(reading.created_at).toISOString().split('T')[0];
            return readingDate === currentFilters.date;
        });
    }
    
    // Aplicar filtro por estatus
    if (currentFilters.status) {
        filteredData = filteredData.filter(reading => reading.estatus === currentFilters.status);
    }
    
    // Aplicar filtro por rango de tiempo
    if (currentFilters.timeRange !== 'all') {
        const now = new Date();
        let timeLimit = new Date();
        
        switch (currentFilters.timeRange) {
            case '1h':
                timeLimit.setHours(now.getHours() - 1);
                break;
            case '6h':
                timeLimit.setHours(now.getHours() - 6);
                break;
            case '24h':
                timeLimit.setDate(now.getDate() - 1);
                break;
            case '7d':
                timeLimit.setDate(now.getDate() - 7);
                break;
        }
        
        filteredData = filteredData.filter(reading => {
            const readingDate = new Date(reading.created_at);
            return readingDate >= timeLimit;
        });
    }
    
    sensorData = filteredData;
    renderChart();
    renderTable();
    updateFilterDisplay();
}

// Función para actualizar la visualización de filtros activos
function updateFilterDisplay() {
    const filterDisplay = document.getElementById('filterDisplay');
    if (!filterDisplay) return;
    
    const activeFilters = [];
    
    if (currentFilters.date) {
        activeFilters.push(`Fecha: ${currentFilters.date}`);
    }
    
    if (currentFilters.status) {
        activeFilters.push(`Estatus: ${currentFilters.status}`);
    }
    
    if (currentFilters.timeRange !== 'all') {
        const timeLabels = {
            '1h': '1 hora',
            '6h': '6 horas',
            '24h': '24 horas',
            '7d': '7 días'
        };
        activeFilters.push(`Periodo: ${timeLabels[currentFilters.timeRange]}`);
    }
    
    if (activeFilters.length > 0) {
        filterDisplay.innerHTML = `
            <strong>Filtros activos:</strong> ${activeFilters.join(', ')}
            <button id="clearFilters" class="clear-filters-btn">Limpiar filtros</button>
        `;
        
        document.getElementById('clearFilters').addEventListener('click', clearFilters);
    } else {
        filterDisplay.innerHTML = '<em>No hay filtros activos</em>';
    }
}

// Función para limpiar todos los filtros
function clearFilters() {
    currentFilters = {
        date: '',
        status: '',
        timeRange: 'all'
    };
    
    const dateFilter = document.getElementById('filterDate');
    const statusFilter = document.getElementById('filterStatus');
    const timeFilter = document.getElementById('filterTimeRange');
    
    if (dateFilter) dateFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    if (timeFilter) timeFilter.value = 'all';
    
    applyFilters();
}

// Función renderChart
function renderChart() {
    const ctx = document.getElementById('pressureChart').getContext('2d');
    
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id');
    let deviceData = sensorData.filter(reading => reading.device_id === deviceId);
    
    // Ordenar por fecha
    deviceData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    const labels = deviceData.map(reading => {
        const date = new Date(reading.created_at);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    });
    
    const values = deviceData.map(reading => reading.value);
    
    // Datos para la línea de tendencia
    let trendlineData = [];
    if (showTrendline && deviceData.length > 1) {
        trendlineData = calculateTrendline(deviceData);
    }
    
    // Destruir gráfico anterior si existe
    if (window.pressureChartInstance) {
        window.pressureChartInstance.destroy();
    }
    
    const datasets = [
        {
            label: 'Presión (PSI)',
            data: values,
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: values.map(value => {
                if (value < 100) return '#e74c3c';
                if (value < 135) return '#FFD900';
                if (value < 165) return '#2ecc71';
                if (value < 180) return '#FFD900';
                return '#e74c3c';
            }),
            pointBorderColor: '#2c3e50',
            pointRadius: 4,
            pointHoverRadius: 6
        }
    ];
    
    if (showTrendline && trendlineData.length > 0) {
        datasets.push({
            label: 'Línea de Tendencia',
            data: trendlineData.map(point => point.y),
            borderColor: '#3498db',
            borderWidth: 2,
            backgroundColor: 'transparent',
            tension: 0,
            fill: false,
            borderDash: [5, 5],
            pointRadius: 0,
            pointHoverRadius: 0
        });
    }
    
    window.pressureChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Historial de Presión - ${deviceId}`,
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += parseFloat(context.parsed.y).toFixed(2) + ' PSI';
                            return label;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'PSI'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hora'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
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
    
    if (deviceData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #7f8c8d;">
                    No hay datos que coincidan con los filtros aplicados
                </td>
            </tr>
        `;
        return;
    }
    
    deviceData.forEach((reading, index) => {
        const row = document.createElement('tr');
        const statusClass = getStatusClass(reading.estatus);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${parseFloat(reading.value).toFixed(2)} PSI</td>
            <td><span class="${statusClass} table-status">${reading.estatus}</span></td>
            <td>${formatDate(reading.created_at)}</td>
            <td>${formatTime(reading.created_at)}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Función para alternar la línea de tendencia
function toggleTrendline() {
    showTrendline = !showTrendline;
    const trendlineBtn = document.getElementById('trendlineBtn');
    
    if (showTrendline) {
        trendlineBtn.innerHTML = '<i class="fas fa-chart-line"></i> Ocultar Línea de Tendencia';
        trendlineBtn.classList.add('active');
    } else {
        trendlineBtn.innerHTML = '<i class="fas fa-chart-line"></i> Mostrar Línea de Tendencia';
        trendlineBtn.classList.remove('active');
    }
    
    renderChart();
}

// Función para mostrar modal de filtros
function showFilterModal() {
    let filterModal = document.getElementById('filterModal');
    if (!filterModal) {
        filterModal = document.createElement('div');
        filterModal.id = 'filterModal';
        filterModal.className = 'modal';
        filterModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Filtrar Datos</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="filter-group">
                        <label for="filterDate">Fecha específica:</label>
                        <input type="date" id="filterDate" value="${currentFilters.date}">
                    </div>
                    
                    <div class="filter-group">
                        <label for="filterTimeRange">Rango de tiempo:</label>
                        <select id="filterTimeRange">
                            <option value="all" ${currentFilters.timeRange === 'all' ? 'selected' : ''}>Todo el historial</option>
                            <option value="1h" ${currentFilters.timeRange === '1h' ? 'selected' : ''}>Última hora</option>
                            <option value="6h" ${currentFilters.timeRange === '6h' ? 'selected' : ''}>Últimas 6 horas</option>
                            <option value="24h" ${currentFilters.timeRange === '24h' ? 'selected' : ''}>Últimas 24 horas</option>
                            <option value="7d" ${currentFilters.timeRange === '7d' ? 'selected' : ''}>Últimos 7 días</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="filterStatus">Estatus de presión:</label>
                        <select id="filterStatus">
                            <option value="">Todos los estatus</option>
                            <option value="Muy Baja" ${currentFilters.status === 'Muy Baja' ? 'selected' : ''}>Muy Baja</option>
                            <option value="Baja" ${currentFilters.status === 'Baja' ? 'selected' : ''}>Baja</option>
                            <option value="Normal" ${currentFilters.status === 'Normal' ? 'selected' : ''}>Normal</option>
                            <option value="Alta" ${currentFilters.status === 'Alta' ? 'selected' : ''}>Alta</option>
                            <option value="Muy Alta" ${currentFilters.status === 'Muy Alta' ? 'selected' : ''}>Muy Alta</option>
                        </select>
                    </div>
                    
                    <div class="filter-actions">
                        <button id="applyFilters" class="btn-primary">Aplicar Filtros</button>
                        <button id="resetFilters" class="btn-secondary">Restablecer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(filterModal);

        // Cerrar modal
        const closeBtn = filterModal.querySelector('.close');
        closeBtn.addEventListener('click', function() {
            filterModal.style.display = 'none';
        });

        // Aplicar filtros
        const applyBtn = document.getElementById('applyFilters');
        applyBtn.addEventListener('click', function() {
            currentFilters.date = document.getElementById('filterDate').value;
            currentFilters.status = document.getElementById('filterStatus').value;
            currentFilters.timeRange = document.getElementById('filterTimeRange').value;
            applyFilters();
            filterModal.style.display = 'none';
        });

        // Resetear filtros
        const resetBtn = document.getElementById('resetFilters');
        resetBtn.addEventListener('click', function() {
            document.getElementById('filterDate').value = '';
            document.getElementById('filterStatus').value = '';
            document.getElementById('filterTimeRange').value = 'all';
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function(event) {
            if (event.target === filterModal) {
                filterModal.style.display = 'none';
            }
        });
    }

    filterModal.style.display = 'block';
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    loadHistorialData();
    
    // Configurar actualización automática
    setInterval(loadHistorialData, 30000);
    
    // Crear contenedor para mostrar filtros activos
    const chartControls = document.querySelector('.chart-controls');
    if (chartControls) {
        const filterDisplay = document.createElement('div');
        filterDisplay.id = 'filterDisplay';
        filterDisplay.className = 'filter-display';
        filterDisplay.innerHTML = '<em>No hay filtros activos</em>';
        chartControls.parentNode.insertBefore(filterDisplay, chartControls.nextSibling);
    }
    
    // Botones de control de la gráfica
    const filterBtn = document.getElementById('filterBtn');
    const trendlineBtn = document.getElementById('trendlineBtn');
    
    if (filterBtn) {
        filterBtn.addEventListener('click', showFilterModal);
    }
    
    if (trendlineBtn) {
        trendlineBtn.addEventListener('click', toggleTrendline);
    }
    
    // Botón de ayuda
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
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
                                    <p>La gráfica muestra la evolución de la presión a lo largo del tiempo. Los puntos de colores indican el estatus:</p>
                                    <ul>
                                        <li><span style="color: #e74c3c">● Rojo:</span> Presión Muy Baja o Muy Alta</li>
                                        <li><span style="color: #FFD900">● Amarillo:</span> Presión Baja o Alta</li>
                                        <li><span style="color: #2ecc71">● Verde:</span> Presión Normal</li>
                                    </ul>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Filtrar Datos:</strong>
                                    <p>Puedes filtrar los datos por fecha específica, rango de tiempo y estatus de presión.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Línea de Tendencia:</strong>
                                    <p>La línea de tendencia muestra la dirección general de los datos para identificar patrones.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Tabla de Registros:</strong>
                                    <p>La tabla muestra todas las lecturas de presión con su estatus, fecha y hora exacta.</p>
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

                const closeBtn = helpModal.querySelector('.close');
                closeBtn.addEventListener('click', function() {
                    helpModal.style.display = 'none';
                });

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