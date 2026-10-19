const RIO_TERCERO = [-32.1724, -64.1124];

// Misma zona geográfica utilizada por el mapa principal
const RIO_TERCERO_BOUNDS = [
    [-32.23, -64.18], // Suroeste
    [-32.12, -64.04]  // Noreste
];

const ZOOM_DEFAULT = 14;
const ZOOM_MIN = 13;
const ZOOM_MAX = 19;

let miniMap = null;
let pinMarker = null;
let coordLat = null;
let coordLng = null;

// Geocodificación por texto (búsqueda de dirección)
let geocodeTimer = null;
let geocodeRequestId = 0;

// Ícono del pin (definido una sola vez, reutilizado por el marcador)
function getPinIcon() {

    return L.divIcon({

        html: `
            <div style="
                width: 28px;
                height: 28px;
                background: #ef4444;
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            "></div>
        `,

        className: '',

        iconSize: [28, 28],

        iconAnchor: [14, 28],

        popupAnchor: [0, -30]

    });

}


document.addEventListener('DOMContentLoaded', () => {

    showFormState('form');

    initMiniMap();

    setupPhotoPreview();

    setupForm();

    setupLocationGeocoding();

});


// ============================================================
// Mini mapa
// ============================================================

function initMiniMap() {

    const mapEl =
        document.getElementById('miniMap');


    if (
        !mapEl ||
        typeof L === 'undefined'
    ) {
        return;
    }


    miniMap = L.map('miniMap', {

        center: RIO_TERCERO,

        zoom: ZOOM_DEFAULT,

        zoomControl: true,

        // No permitir alejarse demasiado

        minZoom: ZOOM_MIN,

        // Zoom máximo

        maxZoom: ZOOM_MAX,

        // Limitar navegación

        maxBounds: RIO_TERCERO_BOUNDS,

        // Límite completamente rígido

        maxBoundsViscosity: 1.0

    });


    // ========================================================
    // Tiles de OpenStreetMap
    // ========================================================

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',

            maxZoom: 19
        }
    ).addTo(miniMap);


    // ========================================================
    // Click en el mapa → colocar/mover pin
    // ========================================================

    miniMap.on('click', (e) => {

        const clickedPoint = e.latlng;


        // Verificar zona

        if (
            !isInsideRioTercero(clickedPoint)
        ) {

            showFormAlert(
                'La ubicación debe estar dentro de Río Tercero.',
                'danger'
            );

            return;
        }


        placePin(
            clickedPoint.lat,
            clickedPoint.lng,
            { pan: false }
        );

    });


    // ========================================================
    // Botón "Quitar pin"
    // ========================================================

    const clearBtn =
        document.getElementById(
            'clearPin'
        );


    if (clearBtn) {

        clearBtn.addEventListener(
            'click',
            () => {

                if (pinMarker) {

                    pinMarker.remove();

                    pinMarker = null;

                }


                coordLat = null;

                coordLng = null;


                const inputLat =
                    document.getElementById(
                        'coordLat'
                    );

                const inputLng =
                    document.getElementById(
                        'coordLng'
                    );


                if (inputLat) {
                    inputLat.value = '';
                }


                if (inputLng) {
                    inputLng.value = '';
                }


                const display =
                    document.getElementById(
                        'coordsDisplay'
                    );


                if (display) {

                    display.style.display =
                        'none';

                }


                setLocationStatus('');

            }
        );

    }

}


// ============================================================
// Colocar o mover el pin en el mapa
// Reutilizada por: click en el mapa, geocodificación por texto.
// (el arrastre del pin ya existente se maneja aparte, ver abajo)
// ============================================================

function placePin(
    lat,
    lng,
    options = {}
) {

    if (!miniMap) return;


    coordLat =
        lat.toFixed(7);

    coordLng =
        lng.toFixed(7);


    // Inputs ocultos

    const inputLat =
        document.getElementById(
            'coordLat'
        );

    const inputLng =
        document.getElementById(
            'coordLng'
        );


    if (inputLat) {
        inputLat.value =
            coordLat;
    }


    if (inputLng) {
        inputLng.value =
            coordLng;
    }


    // ====================================================
    // Colocar o mover marcador
    // ====================================================

    if (pinMarker) {

        pinMarker.setLatLng([
            lat,
            lng
        ]);

    } else {

        pinMarker =
            L.marker(
                [lat, lng],
                {
                    icon: getPinIcon(),
                    draggable: true
                }
            ).addTo(miniMap);


        // =================================================
        // Pin arrastrable
        // =================================================

        pinMarker.on(
            'dragend',
            (ev) => {

                const pos =
                    ev.target.getLatLng();


                // Verificar zona

                if (
                    !isInsideRioTercero(pos)
                ) {

                    // Volver a última posición válida

                    pinMarker.setLatLng([
                        parseFloat(coordLat),
                        parseFloat(coordLng)
                    ]);


                    showFormAlert(
                        'La ubicación debe estar dentro de Río Tercero.',
                        'danger'
                    );


                    return;
                }


                // Guardar nuevas coordenadas

                coordLat =
                    pos.lat.toFixed(7);

                coordLng =
                    pos.lng.toFixed(7);


                if (inputLat) {
                    inputLat.value =
                        coordLat;
                }


                if (inputLng) {
                    inputLng.value =
                        coordLng;
                }


                showCoordsDisplay(
                    coordLat,
                    coordLng
                );

            }
        );

    }


    showCoordsDisplay(
        coordLat,
        coordLng
    );


    if (options.pan) {

        miniMap.setView(
            [lat, lng],
            17,
            { animate: true }
        );

    }

}


// ============================================================
// Verificar si una coordenada está dentro de Río Tercero
// ============================================================

function isInsideRioTercero(latlng) {

    const southWest =
        RIO_TERCERO_BOUNDS[0];

    const northEast =
        RIO_TERCERO_BOUNDS[1];


    return (

        latlng.lat >= southWest[0] &&

        latlng.lat <= northEast[0] &&

        latlng.lng >= southWest[1] &&

        latlng.lng <= northEast[1]

    );

}


// ============================================================
// Mostrar coordenadas
// ============================================================

function showCoordsDisplay(lat, lng) {

    const display =
        document.getElementById(
            'coordsDisplay'
        );

    const textEl =
        document.getElementById(
            'coordsText'
        );


    if (!display) return;


    display.style.display =
        'flex';


    if (textEl) {

        textEl.textContent =
            `Lat: ${parseFloat(lat).toFixed(5)}, Lng: ${parseFloat(lng).toFixed(5)}`;

    }

}


// ============================================================
// Geocodificación por texto (buscar dirección escrita)
// ============================================================
// Al escribir una ubicación, se intenta ubicarla automáticamente
// en el mapa usando Nominatim (OpenStreetMap), respetando la
// misma zona geográfica que ya usa CiudadActiva. No reemplaza el
// click manual en el mapa: el usuario siempre puede ajustar el
// pin a mano después de la búsqueda.
// ============================================================

function setupLocationGeocoding() {

    const locationInput =
        document.getElementById(
            'location'
        );

    if (!locationInput) return;


    locationInput.addEventListener(
        'input',
        (e) => {

            const query =
                e.target.value.trim();


            clearTimeout(geocodeTimer);


            if (!query || query.length < 5) {

                setLocationStatus('');

                return;
            }


            // Evitar una petición por cada tecla escrita

            geocodeTimer =
                setTimeout(
                    () => geocodeLocation(query),
                    700
                );

        }
    );

}


function setLocationStatus(
    message,
    state = ''
) {

    const status =
        document.getElementById(
            'locationStatus'
        );

    if (!status) return;


    if (!message) {

        status.style.display = 'none';

        status.textContent = '';

        status.className = 'location-status';

        return;
    }


    status.textContent = message;

    status.className =
        `location-status location-status-${state}`;

    status.style.display = 'block';

}


async function geocodeLocation(query) {

    if (!miniMap || typeof L === 'undefined') return;


    // Identificador de esta búsqueda: si el usuario sigue
    // escribiendo, las respuestas de búsquedas viejas se ignoran.

    const requestId =
        ++geocodeRequestId;


    setLocationStatus(
        'Buscando ubicación…',
        'searching'
    );


    try {

        // viewbox = izquierda,arriba,derecha,abajo (lon/lat)
        // Limita (no obliga) los resultados a la zona de Río Tercero.

        const southWest = RIO_TERCERO_BOUNDS[0];
        const northEast = RIO_TERCERO_BOUNDS[1];

        const viewbox =
            `${southWest[1]},${northEast[0]},${northEast[1]},${southWest[0]}`;

        const searchQuery =
            `${query}, Río Tercero, Córdoba, Argentina`;

        const url =
            'https://nominatim.openstreetmap.org/search' +
            `?format=json&limit=1&addressdetails=0` +
            `&viewbox=${viewbox}&bounded=1` +
            `&q=${encodeURIComponent(searchQuery)}`;


        const response =
            await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });


        // Si mientras tanto se disparó otra búsqueda más nueva,
        // descartamos esta respuesta.

        if (requestId !== geocodeRequestId) return;


        if (!response.ok) {
            throw new Error('No se pudo consultar el servicio de mapas');
        }


        const results = await response.json();


        if (!results || results.length === 0) {

            setLocationStatus(
                'No se encontró la dirección. Podés marcarla haciendo clic en el mapa.',
                'not-found'
            );

            return;
        }


        const lat = parseFloat(results[0].lat);
        const lng = parseFloat(results[0].lon);


        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            !isInsideRioTercero({ lat, lng })
        ) {

            setLocationStatus(
                'Esa dirección está fuera de Río Tercero. Podés marcarla manualmente.',
                'not-found'
            );

            return;
        }


        placePin(
            lat,
            lng,
            { pan: true }
        );


        setLocationStatus(
            'Ubicación encontrada y marcada en el mapa.',
            'found'
        );

    } catch (error) {

        if (requestId !== geocodeRequestId) return;


        console.error(
            'Error al geocodificar la dirección:',
            error
        );

        // No romper el flujo ni mostrar un alert: el usuario
        // siempre puede marcar el pin a mano en el mapa.

        setLocationStatus(
            'No se pudo buscar la dirección automáticamente. Podés marcarla en el mapa.',
            'not-found'
        );
    }

}


// ============================================================
// Preview de foto
// ============================================================

function setupPhotoPreview() {

    const photoInput =
        document.getElementById(
            'photo'
        );

    const preview =
        document.getElementById(
            'photoPreview'
        );


    if (!photoInput) return;


    photoInput.addEventListener(
        'change',
        (e) => {

            const file =
                e.target.files[0];


            if (!file) {

                if (preview) {
                    preview.innerHTML = '';
                }

                return;

            }


            const allowedTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/webp'
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                showFormAlert(
                    'Solo se permiten imágenes (JPG, PNG, GIF, WEBP)',
                    'danger'
                );


                photoInput.value = '';


                if (preview) {
                    preview.innerHTML = '';
                }


                return;

            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                showFormAlert(
                    'La imagen no puede superar los 5MB',
                    'danger'
                );


                photoInput.value = '';


                if (preview) {
                    preview.innerHTML = '';
                }


                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                (ev) => {

                    if (preview) {

                        preview.innerHTML =
                            `<img src="${ev.target.result}" alt="Vista previa">`;

                    }

                };


            reader.readAsDataURL(file);

        }
    );

}


// ============================================================
// Formulario
// ============================================================

function setupForm() {

    const form =
        document.getElementById(
            'reportForm'
        );


    if (!form) return;


    form.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();


            const btn =
                form.querySelector(
                    'button[type="submit"]'
                );


            const type =
                document.getElementById(
                    'problemType'
                ).value;


            const title =
                document.getElementById(
                    'title'
                )?.value.trim() || '';


            const description =
                document.getElementById(
                    'description'
                ).value.trim();


            const location =
                document.getElementById(
                    'location'
                ).value.trim();


            const imageFile =
                document.getElementById(
                    'photo'
                )?.files[0];


            const lat =
                document.getElementById(
                    'coordLat'
                )?.value;


            const lng =
                document.getElementById(
                    'coordLng'
                )?.value;


            // =================================================
            // Validaciones
            // =================================================

            if (!type) {

                return showFormAlert(
                    'Seleccioná el tipo de problema',
                    'danger'
                );

            }


            if (!description) {

                return showFormAlert(
                    'La descripción es obligatoria',
                    'danger'
                );

            }


            if (!location) {

                return showFormAlert(
                    'La ubicación es obligatoria',
                    'danger'
                );

            }


            // =================================================
            // Verificar coordenadas
            // =================================================

            if (!lat || !lng) {

                return showFormAlert(
                    'Seleccioná una ubicación en el mapa.',
                    'danger'
                );

            }


            // =================================================
            // Verificar nuevamente zona
            // =================================================

            if (
                !isInsideRioTercero({
                    lat: parseFloat(lat),
                    lng: parseFloat(lng)
                })
            ) {

                return showFormAlert(
                    'La ubicación debe estar dentro de Río Tercero.',
                    'danger'
                );

            }


            btn.disabled = true;


            btn.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> Enviando...';


            showFormState('loading');


            try {

                const formData =
                    new FormData();


                formData.append(
                    'type',
                    type
                );


                formData.append(
                    'title',
                    title || type
                );


                formData.append(
                    'description',
                    description
                );


                formData.append(
                    'location',
                    location
                );


                formData.append(
                    'lat',
                    lat
                );


                formData.append(
                    'lng',
                    lng
                );


                if (imageFile) {

                    formData.append(
                        'image',
                        imageFile
                    );

                }


                await window.api.createReport(
                    formData
                );


                showFormState('success');


                form.reset();


                const preview =
                    document.getElementById(
                        'photoPreview'
                    );


                if (preview) {
                    preview.innerHTML = '';
                }


                // Limpiar pin

                if (pinMarker) {

                    pinMarker.remove();

                    pinMarker = null;

                }


                coordLat = null;

                coordLng = null;


                const display =
                    document.getElementById(
                        'coordsDisplay'
                    );


                if (display) {

                    display.style.display =
                        'none';

                }


                setTimeout(
                    () => {

                        window.location.href =
                            'index.html';

                    },
                    2000
                );


            } catch (error) {

                showFormState('form');


                showFormAlert(
                    error.message ||
                    'Error al enviar el reporte',
                    'danger'
                );


                btn.disabled = false;


                btn.innerHTML =
                    '<i class="fas fa-paper-plane"></i> Enviar Reporte';

            }

        }
    );

}


// ============================================================
// Alertas del formulario
// ============================================================

// ============================================================
// Estado visual del formulario: 'form' | 'loading' | 'success'
// ============================================================

function showFormState(state) {

    const views = {
        form: document.getElementById('formView'),
        loading: document.getElementById('loadingView'),
        success: document.getElementById('successView')
    };


    Object.entries(views).forEach(
        ([key, el]) => {

            if (!el) return;

            el.style.display =
                key === state ? 'block' : 'none';

        }
    );

}


function showFormAlert(
    message,
    type
) {

    const container =
        document.getElementById(
            'formAlert'
        );


    if (!container) return;


    container.innerHTML =
        `<div class="alert alert-${type}">${message}</div>`;


    if (type === 'danger') {

        setTimeout(
            () => {

                container.innerHTML = '';

            },
            4000
        );

    }

}

// Microinteracción — mostrar mensaje de éxito

const successMessage = document.getElementById("successMessage");

function mostrarMensajeExito() {
    if (!successMessage) return;

    successMessage.classList.add("visible");

    setTimeout(() => {
        successMessage.classList.remove("visible");
    }, 3000);
}