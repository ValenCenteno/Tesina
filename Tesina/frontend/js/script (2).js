// ==================== CONFIGURACIÓN ====================
const API_URL = 'http://localhost:3000/api';
let currentAuthMode = 'registro';

// ==================== TOAST ====================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ==================== AUTH MODAL ====================
function showAuthModal(mode) {
  currentAuthMode = mode;
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('active');
  updateAuthUI();
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('active');
}

function toggleAuthMode(e) {
  if (e) e.preventDefault();
  currentAuthMode = currentAuthMode === 'login' ? 'registro' : 'login';
  updateAuthUI();
}

function updateAuthUI() {
  const nombreGroup = document.getElementById('nombreGroup');
  const title = document.getElementById('authTitle');
  const btnText = document.getElementById('authBtnText');
  const switchText = document.getElementById('authSwitchText');
  const switchLink = document.getElementById('authSwitchLink');

  if (currentAuthMode === 'login') {
    if (nombreGroup) nombreGroup.style.display = 'none';
    if (title) title.textContent = 'Iniciar Sesión';
    if (btnText) btnText.textContent = 'Iniciar Sesión';
    if (switchText) switchText.textContent = '¿No tienes cuenta?';
    if (switchLink) switchLink.textContent = 'Regístrate';
  } else {
    if (nombreGroup) nombreGroup.style.display = 'block';
    if (title) title.textContent = 'Registrarse';
    if (btnText) btnText.textContent = 'Crear Cuenta';
    if (switchText) switchText.textContent = '¿Ya tienes cuenta?';
    if (switchLink) switchLink.textContent = 'Inicia sesión';
  }
}

// ==================== AUTH HANDLER ====================
function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const nombre = document.getElementById('authNombre')?.value || '';

  const endpoint = currentAuthMode === 'login' ? '/auth/login' : '/auth/registro';
  const body = currentAuthMode === 'login' 
    ? { email, password } 
    : { nombre, email, password };

  fetch(API_URL + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(r => r.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast(currentAuthMode === 'login' ? 'Sesión iniciada' : 'Cuenta creada', 'success');
      closeAuthModal();
      updateUserUI();
    } else {
      showToast(data.error || 'Error', 'error');
    }
  })
  .catch(() => {
    // Modo demo sin backend
    showToast(currentAuthMode === 'login' ? 'Sesión iniciada (demo)' : 'Cuenta creada (demo)', 'success');
    localStorage.setItem('user', JSON.stringify({ nombre: nombre || 'Usuario', email, rol: 'usuario' }));
    closeAuthModal();
    updateUserUI();
  });
}

// ==================== CREAR REPORTE ====================
function handleCreateReport(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('titulo', document.getElementById('titulo').value);
  formData.append('tipo', document.getElementById('tipo').value);
  formData.append('descripcion', document.getElementById('descripcion').value);
  formData.append('direccion', document.getElementById('direccion').value);
  
  const latInput = document.getElementById('latitud');
  const lngInput = document.getElementById('longitud');
  if (latInput?.value) formData.append('latitud', latInput.value);
  if (lngInput?.value) formData.append('longitud', lngInput.value);

  const imagen = document.getElementById('imagen')?.files[0];
  if (imagen) formData.append('imagen', imagen);

  if (token) {
    fetch(API_URL + '/reportes', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    })
    .then(r => r.json())
    .then(data => {
      if (data.id) {
        showToast('Reporte creado exitosamente', 'success');
        setTimeout(() => window.location.href = 'reportes-mapa.html', 1500);
      } else {
        showToast(data.error || 'Error al crear reporte', 'error');
      }
    })
    .catch(() => {
      showToast('Reporte creado (modo demo)', 'success');
      setTimeout(() => window.location.href = 'reportes-mapa.html', 1500);
    });
  } else {
    showToast('Reporte creado (modo demo)', 'success');
    setTimeout(() => window.location.href = 'reportes-mapa.html', 1500);
  }
}

// ==================== UI HELPERS ====================
function updateUserUI() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const btnRegistro = document.getElementById('btnRegistro');
  if (btnRegistro && user) {
    btnRegistro.textContent = user.nombre || 'Mi Cuenta';
    btnRegistro.onclick = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showToast('Sesión cerrada', 'success');
      btnRegistro.textContent = 'Registrarse';
      btnRegistro.onclick = () => showAuthModal('registro');
    };
  }
}

function toggleMobileMenu() {
  const nav = document.querySelector('.nav-links');
  if (nav) nav.classList.toggle('show-mobile');
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', (e) => {
  const modal = document.getElementById('authModal');
  if (modal && e.target === modal) closeAuthModal();
});

// Inicializar UI al cargar
document.addEventListener('DOMContentLoaded', updateUserUI);
