async function renderAdminTable() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;
    
    try {
        const search = document.getElementById('adminSearch')?.value || '';
        const status = document.getElementById('statusFilter')?.value || '';
        const reports = await window.api.getReports(search, status);
        
        if (reports.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No hay reportes</td></tr>`;
            return;
        }
        
        tbody.innerHTML = reports.map(report => `
            <tr>
                <td>#${report.id}</td>
                <td>${report.user_name}</td>
                <td>${report.type.toUpperCase()}</td>
                <td>${report.location}</td>
                <td>
                    <select class="status-select" data-id="${report.id}">
                        <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                        <option value="in-progress" ${report.status === 'in-progress' ? 'selected' : ''}>En progreso</option>
                        <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>Resuelto</option>
                    </select>
                </td>
                <td>
                    <button class="delete-btn" data-id="${report.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
        
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async () => {
                try {
                    await window.api.updateReportStatus(select.dataset.id, select.value);
                    alert('Estado actualizado');
                    renderAdminTable();
                } catch (error) {
                    alert('Error al actualizar');
                }
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('¿Eliminar este reporte?')) {
                    try {
                        await window.api.deleteReport(btn.dataset.id);
                        alert('Eliminado');
                        renderAdminTable();
                    } catch (error) {
                        alert('Error al eliminar');
                    }
                }
            });
        });
        
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Error al cargar datos</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('role') !== 'admin') {
        alert('Acceso denegado');
        window.location.href = 'index.html';
        return;
    }
    renderAdminTable();
    document.getElementById('adminSearch')?.addEventListener('input', () => renderAdminTable());
    document.getElementById('statusFilter')?.addEventListener('change', () => renderAdminTable());
});