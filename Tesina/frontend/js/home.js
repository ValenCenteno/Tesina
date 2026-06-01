document.addEventListener('DOMContentLoaded', async () => {
    const recentContainer = document.getElementById('recentProblems');
    
    try {
        // Obtener reportes del backend
        const reports = await window.api.getReports();
        const latestReports = reports.slice(0, 3);
        
        if (recentContainer) {
            if (latestReports.length === 0) {
                recentContainer.innerHTML = `
                    <div style="text-align: center; padding: 3rem; background: white; border-radius: 20px;">
                        <i class="fas fa-info-circle" style="font-size: 3rem; color: #2563eb;"></i>
                        <p style="margin-top: 1rem;">No hay reportes aún. ¡Sé el primero en reportar!</p>
                        <a href="crear-reporte.html" class="btn btn-primary" style="margin-top: 1rem;">Crear Reporte</a>
                    </div>
                `;
            } else {
                recentContainer.innerHTML = latestReports.map(report => `
                    <div class="problem-card" onclick="location.href='mapa.html'">
                        <div class="problem-image">
                            <i class="fas fa-${getIcon(report.type)}"></i>
                        </div>
                        <div class="problem-content">
                            <h3 class="problem-title">${report.title}</h3>
                            <p class="problem-description">${report.description.substring(0, 100)}</p>
                            <div class="problem-meta">
                                <span>${report.location}</span>
                                <span class="status-tag status-${report.status.replace('-', '')}">${report.status.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error al cargar reportes:', error);
        if (recentContainer) {
            recentContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: white; border-radius: 20px; color: red;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                    <p style="margin-top: 1rem;">Error al conectar con el servidor</p>
                    <small>Asegúrate que el backend esté corriendo en http://localhost:3000</small>
                </div>
            `;
        }
    }

    // Eventos de botones
    document.getElementById('loginBtn')?.addEventListener('click', () => alert('Login - Próximamente'));
    document.getElementById('registerBtn')?.addEventListener('click', () => alert('Registro - Próximamente'));
    document.getElementById('mobileToggle')?.addEventListener('click', () => {
        alert('Versión móvil - Los enlaces están en el menú');
    });
});

// Helper para íconos
function getIcon(type) {
    const icons = { 
        pothole: 'road', 
        streetlight: 'lightbulb', 
        trash: 'trash-alt', 
        graffiti: 'spray-can',
        broken_pipes: 'water',
        curb_and_gutter: 'paint-roller'
    };
    return icons[type] || 'exclamation-triangle';
}