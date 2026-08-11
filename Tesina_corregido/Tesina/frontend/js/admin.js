async function renderAdminTable() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;
    
    try {
        const searchInput = document.getElementById('adminSearch');
        const statusFilter = document.getElementById('statusFilter');
        
        const reports = await window.api.getReports(
            searchInput?.value || '', 
            statusFilter?.value || ''
        );
        
        if (reports.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem;">
                        <i class="fas fa-inbox" style="font-size: 3rem; color: #9ca3af;"></i>
                        <p style="margin-top: 1rem;">No hay reportes para mostrar</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = reports.map(report => `
            <tr>
                <td>#${report.id}</td>
                <td>${report.username || report.user || 'Usuario'}</td>
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
        
        // Eventos para cambiar estado
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                try {
                    await window.api.updateReportStatus(select.dataset.id, select.value);
                    alert('Estado actualizado correctamente');
                    await renderAdminTable();
                } catch (error) {
                    alert('Error al actualizar estado: ' + error.message);
                }
            });
        });
        
        // Eventos para eliminar
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('¿Eliminar este reporte?')) {
                    try {
                        await window.api.deleteReport(btn.dataset.id);
                        alert('Reporte eliminado');
                        await renderAdminTable();
                    } catch (error) {
                        alert('Error al eliminar: ' + error.message);
                    }
                }
            });
        });
        
    } catch (error) {
        console.error('Error al cargar admin:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: red;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                    <p style="margin-top: 1rem;">Error al conectar con el servidor</p>
                </td>
            </tr>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderAdminTable();
    
    const searchInput = document.getElementById('adminSearch');
    const statusFilter = document.getElementById('statusFilter');
    const clearAllBtn = document.getElementById('clearAllBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => renderAdminTable());
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', () => renderAdminTable());
    }
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', async () => {
            if (confirm('¿Eliminar TODOS los reportes? Esta acción no se puede deshacer.')) {
                try {
                    await window.api.deleteAllReports();
                    alert('Todos los reportes han sido eliminados');
                    await renderAdminTable();
                } catch (error) {
                    alert('Error al eliminar: ' + error.message);
                }
            }
        });
    }
});