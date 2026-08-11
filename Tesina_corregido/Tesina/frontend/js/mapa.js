const RIO_TERCERO = [-32.1724, -64.1124];
const ZOOM_DEFAULT = 14;

let map = null;
let markers = [];
let allReports = [];
let activeMarkerId = null;


const TYPE_LABELS = {
    calle_rota: 'Calle rota',
    basura:     'Basura',
    luminaria:  'Luminaria',
    cano_roto:  'Caño roto',
    cordon:     'Cordón',
    otro:       'Otro'
};

function getTypeKey(type) {
    return (type || '').replace('ñ', 'n').replace('caño_roto', 'cano_roto');
}

function getTypeLabel(type) {
    return TYPE_LABELS[getTypeKey(type)] || 'Otro';
}

function getTypeMeta(type) {
    return TYPE_ICONS[getTypeKey(type)] || TYPE_ICONS.otro;
}

// Crear ícono SVG personalizado para Leaflet
function createMarkerIcon(type, isActive = false) {
    const meta = getTypeMeta(type);
    const size = isActive ? 44 : 36;
    const borderColor = isActive ? '#1d4ed8' : meta.color;
    const shadow = isActive ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))';

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 44 52">
            <circle cx="22" cy="22" r="19" fill="white" stroke="${borderColor}" stroke-width="${isActive ? 3 : 2.5}"/>
            <text x="22" y="28" text-anchor="middle" font-size="18">${meta.icon}</text>
            <polygon points="22,46 15,35 29,35" fill="${borderColor}"/>
        </svg>
    `;

    return L.divIcon({
        html: `<div style="filter:${shadow}">${svg}</div>`,
        className: '',
        iconSize: [size, size + 8],
        iconAnchor: [size / 2, size + 8],
        popupAnchor: [0, -(size + 8)]
    });
}

// Formatear fecha
function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Inicializar mapa Leaflet
function initMap() {
    map = L.map('map', {
        center: RIO_TERCERO,
        zoom: ZOOM_DEFAULT,
        zoomControl: false
    });

    // Tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);

    // Controles de zoom en posición correcta
    L.control.zoom({ position: 'bottomright' }).addTo(map);
}

// Crear popup HTML para un reporte
function buildPopup(report) {
    const meta = getTypeMeta(report.type);
    const statusLabels = { pendiente: 'Pendiente', en_proceso: 'En proceso', resuelto: 'Resuelto' };
    const statusLabel = statusLabels[report.status] || report.status;

    const imgHTML = report.image
        ? `<img class="popup-img" src="http://localhost:3000${report.image}" alt="${report.title || ''}" onerror="this.style.display='none'">`
        : '';

    return `
        <div>
            ${imgHTML}
            <div class="popup-card">
                <h4>${report.title || getTypeLabel(report.type)}</h4>
                <p class="popup-location"><i class="fas fa-map-marker-alt"></i> ${report.location}</p>
                <p class="popup-desc">${(report.description || '').substring(0, 120)}${report.description && report.description.length > 120 ? '…' : ''}</p>
                <div class="popup-footer">
                    <span class="status-tag status-${report.status}">${statusLabel}</span>
                    <span class="popup-date">${formatDate(report.created_at)}</span>
                </div>
            </div>
        </div>
    `;
}

// Colocar marcadores en el mapa
function placeMarkers(reports) {
    // Limpiar marcadores anteriores
    markers.forEach(m => m.remove());
    markers = [];

    reports.forEach(report => {
        if (report.lat == null || report.lng == null) return;

        const marker = L.marker([report.lat, report.lng], {
            icon: createMarkerIcon(report.type)
        });

        marker.bindPopup(buildPopup(report), { maxWidth: 300 });

        marker.on('click', () => {
            setActiveReport(report.id, false);
        });

        marker.addTo(map);
        marker._reportId = report.id;
        markers.push(marker);
    });

    // Si hay marcadores, ajustar vista para que entren todos
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 16 });
    }
}

// Activar un reporte: resalta en sidebar + vuela al marcador
function setActiveReport(id, scrollToMarker = true) {
    activeMarkerId = id;

    // Sidebar: resaltar item
    document.querySelectorAll('.map-report-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id == id);
    });

    // Scroll en sidebar al item activo
    const activeEl = document.querySelector(`.map-report-item[data-id="${id}"]`);
    if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Marcador: actualizar ícono y abrir popup
    const report = allReports.find(r => r.id == id);
    if (!report) return;

    markers.forEach(m => {
        const isActive = m._reportId == id;
        m.setIcon(createMarkerIcon(report.type, isActive));
        if (isActive) {
            if (scrollToMarker && report.lat != null && report.lng != null) {
                map.flyTo([report.lat, report.lng], 16, { duration: 0.8 });
            }
            m.openPopup();
        }
    });
}

// Renderizar lista del sidebar
function renderList(reports) {
    const list = document.getElementById('mapReportsList');
    if (!list) return;

    if (reports.length === 0) {
        list.innerHTML = `
            <div class="list-empty">
                <i class="fas fa-map-marker-alt"></i>
                <p>No hay reportes para mostrar</p>
            </div>`;
        return;
    }

    const statusLabels = { pendiente: 'Pendiente', en_proceso: 'En proceso', resuelto: 'Resuelto' };
    const typeKey = r => getTypeKey(r.type).replace('_', '-');

    list.innerHTML = reports.map(r => `
        <div class="map-report-item${r.lat == null ? ' no-coords' : ''}" data-id="${r.id}">
            <h4>${r.title || getTypeLabel(r.type)}</h4>
            <p class="item-location">
                <i class="fas fa-map-marker-alt" style="color: var(--primary); font-size:0.7rem"></i>
                ${r.location}
            </p>
            <div class="item-meta">
                <span class="type-badge type-${typeKey(r)}">${getTypeLabel(r.type)}</span>
                <span class="status-tag status-${r.status}">${statusLabels[r.status] || r.status}</span>
                ${r.lat == null ? '<small style="color:#9ca3af;font-size:.68rem">Sin coords</small>' : ''}
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.map-report-item').forEach(el => {
        el.addEventListener('click', () => {
            const id = parseInt(el.dataset.id);
            const report = allReports.find(r => r.id === id);
            if (report && report.lat != null) {
                setActiveReport(id, true);
            } else {
                // Sin coordenadas: solo resaltar en sidebar
                document.querySelectorAll('.map-report-item').forEach(e => e.classList.remove('active'));
                el.classList.add('active');
            }
        });
    });
}

// Filtrar reportes por texto + estado
function applyFilters(search = '', status = '') {
    const q = search.toLowerCase().trim();
    return allReports.filter(r => {
        const matchSearch = !q ||
            (r.title || '').toLowerCase().includes(q) ||
            (r.location || '').toLowerCase().includes(q) ||
            getTypeLabel(r.type).toLowerCase().includes(q);
        const matchStatus = !status || r.status === status;
        return matchSearch && matchStatus;
    });
}

// ── Inicialización ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    initMap();

    let searchQuery = '';
    let statusFilter = '';

    // Cargar reportes
    try {
        allReports = await window.api.getReports();
        renderList(allReports);
        placeMarkers(allReports);
    } catch (err) {
        console.error('Error al cargar reportes:', err);
        document.getElementById('mapReportsList').innerHTML = `
            <div class="list-empty">
                <i class="fas fa-exclamation-triangle" style="color:#ef4444"></i>
                <p>Error al conectar con el servidor</p>
            </div>`;
    }

    // Búsqueda con debounce
    const searchInput = document.getElementById('mapSearch');
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', e => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                searchQuery = e.target.value;
                const filtered = applyFilters(searchQuery, statusFilter);
                renderList(filtered);
                placeMarkers(filtered);
            }, 280);
        });
    }

    // Filtros de estado
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            statusFilter = btn.dataset.status;
            const filtered = applyFilters(searchQuery, statusFilter);
            renderList(filtered);
            placeMarkers(filtered);
        });
    });
});