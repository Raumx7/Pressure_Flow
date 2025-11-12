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
        "device_id": "ESP32_002",
        "sensor_type": "presion",
        "value": 155.8,
        "estatus": "Normal",
        "created_at": "2025-11-11 16:22:45",
        "categoria": "industrial"
    },
    {
        "id": 3,
        "device_id": "ESP32_003",
        "sensor_type": "presion",
        "value": 305.6,
        "estatus": "Alta",
        "created_at": "2025-11-11 16:23:45",
        "categoria": "domestico"
    },
    {
        "id": 4,
        "device_id": "ESP32_004",
        "sensor_type": "presion",
        "value": 18.3,
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

// Función para filtrar dispositivos por categoría
function filterDevicesByCategory(category) {
    if (category === "todos") {
        return sensorData.filter(device => !hiddenDevices.includes(device.device_id));
    }
    return sensorData.filter(device => 
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
        
        const statusClass = getStatusClass(device.estatus);
        
        sensorCard.innerHTML = `
            <div class="sensor-name">
                ${device.device_id}
                <span class="sensor-options"><i class="fas fa-ellipsis-v"></i></span>
            </div>
            <div class="sensor-value">${device.value}</div>
            <div class="sensor-status ${statusClass}">${device.estatus}</div>
        `;
        
        sensorGrid.appendChild(sensorCard);
    });
    
    // Actualizar la última hora de actualización
    const now = new Date();
    const lastUpdateElement = document.getElementById('lastUpdate');
    lastUpdateElement.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
}

// Función para renderizar las alertas
function renderAlerts() {
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';
    
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
    const devicesToShow = sensorData.filter(device => 
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
            showDevice(device.device_id);
        });
        
        availableDevicesContainer.appendChild(deviceElement);
    });
}

// Función para mostrar un dispositivo (quitar de la lista de ocultos)
function showDevice(deviceId) {
    hiddenDevices = hiddenDevices.filter(id => id !== deviceId);
    
    // Cerrar modal y actualizar la vista
    closeModal('addDeviceModal');
    renderDevices();
    renderAvailableDevices();
    renderDevicesToHide();
}

// Función para renderizar dispositivos a ocultar
function renderDevicesToHide() {
    const devicesToHideContainer = document.getElementById('devicesToHide');
    devicesToHideContainer.innerHTML = '';
    
    // Filtrar dispositivos visibles de la categoría actual
    const devicesToShow = sensorData.filter(device => 
        !hiddenDevices.includes(device.device_id) && 
        (currentCategory === 'todos' || device.categoria === currentCategory)
    );
    
    if (devicesToShow.length === 0) {
        devicesToHideContainer.innerHTML = '<div class="no-devices">No hay dispositivos para ocultar</div>';
        return;
    }
    
    devicesToShow.forEach(device => {
        const deviceElement = document.createElement('div');
        deviceElement.className = 'device-to-hide';
        
        deviceElement.innerHTML = `
            <label>
                <input type="checkbox" class="device-checkbox" value="${device.device_id}">
                ${device.device_id} (${getCategoryName(device.categoria)})
            </label>
        `;
        
        devicesToHideContainer.appendChild(deviceElement);
    });
}

// Función para ocultar dispositivos seleccionados
function hideSelectedDevices() {
    const hideAllCheckbox = document.getElementById('hideAllCheckbox');
    
    if (hideAllCheckbox.checked) {
        // Ocultar todos los dispositivos de la categoría actual
        if (currentCategory === 'todos') {
            hiddenDevices = [...new Set([...hiddenDevices, ...sensorData.map(device => device.device_id)])];
        } else {
            sensorData.forEach(device => {
                if (device.categoria === currentCategory) {
                    hiddenDevices.push(device.device_id);
                }
            });
            // Eliminar duplicados
            hiddenDevices = [...new Set(hiddenDevices)];
        }
    } else {
        // Ocultar solo los dispositivos seleccionados
        const checkboxes = document.querySelectorAll('.device-checkbox:checked');
        checkboxes.forEach(checkbox => {
            hiddenDevices.push(checkbox.value);
        });
        // Eliminar duplicados
        hiddenDevices = [...new Set(hiddenDevices)];
    }
    
    // Cerrar modal y actualizar la vista
    closeModal('hideDeviceModal');
    renderDevices();
    renderAvailableDevices();
    renderDevicesToHide();
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
    
    // Renderizar los dispositivos con el nuevo filtro
    renderDevices();
    renderAvailableDevices();
    renderDevicesToHide();
}

// Funciones para el modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    
    if (modalId === 'addDeviceModal') {
        renderAvailableDevices();
    } else if (modalId === 'hideDeviceModal') {
        renderDevicesToHide();
        // Resetear el checkbox de ocultar todos
        document.getElementById('hideAllCheckbox').checked = false;
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
    renderDevicesToHide();
    
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
    
    // Manejar el menú hamburguesa (para móviles)
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Manejar el botón de añadir dispositivo
    const addDeviceBtn = document.getElementById('addDeviceBtn');
    addDeviceBtn.addEventListener('click', () => openModal('addDeviceModal'));
    
    // Manejar el botón de ocultar dispositivo
    const hideDeviceBtn = document.getElementById('hideDeviceBtn');
    hideDeviceBtn.addEventListener('click', () => openModal('hideDeviceModal'));
    
    // Manejar el cierre de modales
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Confirmar ocultar dispositivos
    const confirmHideBtn = document.getElementById('confirmHideBtn');
    confirmHideBtn.addEventListener('click', hideSelectedDevices);
    
    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
        
        // Cerrar menú al hacer clic fuera de él (para móviles)
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
});