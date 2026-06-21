document.addEventListener('DOMContentLoaded', () => {

    console.log("✅ reporte.js cargado");

    const form = document.getElementById('reportForm');

    const photoInput = document.getElementById('photo');

    const preview = document.getElementById('photoPreview');

    if (!form) {

        console.error("❌ No se encontró el formulario");

        return;

    }

    // PREVISUALIZACIÓN DE FOTO

    if (photoInput) {

        photoInput.addEventListener('change', (e) => {

            const file = e.target.files[0];

            if (file) {

                const reader = new FileReader();

                reader.onload = (ev) => {

                    if (preview) {

                        preview.innerHTML = `
                            <img
                                src="${ev.target.result}"
                                alt="Preview"
                            >
                        `;

                    }

                };

                reader.readAsDataURL(file);

            }

        });

    }

    // ENVÍO DEL FORMULARIO

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const submitBtn =
            form.querySelector('button[type="submit"]');

        submitBtn.disabled = true;

        submitBtn.textContent = 'Enviando...';

        try {

            const type =
                document.getElementById('problemType').value;

            const description =
                document.getElementById('description').value;

            const location =
                document.getElementById('location').value;

            // VALIDACIONES

            if (!description.trim()) {

                showError(
                    "Por favor, completa la descripción"
                );

                submitBtn.disabled = false;

                submitBtn.textContent =
                    'Enviar Reporte';

                return;

            }

            if (!location.trim()) {

                showError(
                    "Por favor, completa la ubicación"
                );

                submitBtn.disabled = false;

                submitBtn.textContent =
                    'Enviar Reporte';

                return;

            }

            // ENVIAR AL BACKEND

            const newReport =
                await window.api.createReport({

                    type: type,

                    description: description,

                    location: location,

                    user: "Usuario Actual"

                });

            console.log(
                "Reporte creado:",
                newReport
            );

            // MOSTRAR MODAL

            showAlert();

            // LIMPIAR FORMULARIO

            form.reset();

            if (preview) {

                preview.innerHTML = '';

            }

        } catch (error) {

            console.error(
                'Error al enviar reporte:',
                error
            );

            showError(
                'Error al enviar el reporte'
            );

        } finally {

            submitBtn.disabled = false;

            submitBtn.textContent =
                'Enviar Reporte';

        }

    });

});

// MODAL ÉXITO

function showAlert() {

    document.getElementById('customAlert')
        .style.display = 'flex';

}

// CERRAR Y VOLVER AL INICIO

function goHome() {

    window.location.href = 'index.html';

}

// MODAL ERROR

function showError(message) {

    alert(message);

}

document.addEventListener('DOMContentLoaded', () => {

    const closeBtn =
        document.getElementById('closeModalBtn');

    if (closeBtn) {

        closeBtn.addEventListener('click', () => {

            window.location.href = 'index.html';

        });

    }

});