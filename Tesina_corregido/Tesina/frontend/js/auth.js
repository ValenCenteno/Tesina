// =============================================
// AUTH.JS - Manejo de sesión global
// =============================================

// Estado global del usuario, leído de forma SÍNCRONA desde localStorage
// para que el navbar se actualice de inmediato, sin esperar al servidor.
window.currentUser = getStoredUser();

function getStoredUser() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');

    if (!token || !role || !username) return null;

    return { id: userId, username, role, token };
}

function storeSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role);
    localStorage.setItem('username', user.username);
    localStorage.setItem('userId', user.id);
    window.currentUser = { ...user, token };
}

function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    window.currentUser = null;
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Pintar el navbar de inmediato con lo que ya hay en localStorage
    updateNavButtons();
    protectRoutes();

    // 2. Verificar en segundo plano que el token siga siendo válido
    await verifySessionInBackground();

    setupAuthForms();
});

// Verifica el token contra el backend sin bloquear el render inicial.
// Si el token venció o es inválido, limpia la sesión y refresca el navbar.
async function verifySessionInBackground() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const freshUser = await window.api.getMe();
        // Sincronizar por si el rol cambió en el servidor
        storeSession(token, freshUser);
        updateNavButtons();
    } catch (error) {
        clearSession();
        updateNavButtons();
        protectRoutes();
    }
}

// ── Navbar ───────────────────────────────────────────────────
// Espera estos IDs en el HTML (presentes en todas las páginas):
//   #loginBtn, #registerBtn       -> visibles SOLO sin sesión
//   #userMenu, #usernameDisplay   -> visibles SOLO con sesión
//   #logoutBtn                    -> botón de cerrar sesión
//   #reportLink                   -> visible SOLO con sesión
//   #adminLink                    -> visible SOLO si role === 'admin'
function updateNavButtons() {
    const loginBtn     = document.getElementById('loginBtn');
    const registerBtn  = document.getElementById('registerBtn');
    const userMenu      = document.getElementById('userMenu');
    const usernameSpan  = document.getElementById('usernameDisplay');
    const logoutBtn     = document.getElementById('logoutBtn');
    const reportLink    = document.getElementById('reportLink');
    const adminLink     = document.getElementById('adminLink');

    const isLoggedIn = !!window.currentUser;
    const isAdmin    = isLoggedIn && window.currentUser.role === 'admin';

    if (loginBtn)    loginBtn.style.display    = isLoggedIn ? 'none' : '';
    if (registerBtn) registerBtn.style.display = isLoggedIn ? 'none' : '';

    if (userMenu) userMenu.style.display = isLoggedIn ? 'flex' : 'none';
    if (usernameSpan && isLoggedIn) usernameSpan.textContent = window.currentUser.username;

    if (logoutBtn) {
        logoutBtn.style.display = isLoggedIn ? '' : 'none';
        logoutBtn.onclick = logout;
    }

    if (reportLink) reportLink.style.display = isLoggedIn ? '' : 'none';
    if (adminLink)  adminLink.style.display  = isAdmin ? '' : 'none';
}

// ── Formularios de login / registro ─────────────────────────
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
                // result = { token, user: { id, username, role } }
                storeSession(result.token, result.user);
                updateNavButtons();
                showAlert('¡Bienvenido! Redirigiendo...', 'success');
                setTimeout(() => { window.location.href = 'index.html'; }, 800);
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

                // Auto-login después de registrarse para no pedirle el login dos veces
                const loginResult = await window.api.login(username, password);
                storeSession(loginResult.token, loginResult.user);

                showAlert('¡Cuenta creada! Redirigiendo...', 'success');
                setTimeout(() => { window.location.href = 'index.html'; }, 1000);
            } catch (error) {
                showAlert(error.message, 'danger');
                btn.disabled = false;
                btn.textContent = 'Registrarse';
            }
        });
    }
}

// ── Protección de rutas ──────────────────────────────────────
function protectRoutes() {
    const page = window.location.pathname.split('/').pop();
    const authPages  = ['crear-reporte.html'];
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

// ── Alertas ───────────────────────────────────────────────────
function showAlert(message, type) {
    const container = document.getElementById('alertContainer');
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => { container.innerHTML = ''; }, 4000);
}

// ── Fortaleza de contraseña ──────────────────────────────────
function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { text: 'Débil', level: 'weak' };
    if (score <= 4) return { text: 'Media', level: 'medium' };
    return { text: 'Fuerte', level: 'strong' };
}

// ── Logout ────────────────────────────────────────────────────
function logout() {
    clearSession();
    window.location.href = '../html/index.html';
}