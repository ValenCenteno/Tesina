document.addEventListener('DOMContentLoaded', async () => {
    const recentContainer = document.getElementById('recentProblems');

    if (recentContainer) {
        recentContainer.innerHTML = `
            <div class="state-block state-block-loading" style="grid-column: 1 / -1;">
                <div class="state-block-icon"><i class="fas fa-spinner fa-spin"></i></div>
                <h3 class="state-block-title">Cargando reportes...</h3>
            </div>
        `;
    }

    try {

        const reports = await window.api.getReports();
        const latestReports = reports.slice(0, 6);

        if (recentContainer) {
            if (latestReports.length === 0) {
                recentContainer.innerHTML = `
                    <div class="state-block state-block-empty" style="grid-column: 1 / -1;">
                        <div class="state-block-icon"><i class="fas fa-clipboard-list"></i></div>
                        <h3 class="state-block-title">No hay reportes todavía</h3>
                        <p class="state-block-text">¡Sé el primero en reportar un problema en Río Tercero!</p>
                        <a href="crear-reporte.html" class="btn btn-primary state-block-cta">Crear Reporte</a>
                    </div>
                `;
            } else {
                recentContainer.innerHTML = latestReports.map(report => `
                    <div class="problem-card" onclick="location.href='mapa.html?report=${report.id}'">
                        <div class="problem-image">
                            <i class="fas fa-${getIcon(report.type)}"></i>
                            ${report.image
                                ? `<img src="http://localhost:3000${report.image}"
                                       alt="Foto de ${report.title}"
                                       onerror="this.remove()">`
                                : ''
                            }
                        </div>
                        <div class="problem-content">
                            <h3 class="problem-title">${report.title}</h3>
                            <p class="problem-description">
                                  ${(report.description || '').substring(0, 100)} </p>
                            <div class="problem-meta">
                                <span>${report.location}</span>
                                <span class="status-tag status-${report.status.replace('-', '')}">${report.status.toUpperCase()}</span>
                            </div>
                            ${buildHomeSolutionBlock(report)}
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error al cargar reportes:', error);
        if (recentContainer) {
            recentContainer.innerHTML = `
                <div class="state-block state-block-error" style="grid-column: 1 / -1;">
                    <div class="state-block-icon"><i class="fas fa-triangle-exclamation"></i></div>
                    <h3 class="state-block-title">No se pudieron cargar los reportes</h3>
                    <p class="state-block-text">Asegurate de que el backend esté corriendo en http://localhost:3000</p>
                </div>
            `;
        }
    }

    // Eventos de botones
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
    document.getElementById('registerBtn')?.addEventListener('click', () => {
        window.location.href = 'register.html';
    });
});

function getIcon(type) {
    const icons = {
        calle_rota: 'road',
        basura: 'trash-alt',
        luminaria: 'lightbulb',
        cano_roto: 'water',
        cordon: 'ruler-horizontal',
        otro: 'exclamation-triangle'
    };
    return icons[type] || 'exclamation-triangle';
}

// ============================================================
// Bloque de solución integrado en la card del reporte.
// Reutiliza el mismo estilo visual (.solution-block) que ya se
// usa en el popup del mapa, para no duplicar diseño ni lógica.
// ============================================================

function buildHomeSolutionBlock(report) {

    if (report.status !== 'resuelto' || !report.solution_id) {
        return '';
    }

    return `
        <div class="solution-block">
            <div class="solution-block-header">
                <i class="fas fa-check-circle"></i>
                Problema solucionado
            </div>
            <h5 class="solution-block-title">${report.solution_title || 'Solución registrada'}</h5>
            <p class="solution-block-desc">
                ${(report.solution_description || '').substring(0, 100)}
            </p>
        </div>
    `;
}
