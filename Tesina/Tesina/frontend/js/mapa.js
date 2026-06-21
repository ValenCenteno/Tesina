async function renderMapList(filteredReports = null) {
    const list = document.getElementById('mapReportsList');
    if (!list) return;
    
    try {
        const reports = filteredReports || await window.api.getReports();
        
        if (reports.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-map-marker-alt" style="font-size: 3rem; color: #9ca3af;"></i>
                    <p style="margin-top: 1rem;">No hay reportes para mostrar</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = reports.map(report => `
            <div class="map-report-item" data-id="${report.id}">
                <h4>${report.title}</h4>
                <p>${report.location}</p>
                <small>${new Date(report.createdAt).toLocaleDateString()}</small>
                <span class="status-tag status-${report.status.replace('-', '')}">${report.status.toUpperCase()}</span>
            </div>
        `).join('');
        
        document.querySelectorAll('.map-report-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.map-report-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                console.log(`Mostrar en mapa el reporte ${item.dataset.id}`);
            });
        });
        
    } catch (error) {
        console.error('Error al cargar mapa:', error);
        list.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: red;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                <p>Error al cargar los reportes</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderMapList();
    
    const searchInput = document.getElementById('mapSearch');
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const query = e.target.value.toLowerCase();
                const allReports = await window.api.getReports();
                const filtered = allReports.filter(r => 
                    r.title.toLowerCase().includes(query) || 
                    r.location.toLowerCase().includes(query)
                );
                renderMapList(filtered);
            }, 300);
        });
    }
});