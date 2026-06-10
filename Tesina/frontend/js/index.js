document.addEventListener('DOMContentLoaded', async () => {
    console.log("✅ index.js cargado");
    
    // Cargar reportes recientes
    await loadRecentReports();
});

async function loadRecentReports() {
    const reportsList = document.getElementById('recentReportsList');
    if (!reportsList) return;
    
    try {
        reportsList.innerHTML = '<div class="loading">Cargando reportes...</div>';
        
        const response = await fetch('http://localhost:3000/api/reports');
        if (!response.ok) throw new Error('Error al cargar reportes');
        
        const reports = await response.json();
        
        if (!reports || reports.length === 0) {
            reportsList.innerHTML = '<div class="no-reports">No hay reportes aún. ¡Sé el primero en reportar!</div>';
            return;
        }
        
        // Mostrar solo los últimos 6 reportes
        const recentReports = reports.slice(0, 6);
        
        reportsList.innerHTML = recentReports.map(report => `
            <div class="report-card-item">
                ${report.image ? `
                    <div class="report-image">
                        <img src="http://localhost:3000${report.image}" alt="${report.title}" onerror="this.src='../img/placeholder.png'">
                    </div>
                ` : `
                    <div class="report-image-placeholder">
                        📷 Sin imagen
                    </div>
                `}
                <div class="report-info">
                    <span class="report-type ${getTypeClass(report.type)}">${getTypeText(report.type)}</span>
                    <h3>${escapeHtml(report.title || 'Sin título')}</h3>
                    <p>${escapeHtml(report.description.substring(0, 100))}${report.description.length > 100 ? '...' : ''}</p>
                    <div class="report-meta">
                        <span class="report-location">📍 ${escapeHtml(report.location)}</span>
                        <span class="report-date">📅 ${formatDate(report.created_at)}</span>
                    </div>
                    <span class="report-status status-${report.status}">${getStatusText(report.status)}</span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error al cargar reportes:', error);
        reportsList.innerHTML = '<div class="error">Error al cargar los reportes. Intenta más tarde.</div>';
    }
}

function getTypeClass(type) {
    const types = {
        'calle_rota': 'type-road',
        'basura': 'type-garbage',
        'luminaria': 'type-light',
        'caño_roto': 'type-water',
        'cordon': 'type-curb',
        'otro': 'type-other'
    };
    return types[type] || 'type-other';
}

function getTypeText(type) {
    const types = {
        'calle_rota': '🚧 Calle rota',
        'basura': '🗑️ Basura',
        'luminaria': '💡 Luminaria',
        'caño_roto': '💧 Caño roto',
        'cordon': '🎨 Cordón',
        'otro': '📌 Otro'
    };
    return types[type] || '📌 Otro';
}

function getStatusText(status) {
    const statuses = {
        'pendiente': 'Pendiente',
        'en_proceso': 'En proceso',
        'resuelto': 'Resuelto'
    };
    return statuses[status] || 'Pendiente';
}

function formatDate(dateString) {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}