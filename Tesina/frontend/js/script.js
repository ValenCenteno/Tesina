// ==================== CONFIGURACIÓN ====================
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
  // Limpiar el formulario
  const form = document.getElementById('authForm');
  if (form) form.reset();
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

// ==================== AUTH HANDLER (SIN BACKEND) ====================
function handleAuth(e) {
  e.preventDefault();
  
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const nombre = document.getElementById('authNombre')?.value.trim() || '';

  // Validaciones básicas
  if (!email || !password) {
    showToast('Por favor completa todos los campos', 'error');
    return;
  }

  if (currentAuthMode === 'registro') {
    if (!nombre) {
      showToast('Por favor ingresa tu nombre completo', 'error');
      return;
    }
    if (password.length < 4) {
      showToast('La contraseña debe tener al menos 4 caracteres', 'error');
      return;
    }
    
    // Registrar nuevo usuario
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Verificar si el email ya existe
    if (users.find(u => u.email === email)) {
      showToast('Este correo ya está registrado', 'error');
      return;
    }
    
    // Crear nuevo usuario
    const newUser = {
      id: Date.now(),
      nombre: nombre,
      email: email,
      password: password,
      rol: 'usuario',
      fechaRegistro: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Iniciar sesión automáticamente
    loginUser(email, password);
    
  } else {
    // Iniciar sesión
    loginUser(email, password);
  }
}

function loginUser(email, password) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Guardar sesión (sin guardar la contraseña en la sesión)
    const session = {
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      fechaInicio: new Date().toISOString()
    };
    localStorage.setItem('currentSession', JSON.stringify(session));
    
    showToast(`¡Bienvenido ${user.nombre}!`, 'success');
    closeAuthModal();
    updateUserUI();
    
    // Redirigir al dashboard después de 1 segundo
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  } else {
    showToast('Correo o contraseña incorrectos', 'error');
  }
}

function logout() {
  localStorage.removeItem('currentSession');
  showToast('Sesión cerrada correctamente', 'success');
  updateUserUI();
}

// ==================== UI HELPERS ====================
function updateUserUI() {
  const session = JSON.parse(localStorage.getItem('currentSession') || 'null');
  const btnRegistro = document.getElementById('btnRegistro');
  const headerActions = document.querySelector('.header-actions');
  
  if (session) {
    // Usuario logueado
    if (btnRegistro) {
      btnRegistro.innerHTML = '<i class="fas fa-user"></i> ' + (session.nombre || 'Mi Cuenta');
      btnRegistro.onclick = logout;
      btnRegistro.classList.remove('btn-outline');
      btnRegistro.classList.add('btn-secondary');
    }
    
    // Cambiar texto del botón "Crear reporte"
    const createReportBtn = document.querySelector('.btn-primary.btn-sm');
    if (createReportBtn && createReportBtn.textContent.includes('Crear reporte')) {
      createReportBtn.innerHTML = '<i class="fas fa-plus"></i> Nuevo Reporte';
    }
  } else {
    // Usuario no logueado
    if (btnRegistro) {
      btnRegistro.innerHTML = 'Registrarse';
      btnRegistro.onclick = () => showAuthModal('registro');
      btnRegistro.classList.remove('btn-secondary');
      btnRegistro.classList.add('btn-outline');
    }
    
    // Restaurar texto del botón "Crear reporte" si es necesario
    const createReportBtn = document.querySelector('.btn-primary.btn-sm');
    if (createReportBtn && createReportBtn.innerHTML.includes('Nuevo Reporte')) {
      createReportBtn.innerHTML = 'Crear reporte';
    }
  }
}

// ==================== SISTEMA DE REPORTES ====================
function loadReports() {
  const storedReports = localStorage.getItem('reports');
  if (storedReports) {
    return JSON.parse(storedReports);
  }
  
  // Reportes de ejemplo
  const exampleReports = [
    {
      id: 1,
      titulo: 'Calle con baches',
      descripcion: 'Calle en mal estado con múltiples baches en Barrio Centro, Río Tercero.',
      estado: 'pendiente',
      imagen: 'img/baches.jpg',
      fecha: '2024-01-15',
      usuario: 'Ana García'
    },
    {
      id: 2,
      titulo: 'Luminaria rota',
      descripcion: 'Luminaria dañada en Av. San Martín, zona insegura por las noches.',
      estado: 'en-progreso',
      imagen: 'img/luminaria.jpg',
      fecha: '2024-01-14',
      usuario: 'Carlos López'
    },
    {
      id: 3,
      titulo: 'Acumulación de basura',
      descripcion: 'Gran acumulación de basura en esquina de Barrio Sur, Río Tercero.',
      estado: 'pendiente',
      imagen: 'img/basura.jpg',
      fecha: '2024-01-13',
      usuario: 'María Rodríguez'
    }
  ];
  
  localStorage.setItem('reports', JSON.stringify(exampleReports));
  return exampleReports;
}

function updateRecentReports() {
  const reports = loadReports();
  const recentReportsContainer = document.getElementById('recentReports');
  
  if (!recentReportsContainer) return;
  
  // Mostrar los 3 reportes más recientes
  const recentReports = [...reports].reverse().slice(0, 3);
  
  recentReportsContainer.innerHTML = recentReports.map(report => `
    <div class="report-card">
      <div class="card-image">
        <img src="${report.imagen}" alt="${report.titulo}" onerror="this.src='https://placehold.co/400x200/e2e8f0/64748b?text=Sin+imagen'">
      </div>
      <div class="card-body">
        <div class="card-header-row">
          <h3>${report.titulo}</h3>
          <span class="badge badge-${getEstadoClass(report.estado)}">${getEstadoTexto(report.estado)}</span>
        </div>
        <p>${report.descripcion}</p>
        <div class="card-footer">
          <span><i class="far fa-calendar-alt"></i> ${report.fecha}</span>
          <span><i class="far fa-user"></i> ${report.usuario}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function getEstadoClass(estado) {
  const classes = {
    'pendiente': 'warning',
    'en-progreso': 'primary',
    'completado': 'success'
  };
  return classes[estado] || 'secondary';
}

function getEstadoTexto(estado) {
  const textos = {
    'pendiente': 'Pendiente',
    'en-progreso': 'En progreso',
    'completado': 'Completado'
  };
  return textos[estado] || estado;
}

// ==================== SISTEMA DE BÚSQUEDA ====================
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const reportCards = document.querySelectorAll('.report-card');
      
      reportCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
}

// ==================== MENÚ MÓVIL ====================
function toggleMobileMenu() {
  const nav = document.querySelector('.nav-links');
  const headerActions = document.querySelector('.header-actions');
  
  if (nav) {
    nav.classList.toggle('show-mobile');
    if (headerActions) headerActions.classList.toggle('show-mobile');
  }
}

// ==================== FUNCIONES DE LOGIN.JS (para la página login.html) ====================
// Estas funciones solo se ejecutan si existen los elementos de la página login.html

function switchTab(tab) {
  const loginPanel = document.getElementById('loginPanel');
  const registerPanel = document.getElementById('registerPanel');
  const tabs = document.querySelectorAll('.tab');

  if (!loginPanel || !registerPanel) return; // Salir si no estamos en login.html

  if (tab === 'login') {
    loginPanel.classList.add('active');
    registerPanel.classList.remove('active');
    if (tabs[0]) tabs[0].classList.add('active');
    if (tabs[1]) tabs[1].classList.remove('active');
  } else {
    loginPanel.classList.remove('active');
    registerPanel.classList.add('active');
    if (tabs[0]) tabs[0].classList.remove('active');
    if (tabs[1]) tabs[1].classList.add('active');
  }
}

function togglePassword(inputId, iconElement) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  if (input.type === 'password') {
    input.type = 'text';
    iconElement.classList.remove('fa-eye');
    iconElement.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    iconElement.classList.remove('fa-eye-slash');
    iconElement.classList.add('fa-eye');
  }
}

function handleLoginPage(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;

  if (!email || !password) {
    showToast('Por favor completa todos los campos', 'error');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    const session = {
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol || 'usuario',
      fechaInicio: new Date().toISOString()
    };
    localStorage.setItem('currentSession', JSON.stringify(session));
    
    showToast(`¡Bienvenido ${user.nombre}!`, 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } else {
    showToast('Correo o contraseña incorrectos', 'error');
  }
}

function handleRegisterPage(event) {
  event.preventDefault();
  
  const nombre = document.getElementById('registerNombre')?.value.trim();
  const email = document.getElementById('registerEmail')?.value.trim();
  const password = document.getElementById('registerPassword')?.value;
  const confirmPassword = document.getElementById('registerConfirmPassword')?.value;

  if (!nombre || !email || !password || !confirmPassword) {
    showToast('Por favor completa todos los campos', 'error');
    return;
  }

  if (password.length < 4) {
    showToast('La contraseña debe tener al menos 4 caracteres', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Las contraseñas no coinciden', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('Ingresa un correo electrónico válido', 'error');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.find(u => u.email === email)) {
    showToast('Este correo ya está registrado', 'error');
    return;
  }
  
  const newUser = {
    id: Date.now(),
    nombre: nombre,
    email: email,
    password: password,
    rol: 'usuario',
    fechaRegistro: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  showToast('¡Cuenta creada exitosamente!', 'success');
  
  setTimeout(() => {
    switchTab('login');
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) loginEmail.value = email;
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) loginPassword.value = '';
  }, 1000);
}

function checkSessionAndRedirect() {
  const session = localStorage.getItem('currentSession');
  if (session && window.location.pathname.includes('login.html')) {
    window.location.href = 'index.html';
  }
}

function setupLoginPageEvents() {
  // Solo configurar si estamos en la página de login
  if (!document.getElementById('loginPanel')) return;
  
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  const footerLinks = document.querySelectorAll('.footer-links a');
  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = link.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  const toggleIcons = document.querySelectorAll('.toggle-password');
  toggleIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const targetId = icon.getAttribute('data-target');
      togglePassword(targetId, icon);
    });
  });

  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLoginPage);

  const registerForm = document.getElementById('registerForm');
  if (registerForm) registerForm.addEventListener('submit', handleRegisterPage);
}

// ==================== INICIALIZACIÓN ====================
function init() {
  // Cargar reportes (solo si existe el contenedor)
  if (document.getElementById('recentReports')) {
    updateRecentReports();
    setupSearch();
  }
  
  // Actualizar UI según sesión
  updateUserUI();
  
  // Configurar cierre de modal al hacer clic fuera
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('authModal');
    if (modal && e.target === modal) closeAuthModal();
  });
  
  // Cerrar modal con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAuthModal();
    }
  });
  
  // Configurar botones del hero si es necesario
  const heroBtns = document.querySelectorAll('.hero-buttons .btn');
  heroBtns.forEach(btn => {
    const btnText = btn.textContent.trim();
    if (btnText === 'Registrarse') {
      btn.onclick = () => showAuthModal('registro');
    } else if (btnText === 'Iniciar Sesión') {
      btn.onclick = () => showAuthModal('login');
    }
  });
  
  // Prevenir que el enlace de "Crear reporte" redirija si no hay sesión
  const createReportLink = document.querySelector('.btn-primary.btn-sm');
  if (createReportLink) {
    createReportLink.addEventListener('click', (e) => {
      const session = localStorage.getItem('currentSession');
      if (!session) {
        e.preventDefault();
        showToast('Debes iniciar sesión para crear un reporte', 'error');
        showAuthModal('login');
      }
    });
  }
  
  // Configurar eventos para la página de login
  setupLoginPageEvents();
  
  // Verificar sesión y redirigir si es necesario
  checkSessionAndRedirect();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);