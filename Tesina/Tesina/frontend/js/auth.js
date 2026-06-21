// Estado global del usuario
window.currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    setupAuthForms();
    protectRoutes();
    updateNavButtons();
});

// Verifica si hay sesión activa
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        window.currentUser = await window.api.getMe();
        return true;
    } catch (error) {
        // Token inválido o expirado
        localStorage.removeItem('token');
        window.currentUser = null;
        return false;
    }
}

// Actualiza los botones de la navbar en index.html / admin.html / mapa.html
function updateNavButtons() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    if (!loginBtn && !registerBtn) return;

    if (window.currentUser) {
        // Usuario logueado: mostrar nombre + logout
        if (loginBtn) {
            loginBtn.textContent = window.currentUser.username;
            loginBtn.onclick = null;
        }
        if (registerBtn) {
            registerBtn.textContent = 'Cerrar Sesión';
            registerBtn.onclick = logout;
        }
    } else {
        if (loginBtn) {
            loginBtn.textContent = 'Iniciar Sesión';
            loginBtn.onclick = () => { window.location.href = '../html/login.html'; };
        }
        if (registerBtn) {
            registerBtn.textContent = 'Registro';
            registerBtn.onclick = () => { window.location.href = '../html/register.html'; };
        }
    }
}

// Configura los formularios de login y registro
function setupAuthForms() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            btn.disabled = true;
            btn.textContent = 'Ingresando...';

            try {
                const result = await window.api.login(username, password);
                localStorage.setItem('token', result.token);
                showAlert('¡Bienvenido! Redirigiendo...', 'success');
                setTimeout(() => { window.location.href = 'index.html'; }, 1000);
            } catch (error) {
                showAlert(error.message, 'danger');
                btn.disabled = false;
                btn.textContent = 'Iniciar Sesión';
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                const strength = getPasswordStrength(e.target.value);
                const el = document.getElementById('passwordStrength');
                if (el) {
                    el.textContent = `Fortaleza: ${strength.text}`;
                    el.className = `password-strength strength-${strength.level}`;
                }
            });
        }

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button[type="submit"]');
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                return showAlert('Las contraseñas no coinciden', 'danger');
            }

            btn.disabled = true;
            btn.textContent = 'Creando cuenta...';

            try {
                await window.api.register(username, password);
                showAlert('¡Cuenta creada! Redirigiendo al login...', 'success');
                setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            } catch (error) {
                showAlert(error.message, 'danger');
                btn.disabled = false;
                btn.textContent = 'Registrarse';
            }
        });
    }
}

// Protege rutas según autenticación
function protectRoutes() {
    const page = window.location.pathname.split('/').pop();
    const authPages = ['crear-reporte.html'];
    const adminPages = ['admin.html'];

    if (authPages.includes(page) && !window.currentUser) {
        window.location.href = 'login.html';
        return;
    }
    if (adminPages.includes(page)) {
        if (!window.currentUser) { window.location.href = 'login.html'; return; }
        if (window.currentUser.role !== 'admin') { window.location.href = 'index.html'; return; }
    }
    if ((page === 'login.html' || page === 'register.html') && window.currentUser) {
        window.location.href = 'index.html';
    }
}

// Muestra alertas en el contenedor del formulario
function showAlert(message, type) {
    const container = document.getElementById('alertContainer');
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => { container.innerHTML = ''; }, 4000);
}

// Calcula fortaleza de contraseña
function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { text: 'Débil 😟', level: 'weak' };
    if (score <= 4) return { text: 'Media 😐', level: 'medium' };
    return { text: 'Fuerte 💪', level: 'strong' };
}

// Logout global
function logout() {
    localStorage.removeItem('token');
    window.currentUser = null;
    window.location.href = '../html/index.html';
}