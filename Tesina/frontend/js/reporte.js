document.addEventListener('DOMContentLoaded', async () => {
    console.log("✅ reporte.js cargado");
    
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para reportar problemas');
        window.location.href = 'login.html';
        return;
    }
    
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
                // Validar tipo de archivo
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)');
                    photoInput.value = '';
                    if (preview) preview.innerHTML = '';
                    return;
                }
                
                // Validar tamaño (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('La imagen no puede superar los 5MB');
                    photoInput.value = '';
                    if (preview) preview.innerHTML = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (preview) {
                        preview.innerHTML = `<img src="${ev.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 10px;">`;
                    }
                };
                reader.readAsDataURL(file);
            } else {
                if (preview) preview.innerHTML = '';
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
            const title = document.getElementById('title')?.value || type;
            const description = document.getElementById('description').value;
            const location = document.getElementById('location').value;
            const imageFile = document.getElementById('photo')?.files[0];

            // Validar campos
            if (!description || !description.trim()) {
                alert("Por favor, completa la descripción");
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Reporte';
                return;
            }
            if (!location || !location.trim()) {
                alert("Por favor, completa la ubicación");
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Reporte';
                return;
            }

            // Crear FormData para enviar archivo
            const formData = new FormData();
            formData.append('type', type);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('location', location);
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            // Obtener el token para autenticación
            const token = localStorage.getItem('token');
            
            // Enviar al backend con FormData
            const response = await fetch('http://localhost:3000/api/reports', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al crear el reporte');
            }

            const newReport = await response.json();
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