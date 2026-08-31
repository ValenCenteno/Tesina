const RIO_TERCERO = [-32.1724, -64.1124];

// Zona permitida para CiudadActiva
const RIO_TERCERO_BOUNDS = [
    [-32.23, -64.18], // Suroeste
    [-32.12, -64.04]  // Noreste
];

const ZOOM_DEFAULT = 14;
const ZOOM_MIN = 13;
const ZOOM_MAX = 19;

let map = null;
let markers = [];
let allReports = [];
let activeMarkerId = null;
let searchQuery = '';
let statusFilter = '';


const TYPE_LABELS = {
    calle_rota: 'Calle rota',
    basura: 'Basura',
    luminaria: 'Luminaria',
    cano_roto: 'Caño roto',
    cordon: 'Cordón',
    otro: 'Otro'
};


const TYPE_ICONS = {
    calle_rota: {
        icon: '🚧',
        color: '#f59e0b'
    },
    basura: {
        icon: '🗑️',
        color: '#10b981'
    },
    luminaria: {
        icon: '💡',
        color: '#eab308'
    },
    cano_roto: {
        icon: '💧',
        color: '#3b82f6'
    },
    cordon: {
        color: '#8b5cf6'
    },
    otro: {
        icon: '📍',
        color: '#6b7280'
    }
};


function getTypeKey(type) {
    return (type || '')
        .replace('ñ', 'n')
        .replace('caño_roto', 'cano_roto');
}


function getTypeLabel(type) {
    return TYPE_LABELS[getTypeKey(type)] || 'Otro';
}


function getTypeMeta(type) {
    return TYPE_ICONS[getTypeKey(type)] || TYPE_ICONS.otro;
}


// ============================================================
// Verificar si una coordenada está dentro de la zona permitida
// ============================================================

function isInsideRioTercero(lat, lng) {

    const southWest = RIO_TERCERO_BOUNDS[0];
    const northEast = RIO_TERCERO_BOUNDS[1];

    return (
        lat >= southWest[0] &&
        lat <= northEast[0] &&
        lng >= southWest[1] &&
        lng <= northEast[1]
    );
}


// ============================================================
// Crear ícono SVG personalizado para Leaflet
// ============================================================

function createMarkerIcon(type, isActive = false) {

    const meta = getTypeMeta(type);

    const size = isActive ? 44 : 36;

    const borderColor = isActive
        ? '#1d4ed8'
        : meta.color;

    const shadow = isActive
        ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))'
        : 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))';

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg"
             width="${size}"
             height="${size + 8}"
             viewBox="0 0 44 52">

            <circle
                cx="22"
                cy="22"
                r="19"
                fill="white"
                stroke="${borderColor}"
                stroke-width="${isActive ? 3 : 2.5}"
            />

            <text
                x="22"
                y="28"
                text-anchor="middle"
                font-size="18">
                ${meta.icon || '📍'}
            </text>

            <polygon
                points="22,46 15,35 29,35"
                fill="${borderColor}"
            />

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


// ============================================================
// Formatear fecha
// ============================================================

function formatDate(dateStr) {

    if (!dateStr) return '';

    return new Date(dateStr).toLocaleDateString(
        'es-AR',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }
    );
}


// ============================================================
// Inicializar mapa Leaflet
// ============================================================

function initMap() {

    map = L.map('map', {

        center: RIO_TERCERO,

        zoom: ZOOM_DEFAULT,

        zoomControl: false,

        // No permitir alejar demasiado
        minZoom: ZOOM_MIN,

        // Zoom máximo
        maxZoom: ZOOM_MAX,

        // Limitar desplazamiento a Río Tercero y alrededores
        maxBounds: RIO_TERCERO_BOUNDS,

        // 1 = límite completamente rígido
        maxBoundsViscosity: 1.0
    });


    // Tiles de OpenStreetMap

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }
    ).addTo(map);


    // Controles de zoom

    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);
}


// ============================================================
// Crear popup HTML para un reporte
// ============================================================

function buildPopup(report) {

    const statusLabels = {
        pendiente: 'Pendiente',
        en_proceso: 'En proceso',
        resuelto: 'Resuelto'
    };

    const statusLabel =
        statusLabels[report.status] || report.status;


    // Imagen del reporte
    const imgHTML = report.image
        ? `
            <div class="popup-image-container">

                <img
                    class="popup-img"
                    src="http://localhost:3000${report.image}"
                    alt="${report.title || 'Imagen del reporte'}"
                    loading="lazy"
                    onerror="this.parentElement.style.display='none'"
                >

            </div>
        `
        : '';


    // Bloque "PROBLEMA SOLUCIONADO" + acción de admin
    // (solo si el reporte está resuelto)
    const solutionHTML = buildSolutionBlock(report);


    return `
        <div class="popup-card">

            ${imgHTML}

            <div class="popup-content">

                <h4>
                    ${report.title || getTypeLabel(report.type)}
                </h4>

                <p class="popup-location">

                    <i class="fas fa-map-marker-alt"></i>

                    ${report.location}

                </p>

                <p class="popup-desc">

                    ${(report.description || '').substring(0, 120)}

                    ${
                        report.description &&
                        report.description.length > 120
                            ? '…'
                            : ''
                    }

                </p>


                <div class="popup-footer">

                    <span class="status-tag status-${report.status}">
                        ${statusLabel}
                    </span>

                    <span class="popup-date">
                        ${formatDate(report.created_at)}
                    </span>

                </div>

                ${solutionHTML}

            </div>

        </div>
    `;
}


// ============================================================
// Bloque "PROBLEMA SOLUCIONADO" + acción de admin (popup)
// ============================================================

function buildSolutionBlock(report) {

    if (report.status !== 'resuelto') return '';

    const isAdmin = localStorage.getItem('role') === 'admin';
    const hasSolution = !!report.solution_id;

    const solutionInfoHTML = hasSolution
        ? `
            <div class="solution-block">

                <div class="solution-block-header">
                    <i class="fas fa-check-circle"></i>
                    PROBLEMA SOLUCIONADO
                </div>

                ${
                    report.solution_image
                        ? `<div class="solution-block-photo">
                               <img src="http://localhost:3000${report.solution_image}"
                                    alt="Foto de la solución"
                                    loading="lazy"
                                    onerror="this.parentElement.style.display='none'">
                           </div>`
                        : ''
                }

                <h5 class="solution-block-title">
                    ${report.solution_title}
                </h5>

                <p class="solution-block-desc">
                    ${report.solution_description}
                </p>

                <p class="solution-block-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(report.solution_date)}
                </p>

            </div>
        `
        : '';

    const adminActionHTML = isAdmin
        ? `
            <div class="popup-solution-actions">

                <button
                    type="button"
                    class="popup-solution-btn"
                    data-solution-action
                    data-report-id="${report.id}"
                >

                    <i class="fas fa-wrench"></i>

                    ${hasSolution ? 'Editar solución' : 'Registrar solución'}

                </button>

            </div>
        `
        : '';

    return solutionInfoHTML + adminActionHTML;
}


// ============================================================
// Colocar marcadores en el mapa
// ============================================================

function placeMarkers(reports) {

    // Limpiar marcadores anteriores

    markers.forEach(m => m.remove());

    markers = [];


    reports.forEach(report => {

        // Sin coordenadas → no se puede colocar marcador
        if (
            report.lat == null ||
            report.lng == null
        ) {
            return;
        }


        const lat = parseFloat(report.lat);
        const lng = parseFloat(report.lng);


        // Coordenadas inválidas
        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {
            return;
        }


        // Protección adicional:
        // no mostrar reportes fuera de la zona permitida

        if (!isInsideRioTercero(lat, lng)) {
            return;
        }


        const marker = L.marker(
            [lat, lng],
            {
                icon: createMarkerIcon(report.type)
            }
        );


        marker.bindPopup(
            buildPopup(report),
            {
                maxWidth: 340,
                minWidth: 280
            }
        );


        marker.on('click', () => {

            setActiveReport(
                report.id,
                false
            );

        });


        marker.addTo(map);

        // Guardamos el ID del reporte
        marker._reportId = report.id;

        // IMPORTANTE:
        // Guardamos también el tipo propio de ESTE marcador.
        // Esto evita que todos los marcadores adopten
        // el icono del reporte seleccionado.
        marker._reportType = report.type;

        markers.push(marker);

    });


    // Si hay marcadores, ajustar vista

    if (markers.length > 0) {

        const group =
            L.featureGroup(markers);

        map.fitBounds(
            group.getBounds().pad(0.15),
            {
                maxZoom: 16
            }
        );
    }
}


// ============================================================
// Activar un reporte
// ============================================================

function setActiveReport(
    id,
    scrollToMarker = true
) {

    activeMarkerId = id;


    // Sidebar: resaltar item

    document
        .querySelectorAll('.map-report-item')
        .forEach(el => {

            el.classList.toggle(
                'active',
                el.dataset.id == id
            );

        });


    // Scroll en sidebar al item activo

    const activeEl =
        document.querySelector(
            `.map-report-item[data-id="${id}"]`
        );


    if (activeEl) {

        activeEl.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });

    }


    // Buscar reporte

    const report =
        allReports.find(
            r => r.id == id
        );


    if (!report) return;


    // Actualizar marcador

    markers.forEach(m => {

        const isActive =
            m._reportId == id;


        // IMPORTANTE:
        // Cada marcador usa SU PROPIO tipo,
        // no el tipo del reporte seleccionado.
        m.setIcon(
            createMarkerIcon(
                m._reportType,
                isActive
            )
        );


        if (isActive) {

            if (
                scrollToMarker &&
                report.lat != null &&
                report.lng != null
            ) {

                map.flyTo(
                    [
                        parseFloat(report.lat),
                        parseFloat(report.lng)
                    ],
                    16,
                    {
                        duration: 0.8
                    }
                );

            }


            m.openPopup();

        }

    });
}


// ============================================================
// Renderizar lista del sidebar
// ============================================================

function renderList(reports) {

    const list =
        document.getElementById(
            'mapReportsList'
        );


    if (!list) return;


    if (reports.length === 0) {

        list.innerHTML = `
            <div class="list-empty">

                <i class="fas fa-map-marker-alt"></i>

                <p>
                    No hay reportes para mostrar
                </p>

            </div>
        `;

        return;
    }


    const statusLabels = {
        pendiente: 'Pendiente',
        en_proceso: 'En proceso',
        resuelto: 'Resuelto'
    };


    const typeKey =
        r => getTypeKey(r.type)
            .replace('_', '-');


    list.innerHTML =
        reports.map(r => `

            <div
                class="map-report-item${r.lat == null ? ' no-coords' : ''}"
                data-id="${r.id}"
            >

                <h4>
                    ${r.title || getTypeLabel(r.type)}
                </h4>

                <p class="item-location">

                    <i
                        class="fas fa-map-marker-alt"
                        style="
                            color: var(--primary);
                            font-size:0.7rem
                        "
                    ></i>

                    ${r.location}

                </p>


                <div class="item-meta">

                    <span
                        class="type-badge type-${typeKey(r)}"
                    >
                        ${getTypeLabel(r.type)}
                    </span>

                    <span
                        class="status-tag status-${r.status}"
                    >
                        ${statusLabels[r.status] || r.status}
                    </span>

                    ${
                        r.lat == null
                            ? '<small style="color:#9ca3af;font-size:.68rem">Sin coords</small>'
                            : ''
                    }

                </div>

            </div>

        `).join('');


    // Eventos de los reportes

    document
        .querySelectorAll('.map-report-item')
        .forEach(el => {

            el.addEventListener(
                'click',
                () => {

                    const id =
                        parseInt(el.dataset.id);


                    const report =
                        allReports.find(
                            r => r.id === id
                        );


                    if (
                        report &&
                        report.lat != null &&
                        report.lng != null
                    ) {

                        setActiveReport(
                            id,
                            true
                        );

                    } else {

                        // Sin coordenadas:
                        // solo resaltar

                        document
                            .querySelectorAll(
                                '.map-report-item'
                            )
                            .forEach(
                                e => e.classList.remove(
                                    'active'
                                )
                            );


                        el.classList.add('active');

                    }

                }
            );

        });
}


// ============================================================
// Filtrar reportes
// ============================================================

function applyFilters(
    search = '',
    status = ''
) {

    const q =
        search.toLowerCase().trim();


    return allReports.filter(r => {

        const matchSearch =
            !q ||

            (r.title || '')
                .toLowerCase()
                .includes(q) ||

            (r.location || '')
                .toLowerCase()
                .includes(q) ||

            getTypeLabel(r.type)
                .toLowerCase()
                .includes(q);


        const matchStatus =
            !status ||
            r.status === status;


        return matchSearch && matchStatus;

    });
}


// ============================================================
// Cargar reportes del backend y renderizar mapa + sidebar
// (reutilizable: se usa al iniciar y después de guardar/editar
// una solución, para refrescar la info sin recargar la página)
// ============================================================

async function loadAndRenderReports() {

    try {

        allReports = await window.api.getReports();

        const filtered =
            applyFilters(
                searchQuery,
                statusFilter
            );

        renderList(filtered);

        placeMarkers(filtered);

    } catch (err) {

        console.error(
            'Error al cargar reportes:',
            err
        );


        const list =
            document.getElementById(
                'mapReportsList'
            );


        if (list) {

            list.innerHTML = `

                <div class="list-empty">

                    <i
                        class="fas fa-exclamation-triangle"
                        style="color:#ef4444"
                    ></i>

                    <p>
                        Error al conectar con el servidor
                    </p>

                </div>

            `;

        }
    }
}


// Expuesta para que solucion.js la llame al guardar/editar/eliminar
window.refreshAfterSolutionChange = function () {

    const wasActive = activeMarkerId;

    loadAndRenderReports().then(() => {

        // Si había un marcador activo (el popup abierto donde se
        // registró la solución), lo volvemos a activar para que
        // el admin vea el resultado sin tener que buscarlo de nuevo.

        if (wasActive != null) {

            setActiveReport(
                wasActive,
                false
            );

        }

    });

};


// ============================================================
// Inicialización
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        initMap();


        // Cargar reportes

        await loadAndRenderReports();


        // Si se llegó desde un link tipo mapa.html?report=ID
        // (por ejemplo desde "Soluciones recientes" del inicio),
        // abrir directamente ese reporte.

        const requestedId =
            new URLSearchParams(
                window.location.search
            ).get('report');


        if (requestedId) {

            setActiveReport(
                requestedId,
                true
            );

        }


        // ====================================================
        // Búsqueda con debounce
        // ====================================================

        const searchInput =
            document.getElementById(
                'mapSearch'
            );


        if (searchInput) {

            let timeout;


            searchInput.addEventListener(
                'input',
                e => {

                    clearTimeout(timeout);


                    timeout =
                        setTimeout(
                            () => {

                                searchQuery =
                                    e.target.value;


                                const filtered =
                                    applyFilters(
                                        searchQuery,
                                        statusFilter
                                    );


                                renderList(filtered);

                                placeMarkers(filtered);

                            },
                            280
                        );

                }
            );

        }


        // ====================================================
        // Filtros de estado
        // ====================================================

        document
            .querySelectorAll('.filter-btn')
            .forEach(btn => {

                btn.addEventListener(
                    'click',
                    () => {

                        document
                            .querySelectorAll('.filter-btn')
                            .forEach(
                                b =>
                                    b.classList.remove(
                                        'active'
                                    )
                            );


                        btn.classList.add('active');


                        statusFilter =
                            btn.dataset.status;


                        const filtered =
                            applyFilters(
                                searchQuery,
                                statusFilter
                            );


                        renderList(filtered);

                        placeMarkers(filtered);

                    }
                );

            });

    }
);