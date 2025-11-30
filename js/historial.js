// historial.js
let sensorData = [];
let showTrendline = false;
let currentFilters = {
    date: '',
    status: ''
};
let currentOffset = 0;
const RECORDS_PER_PAGE = 15;
let totalRecords = 0;

// Función para obtener datos de la API con filtros
async function fetchSensorData(deviceId = '', date = '', status = '', offset = 0) {
    try {
        let url = `api/api.php?action=sensor_data&limit=${RECORDS_PER_PAGE}&offset=${offset}`;
        
        if (deviceId) {
            url += `&device_id=${encodeURIComponent(deviceId)}`;
        }
        
        if (date) {
            url += `&date=${encodeURIComponent(date)}`;
        }
        
        if (status) {
            url += `&status=${encodeURIComponent(status)}`;
        }
        
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        // CORRECCIÓN CRÍTICA: La API devuelve un array directo, no un objeto con propiedad data
        if (Array.isArray(result)) {
            // Si es un array, lo usamos directamente y calculamos el total
            return {
                data: result,
                total: result.length,
                limit: RECORDS_PER_PAGE,
                offset: offset
            };
        } else {
            // Si por alguna razón es un objeto con la estructura esperada
            return result;
        }
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        return { data: [], total: 0 };
    }
}

// Función para cargar el nombre del dispositivo actual en el sidebar
function loadCurrentDevice(deviceId) {
    const currentDeviceBtn = document.getElementById('currentDeviceBtn');
    const currentDeviceName = document.getElementById('currentDeviceName');
    
    if (currentDeviceBtn && currentDeviceName) {
        currentDeviceName.textContent = deviceId;
        currentDeviceBtn.href = `device.html?device_id=${encodeURIComponent(deviceId)}`;
    }
}

// Función para formatear la fecha
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    } catch (e) {
        return dateString;
    }
}

// Función para formatear la hora
function formatTime(dateString) {
    try {
        const date = new Date(dateString);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    } catch (e) {
        return dateString;
    }
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
    console.log('Loading historial data...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id');
    
    if (!deviceId) {
        console.error('No device_id found in URL parameters');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Device ID from URL:', deviceId);
    
    try {
        const response = await fetchSensorData(
            deviceId, 
            currentFilters.date, 
            currentFilters.status, 
            currentOffset
        );
        
        // CORRECCIÓN: Usar response.data que ahora siempre será un array
        sensorData = response.data || [];
        totalRecords = response.total || 0;
        
        console.log('Loaded sensor data:', sensorData);
        console.log('Total records:', totalRecords);
        
        loadCurrentDevice(deviceId);
        renderChart();
        renderTable();
        updatePaginationControls();
        updateFilterDisplay();
        
        const now = new Date();
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
        }
    } catch (error) {
        console.error('Error in loadHistorialData:', error);
    }
}

// Función para calcular la línea de tendencia y R²
function calculateTrendline(data) {
    const n = data.length;
    if (n < 2) return { points: [], rSquared: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    data.forEach((point, index) => {
        const x = index;
        const y = parseFloat(point.value);
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calcular R²
    const yMean = sumY / n;
    let ssTot = 0;
    let ssRes = 0;

    data.forEach((point, index) => {
        const y = parseFloat(point.value);
        const yPred = slope * index + intercept;
        ssTot += Math.pow(y - yMean, 2);
        ssRes += Math.pow(y - yPred, 2);
    });

    const rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

    return {
        points: data.map((_, index) => ({
            x: index,
            y: slope * index + intercept
        })),
        rSquared: rSquared
    };
}

// Función para aplicar filtros
function applyFilters() {
    currentOffset = 0;
    loadHistorialData();
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
    
    if (activeFilters.length > 0) {
        filterDisplay.innerHTML = `
            <strong>Filtros activos:</strong> ${activeFilters.join(', ')}
            <button id="clearFilters" class="clear-filters-btn">Limpiar filtros</button>
        `;
        
        const clearBtn = document.getElementById('clearFilters');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearFilters);
        }
    } else {
        filterDisplay.innerHTML = '<em>No hay filtros activos</em>';
    }
}

// Función para limpiar todos los filtros
function clearFilters() {
    currentFilters = {
        date: '',
        status: ''
    };
    currentOffset = 0;
    
    const dateFilter = document.getElementById('filterDate');
    const statusFilter = document.getElementById('filterStatus');
    
    if (dateFilter) dateFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    
    applyFilters();
}

// Función para actualizar controles de paginación
function updatePaginationControls() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    if (pageInfo) {
        const currentPage = Math.floor(currentOffset / RECORDS_PER_PAGE) + 1;
        const totalPages = Math.ceil(totalRecords / RECORDS_PER_PAGE) || 1;
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentOffset === 0;
        prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
    }
    
    if (nextBtn) {
        nextBtn.disabled = (currentOffset + RECORDS_PER_PAGE) >= totalRecords;
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    }
}

// Función para cambiar de página
function changePage(direction) {
    if (direction === 'prev' && currentOffset > 0) {
        currentOffset -= RECORDS_PER_PAGE;
    } else if (direction === 'next' && (currentOffset + RECORDS_PER_PAGE) < totalRecords) {
        currentOffset += RECORDS_PER_PAGE;
    }
    
    loadHistorialData();
}

// Función renderChart
function renderChart() {
    const canvas = document.getElementById('pressureChart');
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id');
    
    // Usar sensorData directamente (ya es el array que necesitamos)
    let deviceData = [...sensorData];
    
    // Ordenar por fecha (más antiguo primero para la gráfica)
    deviceData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    if (deviceData.length === 0) {
        console.log('No data available for chart');
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="no-data" style="text-align: center; padding: 40px; color: #7f8c8d;">No hay datos disponibles para mostrar</div>';
        }
        return;
    }
    
    const labels = deviceData.map(reading => {
        const date = new Date(reading.created_at);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    });
    
    const values = deviceData.map(reading => parseFloat(reading.value));
    
    // Calcular línea de tendencia y R²
    let trendlineInfo = null;
    if (showTrendline && deviceData.length > 1) {
        trendlineInfo = calculateTrendline(deviceData);
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
    
    if (showTrendline && trendlineInfo && trendlineInfo.points.length > 0) {
        datasets.push({
            label: `Línea de Tendencia (R² = ${trendlineInfo.rSquared.toFixed(4)})`,
            data: trendlineInfo.points.map(point => point.y),
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
    
    const chartTitle = `Historial de Presión - ${deviceId} (${deviceData.length} registros)`;
    
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
                    text: chartTitle,
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
    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }
    
    tableBody.innerHTML = '';

    // Usar sensorData directamente
    const deviceData = [...sensorData];
    
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
    
    if (trendlineBtn) {
        if (showTrendline) {
            trendlineBtn.innerHTML = '<i class="fas fa-chart-line"></i> Ocultar Línea de Tendencia';
            trendlineBtn.classList.add('active');
        } else {
            trendlineBtn.innerHTML = '<i class="fas fa-chart-line"></i> Mostrar Línea de Tendencia';
            trendlineBtn.classList.remove('active');
        }
        
        renderChart();
    }
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
            applyFilters();
            filterModal.style.display = 'none';
        });

        // Resetear filtros
        const resetBtn = document.getElementById('resetFilters');
        resetBtn.addEventListener('click', function() {
            document.getElementById('filterDate').value = '';
            document.getElementById('filterStatus').value = '';
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
    console.log('Historial page loaded');
    
    // Cargar datos iniciales
    loadHistorialData();
    
    // Configurar actualización automática cada 30 segundos
    setInterval(loadHistorialData, 30000);
    
    // Botones de control de la gráfica
    const filterBtn = document.getElementById('filterBtn');
    const trendlineBtn = document.getElementById('trendlineBtn');
    
    if (filterBtn) {
        filterBtn.addEventListener('click', showFilterModal);
    }
    
    if (trendlineBtn) {
        trendlineBtn.addEventListener('click', toggleTrendline);
    }
    
    // Controles de paginación
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => changePage('prev'));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => changePage('next'));
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
                                    <p>Puedes filtrar los datos por fecha específica y estatus de presión.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Línea de Tendencia:</strong>
                                    <p>La línea de tendencia muestra la dirección general de los datos para identificar patrones. El valor R² indica qué tan bien se ajusta la línea a los datos (más cercano a 1 es mejor).</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Navegación:</strong>
                                    <p>Usa los botones "Anterior" y "Siguiente" para navegar entre las páginas de registros.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Tabla de Registros:</strong>
                                    <p>La tabla muestra las lecturas de presión con su estatus, fecha y hora exacta.</p>
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