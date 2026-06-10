// Variables globales
let currentUser = null;

// Inicializar autenticación
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    setupNavbar();
    setupAuthForms();
    protectRoutes();
});

// Verificar autenticación
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const user = await getCurrentUser();
            currentUser = user;
            return true;
        } catch (error) {
            console.error('Error al verificar autenticación:', error);
            logout();
            return false;
        }
    }
    return false;
}

// Configurar navbar según rol
function setupNavbar() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;
    
    let menuItems = [];
    
    if (!currentUser) {
        // Usuario no logeado
        menuItems = [
            { text: 'Inicio', link: 'index.html' },
            { text: 'Mapa', link: 'mapa.html' },
            { text: 'Iniciar Sesión', link: 'login.html' },
            { text: 'Registro', link: 'register.html' }
        ];
    } else {
        // Usuario normal
        menuItems = [
            { text: 'Inicio', link: 'index.html' },
            { text: 'Reportar', link: 'crear-reporte.html' },
            { text: 'Mapa', link: 'mapa.html' }
        ];
        
        // Si es admin, agregar link de admin
        if (currentUser.role === 'admin') {
            menuItems.push({ text: 'Admin', link: 'admin.html' });
        }
        
        // Agregar username y logout
        menuItems.push({ 
            text: `${currentUser.username} ▼`, 
            link: '#',
            hasSubmenu: true,
            submenu: [{ text: 'Cerrar Sesión', action: 'logout' }]
        });
    }
    
    // Renderizar navbar
    navMenu.innerHTML = menuItems.map(item => {
        if (item.hasSubmenu) {
            return `
                <li class="nav-item dropdown">
                    <a href="${item.link}" class="nav-link dropdown-toggle">${item.text}</a>
                    <ul class="dropdown-menu">
                        ${item.submenu.map(sub => `
                            <li><a href="${sub.link || '#'}" class="dropdown-item" ${sub.action ? `onclick="${sub.action}(); return false;"` : ''}>${sub.text}</a></li>
                        `).join('')}
                    </ul>
                </li>
            `;
        }
        return `<li class="nav-item"><a href="${item.link}" class="nav-link">${item.text}</a></li>`;
    }).join('');
    
    // Agregar funcionalidad del menú hamburguesa
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Agregar funcionalidad dropdown en móvil
    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = dropdown.parentElement;
                parent.classList.toggle('active');
            }
        });
    });
}

// Configurar formularios de autenticación
function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const result = await login(username, password);
                localStorage.setItem('token', result.token);
                showAlert('Inicio de sesión exitoso', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } catch (error) {
                showAlert(error.message, 'danger');
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // Validación de fortaleza de contraseña
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                const strength = checkPasswordStrength(e.target.value);
                const strengthDiv = document.getElementById('passwordStrength');
                if (strengthDiv) {
                    strengthDiv.innerHTML = `Fortaleza: ${strength.text}`;
                    strengthDiv.className = `password-strength strength-${strength.class}`;
                }
            });
        }
        
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showAlert('Las contraseñas no coinciden', 'danger');
                return;
            }
            
            if (password.length < 6) {
                showAlert('La contraseña debe tener al menos 6 caracteres', 'danger');
                return;
            }
            
            try {
                const result = await register(username, password);
                showAlert('Registro exitoso. Ya puedes iniciar sesión.', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } catch (error) {
                showAlert(error.message, 'danger');
            }
        });
    }
}

// Verificar fortaleza de contraseña
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    
    if (strength <= 2) return { text: 'Débil', class: 'weak' };
    if (strength <= 4) return { text: 'Media', class: 'medium' };
    return { text: 'Fuerte', class: 'strong' };
}

// Mostrar alertas
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Proteger rutas según rol
function protectRoutes() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Páginas que requieren autenticación
    const authPages = ['crear-reporte.html'];
    // Páginas que requieren ser admin
    const adminPages = ['admin.html'];
    
    if (authPages.includes(currentPage) && !currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    if (adminPages.includes(currentPage)) {
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
        if (currentUser.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
    }
    
    // Si ya está logeado y trata de ir a login o register, redirigir a index
    if ((currentPage === 'login.html' || currentPage === 'register.html') && currentUser) {
        window.location.href = 'index.html';
    }
}

// Función de logout global
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Actualizar navbar cuando cambie el usuario
function updateNavbarOnAuthChange() {
    setupNavbar();
}