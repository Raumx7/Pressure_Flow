// Función para cargar el nombre del dispositivo actual
function loadCurrentDevice() {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device_id') || 'ESP32_001';

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

// Inicializar la página de reparaciones
function initializePage() {
    loadCurrentDevice();
    
    // Actualizar la última hora de actualización
    const now = new Date();
    const lastUpdateElement = document.getElementById('lastUpdate');
    lastUpdateElement.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    
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
                            <h3>Ayuda - Reparaciones</h3>
                            <span class="close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="help-section">
                                <h4>Página de Reparaciones</h4>
                                <p>Esta página te ayuda a encontrar centros de reparación y contactar proveedores de servicio.</p>
                                
                                <div class="help-item">
                                    <strong>Mapa de Centros de Reparación:</strong>
                                    <p>El mapa muestra la ubicación de los centros de reparación más cercanos. (Funcionalidad en desarrollo)</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Contacto de Proveedores:</strong>
                                    <p>El panel lateral muestra información de contacto de varios proveedores de servicio técnico.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Información de Contacto:</strong>
                                    <p>Cada proveedor incluye número de teléfono, correo electrónico y horarios de servicio.</p>
                                </div>
                                
                                <div class="help-item">
                                    <strong>Servicio de Emergencia:</strong>
                                    <p>Algunos proveedores ofrecen servicio 24/7 para emergencias.</p>
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