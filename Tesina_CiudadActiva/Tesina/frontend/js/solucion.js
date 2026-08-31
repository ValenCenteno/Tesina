// =============================================================
// CIUDADACTIVA — SOLUCIONES
// Modal para registrar / editar / eliminar la solución de un
// reporte. Se inyecta una sola vez en el DOM y lo reutilizan
// tanto el mapa como el panel de administración.
// Solo se abre para usuarios con rol "admin" (el backend además
// vuelve a validar esto en cada endpoint).
// =============================================================

(function () {

    let currentReportId = null;
    let currentSolutionId = null; // null = registrar, número = editar
    let selectedFile = null;


    // ============================================================
    // Construir el modal una sola vez
    // ============================================================

    function ensureModal() {

        if (document.getElementById('solutionModalOverlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'solution-modal-overlay';
        overlay.id = 'solutionModalOverlay';

        overlay.innerHTML = `
            <div class="solution-modal">

                <div class="solution-modal-header">
                    <h3>
                        <i class="fas fa-check-circle"></i>
                        <span id="solutionModalTitle">Registrar solución</span>
                    </h3>
                    <button type="button" class="solution-modal-close" id="solutionModalClose" aria-label="Cerrar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div id="solutionModalAlert"></div>

                <form id="solutionForm">

                    <div class="form-group">
                        <label for="solutionTitle">Título</label>
                        <input type="text" id="solutionTitle" required maxlength="255"
                               placeholder="Ej: Reparación de calle">
                    </div>

                    <div class="form-group">
                        <label for="solutionDescription">Descripción</label>
                        <textarea id="solutionDescription" required rows="4"
                                  placeholder="¿Qué se hizo para solucionar el problema?"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="solutionDate">Fecha de solución</label>
                        <input type="date" id="solutionDate" required>
                    </div>

                    <div class="form-group">
                        <label for="solutionPhoto">Foto de la solución</label>
                        <input type="file" id="solutionPhoto"
                               accept="image/jpeg,image/jpg,image/png,image/gif,image/webp">
                        <div id="solutionPhotoPreview" class="photo-preview"></div>
                    </div>

                    <div class="solution-modal-actions">
                        <button type="button" class="delete-btn" id="solutionDeleteBtn" style="display:none;">
                            <i class="fas fa-trash"></i> Eliminar solución
                        </button>
                        <div class="solution-modal-actions-right">
                            <button type="button" class="btn btn-outline" id="solutionCancelBtn">Cancelar</button>
                            <button type="submit" class="btn btn-primary" id="solutionSaveBtn">Guardar solución</button>
                        </div>
                    </div>

                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        document.getElementById('solutionModalClose').addEventListener('click', closeModal);
        document.getElementById('solutionCancelBtn').addEventListener('click', closeModal);

        document.getElementById('solutionPhoto').addEventListener('change', handlePhotoChange);
        document.getElementById('solutionForm').addEventListener('submit', handleSubmit);
        document.getElementById('solutionDeleteBtn').addEventListener('click', handleDelete);
    }


    // ============================================================
    // Preview de la foto
    // ============================================================

    function handlePhotoChange(e) {

        const file = e.target.files[0];
        const preview = document.getElementById('solutionPhotoPreview');

        selectedFile = file || null;

        if (!file) {
            preview.innerHTML = '';
            return;
        }

        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (!allowed.includes(file.type)) {
            showModalAlert('Solo se permiten imágenes (JPG, PNG, GIF, WEBP)', 'danger');
            e.target.value = '';
            selectedFile = null;
            preview.innerHTML = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showModalAlert('La imagen no puede superar los 5MB', 'danger');
            e.target.value = '';
            selectedFile = null;
            preview.innerHTML = '';
            return;
        }

        const reader = new FileReader();

        reader.onload = (ev) => {
            preview.innerHTML = `<img src="${ev.target.result}" alt="Vista previa">`;
        };

        reader.readAsDataURL(file);
    }


    // ============================================================
    // Alertas dentro del modal
    // ============================================================

    function showModalAlert(message, type = 'danger') {

        const container = document.getElementById('solutionModalAlert');

        if (!container) return;

        container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    }


    // ============================================================
    // Abrir / cerrar
    // ============================================================

    function closeModal() {

        const overlay = document.getElementById('solutionModalOverlay');

        if (overlay) overlay.classList.remove('open');

        document.body.classList.remove('solution-modal-open');

        selectedFile = null;
    }


    async function openModal(reportId) {

        // Solo administradores pueden abrir este modal.
        // (El backend vuelve a exigir esto en cada endpoint, esto
        // es solo para no mostrar el modal a quien no corresponde.)
        if (localStorage.getItem('role') !== 'admin') return;

        ensureModal();

        currentReportId = reportId;
        currentSolutionId = null;
        selectedFile = null;

        document.getElementById('solutionForm').reset();
        document.getElementById('solutionPhotoPreview').innerHTML = '';
        document.getElementById('solutionModalAlert').innerHTML = '';
        document.getElementById('solutionDeleteBtn').style.display = 'none';
        document.getElementById('solutionModalTitle').textContent = 'Registrar solución';

        const overlay = document.getElementById('solutionModalOverlay');
        overlay.classList.add('open');
        document.body.classList.add('solution-modal-open');

        // Si el reporte ya tiene una solución, precargar el formulario (modo edición)
        try {

            const res = await window.api.getReport(reportId);
            const report = res.data || res;

            if (report.solution_id) {

                currentSolutionId = report.solution_id;

                document.getElementById('solutionModalTitle').textContent = 'Editar solución';
                document.getElementById('solutionTitle').value = report.solution_title || '';
                document.getElementById('solutionDescription').value = report.solution_description || '';

                document.getElementById('solutionDate').value = report.solution_date
                    ? String(report.solution_date).substring(0, 10)
                    : '';

                if (report.solution_image) {
                    document.getElementById('solutionPhotoPreview').innerHTML =
                        `<img src="http://localhost:3000${report.solution_image}" alt="Foto actual de la solución">`;
                }

                document.getElementById('solutionDeleteBtn').style.display = '';
            }

        } catch (err) {
            console.error('Error cargando la solución existente:', err);
        }
    }


    // ============================================================
    // Guardar (crear o editar)
    // ============================================================

    async function handleSubmit(e) {

        e.preventDefault();

        const title = document.getElementById('solutionTitle').value.trim();
        const description = document.getElementById('solutionDescription').value.trim();
        const solved_date = document.getElementById('solutionDate').value;

        if (!title || !description || !solved_date) {
            showModalAlert('Completá todos los campos obligatorios', 'danger');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('solved_date', solved_date);

        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        const saveBtn = document.getElementById('solutionSaveBtn');
        const originalText = saveBtn.innerHTML;

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {

            if (currentSolutionId) {
                await window.api.solutions.update(currentSolutionId, formData);
            } else {
                await window.api.solutions.create(currentReportId, formData);
            }

            closeModal();

            if (typeof window.refreshAfterSolutionChange === 'function') {
                window.refreshAfterSolutionChange();
            }

        } catch (err) {

            showModalAlert(err.message || 'Error al guardar la solución', 'danger');

        } finally {

            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }


    // ============================================================
    // Eliminar solución
    // ============================================================

    async function handleDelete() {

        if (!currentSolutionId) return;

        const sure = confirm(
            '¿Eliminar esta solución? El reporte seguirá marcado como resuelto, ' +
            'pero se va a perder la información de cómo se solucionó.'
        );

        if (!sure) return;

        try {

            await window.api.solutions.delete(currentSolutionId);

            closeModal();

            if (typeof window.refreshAfterSolutionChange === 'function') {
                window.refreshAfterSolutionChange();
            }

        } catch (err) {
            showModalAlert(err.message || 'Error al eliminar la solución', 'danger');
        }
    }


    // API pública
    window.solucionModal = {
        open: openModal,
        close: closeModal
    };


    // ============================================================
    // Delegación de eventos: los botones "Registrar/Editar solución"
    // viven dentro de contenido generado dinámicamente (popups de
    // Leaflet, filas de la tabla de admin), así que se escuchan acá.
    // ============================================================

    document.addEventListener('click', (e) => {

        const btn = e.target.closest('[data-solution-action]');

        if (!btn) return;

        const reportId = btn.dataset.reportId;

        if (!reportId) return;

        window.solucionModal.open(reportId);
    });

})();
