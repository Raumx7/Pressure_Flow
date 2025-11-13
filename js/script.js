// Datos de ejemplo proporcionados
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
        "created_at": "2025-11-11 16:22:45",
        "categoria": "automotriz"
    },
    {
        "id": 3,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 167.0,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:23:45",
        "categoria": "automotriz"
    },
    {
        "id": 4,
        "device_id": "ESP32_001",
        "sensor_type": "presion",
        "value": 50.0,
        "estatus": "Baja",
        "created_at": "2025-11-11 16:24:45",
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
        "created_at": "2025-11-11 16:22:45",
        "categoria": "domestico"
    },
    {
        "id": 3,
        "device_id": "ESP32_002",
        "sensor_type": "presion",
        "value": 167.0,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:23:45",
        "categoria": "domestico"
    },
    {
        "id": 4,
        "device_id": "ESP32_002",
        "sensor_type": "presion",
        "value": 180.5,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:24:45",
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
        "created_at": "2025-11-11 16:22:45",
        "categoria": "industrial"
    },
    {
        "id": 3,
        "device_id": "ESP32_003",
        "sensor_type": "presion",
        "value": 167.0,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:23:45",
        "categoria": "industrial"
    },
    {
        "id": 4,
        "device_id": "ESP32_003",
        "sensor_type": "presion",
        "value": 300.7,
        "estatus": "Alta",
        "created_at": "2025-11-11 16:24:45",
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
        "created_at": "2025-11-11 16:22:45",
        "categoria": "refrigeracion"
    },
    {
        "id": 3,
        "device_id": "ESP32_004",
        "sensor_type": "presion",
        "value": 167.0,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:23:45",
        "categoria": "refrigeracion"
    },
    {
        "id": 4,
        "device_id": "ESP32_004",
        "sensor_type": "presion",
        "value": 15.2,
        "estatus": "Falla Baja",
        "created_at": "2025-11-11 16:24:45",
        "categoria": "refrigeracion"
    }
];

// Datos de ejemplo para alertas
const alertData = [
    {
        id: 1,
        title: "ESP32_004 - Falla Baja",
        message: "El dispositivo ha detectado una presión anormalmente baja",
        type: "critical",
        time: "2025-11-11 16:24:45"
    },
    {
        id: 2,
        title: "ESP32_003 - Presión Alta",
        message: "La presión está por encima del rango normal",
        type: "warning",
        time: "2025-11-11 16:23:45"
    },
    {
        id: 3,
        title: "Sistema Actualizado",
        message: "El sistema se ha actualizado correctamente",
        type: "info",
        time: "2025-11-11 16:20:00"
    }
];

// Estado de la aplicación
let currentCategory = "automotriz";
let hiddenDevices = []; // Dispositivos ocultos
let categoryHiddenState = {
    automotriz: false,
    domestico: false,
    industrial: false,
    refrigeracion: false,
    todos: false
};
let alertsEnabled = true;

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

// Función para obtener el último estado de cada dispositivo (solo el de ID mayor)
function getLatestDeviceStatus() {
    const deviceMap = new Map();

    // Ordenar por ID descendente (mayor ID primero)
    const sortedData = [...sensorData].sort((a, b) => b.id - a.id);

    // Tomar solo el primer registro (mayor ID) de cada device_id
    sortedData.forEach(device => {
        if (!deviceMap.has(device.device_id)) {
            deviceMap.set(device.device_id, device);
        }
    });

    return Array.from(deviceMap.values());
}

// Función para filtrar dispositivos por categoría
function filterDevicesByCategory(category) {
    if (category === "todos") {
        // Si la categoría "todos" está oculta, no mostrar nada
        if (categoryHiddenState.todos) return [];
        return getLatestDeviceStatus().filter(device => !hiddenDevices.includes(device.device_id));
    }

    // Si la categoría actual está oculta, no mostrar nada
    if (categoryHiddenState[category]) return [];

    return getLatestDeviceStatus().filter(device =>
        device.categoria === category && !hiddenDevices.includes(device.device_id)
    );
}

// Función para cambiar el fondo según la categoría
function updateBackground(category) {
    const mainContent = document.getElementById('mainContent');

    // Remover todas las clases de categoría
    mainContent.classList.remove('automotriz', 'domestico', 'industrial', 'refrigeracion', 'todos');

    // Añadir la clase correspondiente
    if (category !== 'todos') {
        mainContent.classList.add(category);
    } else {
        mainContent.classList.add('todos');
    }
}

// Función para renderizar los dispositivos
function renderDevices() {
    const sensorGrid = document.getElementById('sensorGrid');
    sensorGrid.innerHTML = '';

    const filteredDevices = filterDevicesByCategory(currentCategory);

    if (filteredDevices.length === 0) {
        sensorGrid.innerHTML = '<div class="no-sensors">No hay dispositivos en esta categoría</div>';
        return;
    }

    filteredDevices.forEach(device => {
        const sensorCard = document.createElement('div');
        sensorCard.className = 'sensor-card';
        // Añadir cursor pointer para indicar que es clickable
        sensorCard.style.cursor = 'pointer';

        const statusClass = getStatusClass(device.estatus);

        sensorCard.innerHTML = `
            <div class="sensor-name">
                ${device.device_id}
                <div class="sensor-options">
                    <i class="fas fa-ellipsis-v"></i>
                    <div class="options-menu">
                        <div class="option-item" data-action="info" data-device-id="${device.device_id}">
                            <i class="fas fa-info-circle"></i> Info
                        </div>
                        <div class="option-item" data-action="hide" data-device-id="${device.device_id}">
                            <i class="fas fa-eye-slash"></i> Ocultar
                        </div>
                    </div>
                </div>
            </div>
            <div class="sensor-value">${device.value}</div>
            <div class="sensor-status ${statusClass}">${device.estatus}</div>
        `;

        // Añadir event listener para redirigir a device.html al hacer clic en la tarjeta
        sensorCard.addEventListener('click', function(e) {
            // Evitar la redirección si se hizo clic en el menú de opciones
            if (!e.target.closest('.sensor-options')) {
                window.location.href = `device.html?device_id=${device.device_id}`;
            }
        });

        // Añadir event listeners para el menú de opciones
        const optionsMenu = sensorCard.querySelector('.options-menu');
        const optionsTrigger = sensorCard.querySelector('.sensor-options');

        optionsTrigger.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que el clic se propague a la tarjeta (y así evitar redirección)
            // Alternar la visibilidad del menú
            optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
        });

        // Cerrar el menú si se hace clic en otra parte
        document.addEventListener('click', function() {
            optionsMenu.style.display = 'none';
        });

        // Manejar las opciones del menú
        sensorCard.querySelectorAll('.option-item').forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation(); // Evitar que el clic se propague a la tarjeta
                const action = this.dataset.action;
                const deviceId = this.dataset.deviceId;

                if (action === 'info') {
                    showDeviceInfo(deviceId);
                } else if (action === 'hide') {
                    hideSingleDevice(deviceId);
                }

                // Ocultar el menú después de la acción
                optionsMenu.style.display = 'none';
            });
        });

        sensorGrid.appendChild(sensorCard);
    });

    // Actualizar la última hora de actualización
    const now = new Date();
    const lastUpdateElement = document.getElementById('lastUpdate');
    lastUpdateElement.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
}

// Función para mostrar información del dispositivo en un modal
function showDeviceInfo(deviceId) {
    const device = getLatestDeviceStatus().find(d => d.device_id === deviceId);
    if (!device) return;

    // Crear modal de información si no existe
    let infoModal = document.getElementById('deviceInfoModal');
    if (!infoModal) {
        infoModal = document.createElement('div');
        infoModal.id = 'deviceInfoModal';
        infoModal.className = 'modal';
        infoModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Información del Dispositivo</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="device-info-details" id="deviceInfoDetails"></div>
                </div>
            </div>
        `;
        document.body.appendChild(infoModal);

        // Añadir funcionalidad para cerrar el modal
        const closeBtn = infoModal.querySelector('.close');
        closeBtn.addEventListener('click', function() {
            infoModal.style.display = 'none';
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function(event) {
            if (event.target === infoModal) {
                infoModal.style.display = 'none';
            }
        });
    }

    const details = document.getElementById('deviceInfoDetails');

    // Formatear la fecha
    const date = new Date(device.created_at);
    const formattedDate = `${date.getFullYear()},${(date.getMonth() + 1).toString().padStart(2, '0')},${date.getDate().toString().padStart(2, '0')}`;

    details.innerHTML = `
        <div class="info-row">
            <span class="info-label">Device ID:</span>
            <span class="info-value">${device.device_id}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tipo de Sensor:</span>
            <span class="info-value">${device.sensor_type}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Última Medición:</span>
            <span class="info-value">${device.value}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Estatus:</span>
            <span class="info-value">${device.estatus}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Último Registro:</span>
            <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Categoría:</span>
            <span class="info-value">${getCategoryName(device.categoria)}</span>
        </div>
    `;

    infoModal.style.display = 'block';
}

// Función para ocultar un dispositivo individual
function hideSingleDevice(deviceId) {
    if (!hiddenDevices.includes(deviceId)) {
        hiddenDevices.push(deviceId);
    }
    renderDevices();
    updateAddButton();
}

// Función para renderizar las alertas
function renderAlerts() {
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';

    // Solo mostrar alertas si están habilitadas
    if (!alertsEnabled) {
        alertsList.innerHTML = '<div class="no-alerts">Alertas desactivadas</div>';
        return;
    }

    alertData.forEach(alert => {
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

// Función para renderizar dispositivos disponibles para añadir
function renderAvailableDevices() {
    const availableDevicesContainer = document.getElementById('availableDevices');
    availableDevicesContainer.innerHTML = '';

    // Filtrar dispositivos que están ocultos y son de la categoría actual
    const devicesToShow = getLatestDeviceStatus().filter(device =>
        hiddenDevices.includes(device.device_id) &&
        (currentCategory === 'todos' || device.categoria === currentCategory)
    );

    if (devicesToShow.length === 0) {
        availableDevicesContainer.innerHTML = '<div class="no-devices">No hay dispositivos disponibles para mostrar</div>';
        return;
    }

    devicesToShow.forEach(device => {
        const deviceElement = document.createElement('div');
        deviceElement.className = 'available-device';
        deviceElement.dataset.deviceId = device.device_id;

        deviceElement.innerHTML = `
            <div class="device-info">
                <div class="device-name">${device.device_id}</div>
                <div class="device-category">${getCategoryName(device.categoria)}</div>
            </div>
            <div class="add-icon">
                <i class="fas fa-plus"></i>
            </div>
        `;

        deviceElement.addEventListener('click', function() {
            showSingleDevice(device.device_id);
        });

        availableDevicesContainer.appendChild(deviceElement);
    });
}

// Función para mostrar un dispositivo individual
function showSingleDevice(deviceId) {
    hiddenDevices = hiddenDevices.filter(id => id !== deviceId);
    closeModal('addDeviceModal');
    renderDevices();
    updateAddButton();
    updateHideButton();
}

// Función para mostrar todos los dispositivos de la categoría actual
function showAllDevices() {
    // Mostrar todos los dispositivos de la categoría actual
    getLatestDeviceStatus().forEach(device => {
        if (currentCategory === 'todos' || device.categoria === currentCategory) {
            hiddenDevices = hiddenDevices.filter(id => id !== device.device_id);
        }
    });
    closeModal('addDeviceModal');
    renderDevices();
    updateAddButton();
    updateHideButton();
}

// Función para alternar el estado de ocultar/mostrar todos los dispositivos de la categoría actual
function toggleHideAllDevices() {
    const hideButton = document.getElementById('hideDeviceBtn');

    // Alternar el estado de la categoría actual
    categoryHiddenState[currentCategory] = !categoryHiddenState[currentCategory];

    if (categoryHiddenState[currentCategory]) {
        // Ocultar todos los dispositivos de la categoría actual
        hideButton.innerHTML = '<i class="fas fa-eye"></i> Mostrar Dispositivos';
        hideButton.classList.add('hidden');
    } else {
        // Mostrar todos los dispositivos de la categoría actual
        hideButton.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Dispositivos';
        hideButton.classList.remove('hidden');
    }

    renderDevices();
    updateAddButton();
}

// Función para actualizar el estado del botón de añadir
function updateAddButton() {
    const addButton = document.getElementById('addDeviceBtn');

    // Verificar si hay dispositivos ocultos en la categoría actual
    const hiddenDevicesInCategory = getLatestDeviceStatus().filter(device =>
        hiddenDevices.includes(device.device_id) &&
        (currentCategory === 'todos' || device.categoria === currentCategory)
    );

    if (hiddenDevicesInCategory.length === 0 || categoryHiddenState[currentCategory]) {
        addButton.disabled = true;
    } else {
        addButton.disabled = false;
    }
}

// Función para actualizar el estado del botón de ocultar
function updateHideButton() {
    const hideButton = document.getElementById('hideDeviceBtn');

    if (categoryHiddenState[currentCategory]) {
        hideButton.innerHTML = '<i class="fas fa-eye"></i> Mostrar Dispositivos';
        hideButton.classList.add('hidden');
    } else {
        hideButton.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Dispositivos';
        hideButton.classList.remove('hidden');
    }
}

// Función para cambiar la categoría activa
function setActiveCategory(category) {
    currentCategory = category;

    // Actualizar la interfaz de filtros
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        if (option.dataset.category === category) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });

    // Actualizar el fondo
    updateBackground(category);

    // Actualizar los botones
    updateAddButton();
    updateHideButton();

    // Renderizar los dispositivos con el nuevo filtro
    renderDevices();
}

// Funciones para el modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';

    if (modalId === 'addDeviceModal') {
        renderAvailableDevices();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Función para simular actualización de datos
function simulateDataUpdate() {
    // En una implementación real, aquí se haría una llamada a la API
    // Por ahora, solo volvemos a renderizar los dispositivos
    renderDevices();
    renderAlerts();
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Renderizar contenido inicial
    updateBackground(currentCategory);
    renderDevices();
    renderAlerts();
    updateAddButton();
    updateHideButton();

    // Configurar la actualización automática cada 30 segundos
    setInterval(simulateDataUpdate, 30000);

    // Manejar clics en las opciones de filtro
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', function() {
            const category = this.dataset.category;
            setActiveCategory(category);
        });
    });

    // Manejar el botón de añadir dispositivo
    const addDeviceBtn = document.getElementById('addDeviceBtn');
    addDeviceBtn.addEventListener('click', () => openModal('addDeviceModal'));

    // Manejar el botón de añadir todos
    const addAllBtn = document.getElementById('addAllBtn');
    addAllBtn.addEventListener('click', showAllDevices);

    // Manejar el botón de ocultar/mostrar dispositivo
    const hideDeviceBtn = document.getElementById('hideDeviceBtn');
    hideDeviceBtn.addEventListener('click', toggleHideAllDevices);

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
                            <h3>Ayuda - Pressure Flow</h3>
                            <span class="close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="help-section">
                                <h4>¿Cómo usar Pressure Flow?</h4>
                                <p>Pressure Flow te permite monitorear dispositivos de presión en tiempo real.</p>
                                
                                <div class="help-item">
                                    <strong>Filtrar por Categoría:</strong>
                                    <p>Usa el panel lateral para filtrar dispositivos por categoría: Automotriz, Doméstico, Industrial, Refrigeración o ver Todos.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Añadir/Ocultar Dispositivos:</strong>
                                    <p>Usa los botones "Añadir Dispositivos" y "Ocultar Dispositivos" para gestionar qué dispositivos se muestran.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Ver Detalles:</strong>
                                    <p>Haz clic en cualquier tarjeta de dispositivo para ver información detallada y el historial.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Alertas:</strong>
                                    <p>El panel de alertas muestra notificaciones importantes sobre el estado de tus dispositivos.</p>
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

    // Modal de configuración
    const configBtn = document.getElementById('configBtn');
    if (configBtn) {
        configBtn.addEventListener('click', function() {
            // Crear modal si no existe
            let configModal = document.getElementById('configModal');
            if (!configModal) {
                configModal = document.createElement('div');
                configModal.id = 'configModal';
                configModal.className = 'modal';
                configModal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Configuración de Alertas</h3>
                            <span class="close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="config-option">
                                <label class="switch">
                                    <input type="checkbox" id="alertsToggle" ${alertsEnabled ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                                <span class="config-label">Activar/Desactivar Alertas</span>
                            </div>
                            <p class="config-description">Cuando las alertas están desactivadas, no recibirás notificaciones en la página principal.</p>
                        </div>
                    </div>
                `;
                document.body.appendChild(configModal);

                // Event listener para el interruptor
                const toggle = document.getElementById('alertsToggle');
                toggle.addEventListener('change', function() {
                    alertsEnabled = this.checked;
                    renderAlerts(); // Actualizar alertas inmediatamente
                });

                // Cerrar modal
                const closeBtn = configModal.querySelector('.close');
                closeBtn.addEventListener('click', function() {
                    configModal.style.display = 'none';
                });

                // Cerrar modal al hacer clic fuera
                window.addEventListener('click', function(event) {
                    if (event.target === configModal) {
                        configModal.style.display = 'none';
                    }
                });
            }

            configModal.style.display = 'block';
        });
    }

    // Manejar el cierre de modales
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});