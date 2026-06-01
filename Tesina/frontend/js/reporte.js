document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ reporte.js cargado");
    
    const form = document.getElementById('reportForm');
    const photoInput = document.getElementById('photo');
    const preview = document.getElementById('photoPreview');

    if (!form) {
        console.error("❌ No se encontró el formulario");
        return;
    }

    // Previsualización de foto
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (preview) {
                        preview.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        try {
            const type = document.getElementById('problemType').value;
            const description = document.getElementById('description').value;
            const location = document.getElementById('location').value;

            // Validar campos
            if (!description.trim()) {
                alert("Por favor, completa la descripción");
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Reporte';
                return;
            }
            if (!location.trim()) {
                alert("Por favor, completa la ubicación");
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Reporte';
                return;
            }

            // Enviar al backend
            const newReport = await window.api.createReport({
                type: type,
                description: description,
                location: location,
                user: "Usuario Actual"
            });

            console.log("✅ Reporte creado:", newReport);
            alert('¡Reporte enviado! Gracias por colaborar.');
            
            // Limpiar formulario
            form.reset();
            if (preview) preview.innerHTML = '';
            
            // Redirigir al home
            window.location.href = 'index.html';
            
        } catch (error) {
            console.error('Error al enviar reporte:', error);
            alert('Error al enviar el reporte: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Reporte';
        }
    });
});

