// Inicializar la página de reparaciones
function initializePage() {
    // Actualizar la última hora de actualización
    const now = new Date();
    const lastUpdateElement = document.getElementById('lastUpdate');
    lastUpdateElement.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    
    // Manejar el menú hamburguesa (para móviles)
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Botón de ayuda
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
            alert('Esta sección muestra los centros de reparación más cercanos en el mapa y la información de contacto de los proveedores de servicio.');
        });
    }
    
    // Cerrar menú al hacer clic fuera de él (para móviles)
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
});