document.addEventListener('DOMContentLoaded', async () => {
    const recentContainer = document.getElementById('recentProblems');
    
    try {
        
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
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
    document.getElementById('registerBtn')?.addEventListener('click', () => {
        window.location.href = 'register.html';
    });
    document.getElementById('mobileToggle')?.addEventListener('click', () => {
        alert('Versión móvil - Los enlaces están en el menú');
    });

    // ============================================================
    // Soluciones recientes
    // ============================================================

    const recentSolutionsContainer = document.getElementById('recentSolutions');

    if (recentSolutionsContainer) {

        try {

            const solutions = await window.api.solutions.getRecent(6);

            if (solutions.length === 0) {

                recentSolutionsContainer.innerHTML = `
                    <div style="text-align: center; padding: 2.5rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);">
                        <i class="fas fa-check-circle" style="font-size: 2.5rem; color: var(--success);"></i>
                        <p style="margin-top: 1rem; color: var(--gray-600);">Todavía no hay soluciones registradas</p>
                    </div>
                `;

            } else {

                recentSolutionsContainer.innerHTML = solutions.map(sol => `
                    <div class="problem-card" onclick="location.href='mapa.html?report=${sol.report_id}'">
                        <div class="problem-image">
                            <i class="fas fa-check-circle"></i>
                            ${sol.image
                                ? `<img src="http://localhost:3000${sol.image}"
                                       alt="Foto de la solución: ${sol.title}"
                                       onerror="this.remove()">`
                                : ''
                            }
                        </div>
                        <div class="problem-content">
                            <h3 class="problem-title">${sol.title}</h3>
                            <p class="problem-description">
                                ${(sol.description || '').substring(0, 100)}
                            </p>
                            <div class="problem-meta">
                                <span><i class="fas fa-map-marker-alt"></i> ${sol.report_location}</span>
                                <span class="status-tag status-resuelto">RESUELTO</span>
                            </div>
                            <a href="mapa.html?report=${sol.report_id}" class="view-all" style="margin-top: 0.6rem; display: inline-flex;">
                                Ver reporte →
                            </a>
                        </div>
                    </div>
                `).join('');
            }

        } catch (error) {

            console.error('Error al cargar soluciones recientes:', error);

            recentSolutionsContainer.innerHTML = `
                <div style="text-align: center; padding: 2.5rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); color: var(--danger);">
                    <p>Error al cargar las soluciones recientes</p>
                </div>
            `;
        }
    }
});

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