function renderMapList(filteredReports = null) {
    const list = document.getElementById('mapReportsList');
    const reportsToShow = filteredReports || getReports();
    list.innerHTML = reportsToShow.map(report => `
        <div class="map-report-item" data-id="${report.id}">
            <h4>${report.title}</h4>
            <p>${report.location}</p>
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
}

document.addEventListener('DOMContentLoaded', () => {
    renderMapList();
    const searchInput = document.getElementById('mapSearch');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = getReports().filter(r => r.title.toLowerCase().includes(query) || r.location.toLowerCase().includes(query));
        renderMapList(filtered);
    });
});