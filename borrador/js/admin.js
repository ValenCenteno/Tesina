function renderAdminTable(filteredReports = null) {
    const tbody = document.getElementById('adminTableBody');
    const reportsToShow = filteredReports || getReports();
    tbody.innerHTML = reportsToShow.map(report => `
        <tr>
            <td>#${report.id}</td>
            <td>${report.user}</td>
            <td>${report.type.toUpperCase()}</td>
            <td>${report.location}</td>
            <td>
                <select class="status-select" data-id="${report.id}">
                    <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                    <option value="in-progress" ${report.status === 'in-progress' ? 'selected' : ''}>En progreso</option>
                    <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>Resuelto</option>
                </select>
            </td>
            <td><button class="delete-btn" data-id="${report.id}">Eliminar</button></td>
        </tr>
    `).join('');

    // Eventos de cambio de estado
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', (e) => {
            updateReportStatus(select.dataset.id, select.value);
            renderAdminTable();
            alert('Estado actualizado');
        });
    });

    // Eventos de eliminar
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('¿Eliminar este reporte?')) {
                deleteReportById(btn.dataset.id);
                renderAdminTable();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderAdminTable();

    const searchInput = document.getElementById('adminSearch');
    const statusFilter = document.getElementById('statusFilter');

    function filterAndRender() {
        const query = searchInput.value.toLowerCase();
        const status = statusFilter.value;
        let filtered = getReports();
        if (query) {
            filtered = filtered.filter(r => r.user.toLowerCase().includes(query) || r.location.toLowerCase().includes(query));
        }
        if (status) {
            filtered = filtered.filter(r => r.status === status);
        }
        renderAdminTable(filtered);
    }

    searchInput.addEventListener('input', filterAndRender);
    statusFilter.addEventListener('change', filterAndRender);
});