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
                    <td colspan="7" style="text-align: center; padding: 3rem;">
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

                <td>
                    ${report.image
                        ? `<img class="admin-thumb" src="http://localhost:3000${report.image}"
                               alt="Foto del reporte #${report.id}"
                               onclick="window.open('http://localhost:3000${report.image}', '_blank')"
                               onerror="this.replaceWith(Object.assign(document.createElement('span'), {className:'admin-thumb-empty', textContent:'Sin foto'}))">`
                        : `<span class="admin-thumb-empty">Sin foto</span>`
                    }
                </td>

                <td>${report.username || report.user || 'Usuario'}</td>

                <td>${report.type.toUpperCase()}</td>

                <td>${report.location}</td>

                <td>
                    <select class="status-select" data-id="${report.id}">
                        <option value="pendiente" ${report.status === 'pendiente' ? 'selected' : ''}>
                            Pendiente
                        </option>

                        <option value="en_proceso" ${report.status === 'en_proceso' ? 'selected' : ''}>
                            En progreso
                        </option>

                        <option value="resuelto" ${report.status === 'resuelto' ? 'selected' : ''}>
                            Resuelto
                        </option>
                    </select>
                </td>

                <td>
                    <div class="admin-actions">

                        ${
                            report.status === 'resuelto'
                                ? `<button
                                       class="solution-btn"
                                       data-solution-action
                                       data-report-id="${report.id}"
                                   >
                                       <i class="fas fa-wrench"></i>
                                       ${report.solution_id ? 'Editar solución' : 'Solución'}
                                   </button>`
                                : ''
                        }

                        <button class="delete-btn" data-id="${report.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>

                    </div>
                </td>
            </tr>
        `).join('');

        // Cambiar estado
        document.querySelectorAll('.status-select').forEach(select => {

            select.addEventListener('change', async () => {

                try {
                    await window.api.updateReportStatus(
                        select.dataset.id,
                        select.value
                    );

                    showAdminAlert(
                        '<i class="fas fa-check-circle"></i> Estado actualizado correctamente',
                        'success'
                    );

                    await renderAdminTable();

                } catch (error) {

                    showAdminAlert(
                        `<i class="fas fa-exclamation-circle"></i> Error al actualizar estado: ${error.message}`,
                        'danger'
                    );
                }
            });
        });

        // Eliminar reporte
        document.querySelectorAll('.delete-btn').forEach(btn => {

            btn.addEventListener('click', async () => {

                showDeleteConfirmation(btn.dataset.id);

            });
        });

    } catch (error) {

        console.error('Error al cargar admin:', error);

        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: red;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                    <p style="margin-top: 1rem;">
                        Error al conectar con el servidor
                    </p>
                </td>
            </tr>
        `;
    }
}


// ============================================================
// ALERTAS DEL ADMIN
// ============================================================

function showAdminAlert(message, type = 'success') {

    const container = document.getElementById('adminAlert');

    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;

    setTimeout(() => {
        container.innerHTML = '';
    }, 3500);
}


// ============================================================
// CONFIRMACIÓN DE ELIMINACIÓN
// ============================================================

function showDeleteConfirmation(id) {

    const container = document.getElementById('adminAlert');

    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-warning">

            <div class="admin-confirm">

                <span>
                    <i class="fas fa-exclamation-triangle"></i>
                    ¿Estás seguro de eliminar este reporte?
                </span>

                <div class="admin-confirm-buttons">

                    <button class="cancel-delete" id="cancelDelete">
                        Cancelar
                    </button>

                    <button class="confirm-delete" id="confirmDelete">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>

                </div>

            </div>

        </div>
    `;

    document.getElementById('cancelDelete').addEventListener('click', () => {
        container.innerHTML = '';
    });

    document.getElementById('confirmDelete').addEventListener('click', async () => {

        try {

            await window.api.deleteReport(id);

            showAdminAlert(
                '<i class="fas fa-check-circle"></i> Reporte eliminado correctamente',
                'success'
            );

            await renderAdminTable();

        } catch (error) {

            showAdminAlert(
                `<i class="fas fa-exclamation-circle"></i> Error al eliminar: ${error.message}`,
                'danger'
            );
        }
    });
}


// ============================================================
// Refrescar tabla después de guardar/editar/eliminar una solución
// (llamado por solucion.js)
// ============================================================

window.refreshAfterSolutionChange = function () {
    renderAdminTable();
};


// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    renderAdminTable();

    const searchInput = document.getElementById('adminSearch');
    const statusFilter = document.getElementById('statusFilter');
    const clearAllBtn = document.getElementById('clearAllBtn');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderAdminTable();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            renderAdminTable();
        });
    }

    if (clearAllBtn) {

        clearAllBtn.addEventListener('click', () => {

            const container = document.getElementById('adminAlert');

            if (!container) return;

            container.innerHTML = `
                <div class="alert alert-warning">

                    <div class="admin-confirm">

                        <span>
                            <i class="fas fa-exclamation-triangle"></i>
                            ¿Eliminar TODOS los reportes? Esta acción no se puede deshacer.
                        </span>

                        <div class="admin-confirm-buttons">

                            <button class="cancel-delete" id="cancelDeleteAll">
                                Cancelar
                            </button>

                            <button class="confirm-delete" id="confirmDeleteAll">
                                <i class="fas fa-trash"></i>
                                Eliminar todos
                            </button>

                        </div>

                    </div>

                </div>
            `;

            document.getElementById('cancelDeleteAll').addEventListener('click', () => {
                container.innerHTML = '';
            });

            document.getElementById('confirmDeleteAll').addEventListener('click', async () => {

                try {

                    await window.api.deleteAllReports();

                    showAdminAlert(
                        '<i class="fas fa-check-circle"></i> Todos los reportes han sido eliminados',
                        'success'
                    );

                    await renderAdminTable();

                } catch (error) {

                    showAdminAlert(
                        `<i class="fas fa-exclamation-circle"></i> Error al eliminar: ${error.message}`,
                        'danger'
                    );
                }
            });
        });
    }
});