document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');
    const photoInput = document.getElementById('photo');
    const preview = document.getElementById('photoPreview');

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => preview.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newReport = {
            user: "Usuario Actual",
            type: document.getElementById('problemType').value,
            title: document.getElementById('description').value.substring(0, 50),
            description: document.getElementById('description').value,
            location: document.getElementById('location').value,
            image: document.getElementById('problemType').value
        };
        addReport(newReport);
        alert('¡Reporte enviado! Gracias por colaborar.');
        form.reset();
        preview.innerHTML = '';
        window.location.href = 'index.html';
    });
});