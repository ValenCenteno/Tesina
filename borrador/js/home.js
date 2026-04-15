document.addEventListener('DOMContentLoaded', () => {
    const recentContainer = document.getElementById('recentProblems');
    const latestReports = getReports().slice(0, 3);
    
    recentContainer.innerHTML = latestReports.map(report => `
        <div class="problem-card" onclick="location.href='mapa.html'">
            <div class="problem-image">
                <i class="fas fa-${getIcon(report.type)}"></i>
            </div>
            <div class="problem-content">
                <h3 class="problem-title">${report.title}</h3>
                <p class="problem-description">${report.description}</p>
                <div class="problem-meta">
                    <span>${report.location}</span>
                    <span class="status-tag status-${report.status.replace('-', '')}">${report.status.toUpperCase()}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Eventos de botones (demo)
    document.getElementById('loginBtn')?.addEventListener('click', () => alert('Login - Demo'));
    document.getElementById('registerBtn')?.addEventListener('click', () => alert('Registro - Demo'));
    document.getElementById('mobileToggle')?.addEventListener('click', () => alert('Menú móvil (demo)'));
});