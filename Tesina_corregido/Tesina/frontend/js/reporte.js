const RIO_TERCERO = [-32.1724, -64.1124];

let miniMap    = null;
let pinMarker  = null;
let coordLat   = null;
let coordLng   = null;

document.addEventListener('DOMContentLoaded', () => {
    initMiniMap();
    setupPhotoPreview();
    setupForm();
});

// ── Mini mapa ─────────────────────────────────────────────────
function initMiniMap() {
    const mapEl = document.getElementById('miniMap');
    if (!mapEl || typeof L === 'undefined') return;

    miniMap = L.map('miniMap', {
        center: RIO_TERCERO,
        zoom: 14,
        zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(miniMap);

    // Ícono del pin
    const pinIcon = L.divIcon({
        html: `<div style="
            width: 28px; height: 28px;
            background: #ef4444;
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        "></div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30]
    });

    // Click en el mapa → colocar/mover pin
    miniMap.on('click', (e) => {
        const { lat, lng } = e.latlng;

        coordLat = lat.toFixed(7);
        coordLng = lng.toFixed(7);

        // Actualizar inputs ocultos
        const inputLat = document.getElementById('coordLat');
        const inputLng = document.getElementById('coordLng');
        if (inputLat) inputLat.value = coordLat;
        if (inputLng) inputLng.value = coordLng;

        // Colocar o mover marcador
        if (pinMarker) {
            pinMarker.setLatLng([lat, lng]);
        } else {
            pinMarker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(miniMap);

            // Pin arrastrable: actualizar coords al soltar
            pinMarker.on('dragend', (ev) => {
                const pos = ev.target.getLatLng();
                coordLat = pos.lat.toFixed(7);
                coordLng = pos.lng.toFixed(7);
                if (inputLat) inputLat.value = coordLat;
                if (inputLng) inputLng.value = coordLng;
                showCoordsDisplay(coordLat, coordLng);
            });
        }

        showCoordsDisplay(coordLat, coordLng);
    });

    // Botón "Quitar pin"
    const clearBtn = document.getElementById('clearPin');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (pinMarker) {
                pinMarker.remove();
                pinMarker = null;
            }
            coordLat = null;
            coordLng = null;
            const inputLat = document.getElementById('coordLat');
            const inputLng = document.getElementById('coordLng');
            if (inputLat) inputLat.value = '';
            if (inputLng) inputLng.value = '';

            const display = document.getElementById('coordsDisplay');
            if (display) display.style.display = 'none';
        });
    }
}

function showCoordsDisplay(lat, lng) {
    const display  = document.getElementById('coordsDisplay');
    const textEl   = document.getElementById('coordsText');
    if (!display) return;

    display.style.display = 'flex';
    if (textEl) textEl.textContent = `Lat: ${parseFloat(lat).toFixed(5)}, Lng: ${parseFloat(lng).toFixed(5)}`;
}

// ── Preview de foto ───────────────────────────────────────────
function setupPhotoPreview() {
    const photoInput = document.getElementById('photo');
    const preview    = document.getElementById('photoPreview');
    if (!photoInput) return;

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            if (preview) preview.innerHTML = '';
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showFormAlert('Solo se permiten imágenes (JPG, PNG, GIF, WEBP)', 'danger');
            photoInput.value = '';
            if (preview) preview.innerHTML = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showFormAlert('La imagen no puede superar los 5MB', 'danger');
            photoInput.value = '';
            if (preview) preview.innerHTML = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (preview) {
                preview.innerHTML = `<img src="${ev.target.result}" alt="Vista previa">`;
            }
        };
        reader.readAsDataURL(file);
    });
}

// ── Formulario ────────────────────────────────────────────────
function setupForm() {
    const form = document.getElementById('reportForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn  = form.querySelector('button[type="submit"]');
        const type = document.getElementById('problemType').value;
        const title       = document.getElementById('title')?.value.trim() || '';
        const description = document.getElementById('description').value.trim();
        const location    = document.getElementById('location').value.trim();
        const imageFile   = document.getElementById('photo')?.files[0];
        const lat = document.getElementById('coordLat')?.value;
        const lng = document.getElementById('coordLng')?.value;

        // Validaciones
        if (!type) {
            return showFormAlert('Seleccioná el tipo de problema', 'danger');
        }
        if (!description) {
            return showFormAlert('La descripción es obligatoria', 'danger');
        }
        if (!location) {
            return showFormAlert('La ubicación es obligatoria', 'danger');
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            const formData = new FormData();
            formData.append('type',        type);
            formData.append('title',       title || type);
            formData.append('description', description);
            formData.append('location',    location);
            if (lat) formData.append('lat', lat);
            if (lng) formData.append('lng', lng);
            if (imageFile) formData.append('image', imageFile);

            await window.api.createReport(formData);

            showFormAlert('¡Reporte enviado! Gracias por colaborar. Redirigiendo...', 'success');

            form.reset();
            const preview = document.getElementById('photoPreview');
            if (preview) preview.innerHTML = '';

            // Limpiar pin del mapa
            if (pinMarker) { pinMarker.remove(); pinMarker = null; }
            const display = document.getElementById('coordsDisplay');
            if (display) display.style.display = 'none';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            showFormAlert(error.message || 'Error al enviar el reporte', 'danger');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Reporte';
        }
    });
}

// ── Alertas del formulario ────────────────────────────────────
function showFormAlert(message, type) {
    const container = document.getElementById('formAlert');
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    if (type === 'danger') {
        setTimeout(() => { container.innerHTML = ''; }, 4000);
    }
}