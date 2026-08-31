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


// =============================================
// INICIO
// =============================================

document.addEventListener('DOMContentLoaded', async () => {

    // 1. Pintar el navbar inmediatamente
    updateNavButtons();

    // 2. Proteger las páginas
    protectRoutes();

    // 3. Verificar el token en segundo plano
    await verifySessionInBackground();

    // 4. Configurar formularios
    setupAuthForms();

    // 5. Configurar menú de usuario
    setupUserMenu();

    // 6. Configurar menú hamburguesa (mobile)
    setupHamburgerMenu();
});


// =============================================
// VERIFICAR SESIÓN
// =============================================

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


// =============================================
// NAVBAR
// =============================================

function updateNavButtons() {

    const loginBtn          = document.getElementById('loginBtn');
    const registerBtn       = document.getElementById('registerBtn');

    const userMenu          = document.getElementById('userMenu');
    const usernameSpan      = document.getElementById('usernameDisplay');

    const userInitial       = document.getElementById('userInitial');
    const dropdownInitial   = document.getElementById('dropdownInitial');
    const dropdownUsername  = document.getElementById('dropdownUsername');

    const logoutBtn         = document.getElementById('logoutBtn');

    const reportLink        = document.getElementById('reportLink');
    const adminLink         = document.getElementById('adminLink');


    const isLoggedIn = !!window.currentUser;

    const isAdmin =
        isLoggedIn &&
        window.currentUser.role === 'admin';


    // ── Botones de login / registro ─────────────

    if (loginBtn) {
        loginBtn.style.display = isLoggedIn ? 'none' : '';
    }

    if (registerBtn) {
        registerBtn.style.display = isLoggedIn ? 'none' : '';
    }


    // ── Menú de usuario ─────────────────────────

    if (userMenu) {
        userMenu.style.display = isLoggedIn ? 'flex' : 'none';
    }


    // ── Datos del usuario ───────────────────────

    if (isLoggedIn) {

        const username = window.currentUser.username;

        // Primera letra del nombre de usuario
        const initial = username
            ? username.charAt(0).toUpperCase()
            : '?';


        // Nombre en la cápsula
        if (usernameSpan) {
            usernameSpan.textContent = username;
        }


        // Inicial de la cápsula
        if (userInitial) {
            userInitial.textContent = initial;
        }


        // Inicial dentro del menú
        if (dropdownInitial) {
            dropdownInitial.textContent = initial;
        }


        // Nombre dentro del menú
        if (dropdownUsername) {
            dropdownUsername.textContent = username;
        }
    }


    // ── Cerrar sesión ───────────────────────────

    if (logoutBtn) {

        logoutBtn.style.display = isLoggedIn ? '' : 'none';

        // Evitamos agregar múltiples listeners
        logoutBtn.onclick = logout;
    }


    // ── Reportar (los admins no cargan reportes) ─
    if (reportLink) {
        reportLink.style.display = (isLoggedIn && !isAdmin) ? '' : 'none';
    }

    const heroReportBtn = document.getElementById('heroReportBtn');
    if (heroReportBtn) {
        heroReportBtn.style.display = isAdmin ? 'none' : '';
    }


    // ── Admin ───────────────────────────────────

    if (adminLink) {
        adminLink.style.display = isAdmin ? '' : 'none';
    }
}


// =============================================
// MENÚ DESPLEGABLE DEL USUARIO
// =============================================

// =============================================
// MENÚ HAMBURGUESA (mobile) — común a todas las páginas
// =============================================

function setupHamburgerMenu() {

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (!hamburger || !navLinks) return;

    const closeMenu = () => {
        navLinks.classList.remove('active');

        const icon = hamburger.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }

        document.body.classList.remove('menu-open');
    };

    hamburger.addEventListener('click', () => {

        navLinks.classList.toggle('active');

        const icon = hamburger.querySelector('i');

        if (navLinks.classList.contains('active')) {

            if (icon) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }

            document.body.classList.add('menu-open');

        } else {
            closeMenu();
        }
    });

    // Cerrar el menú al seleccionar una opción
    navLinks.querySelectorAll('a, button').forEach(item => {
        item.addEventListener('click', closeMenu);
    });

    // Cerrar el menú al hacer click afuera
    document.addEventListener('click', (event) => {
        if (!hamburger.contains(event.target) && !navLinks.contains(event.target)) {
            closeMenu();
        }
    });
}


function setupUserMenu() {

    const userMenu = document.getElementById('userMenu');
    const userMenuButton = document.getElementById('userMenuButton');

    if (!userMenu || !userMenuButton) return;


    // Abrir / cerrar al hacer click
    userMenuButton.addEventListener('click', (event) => {

        event.stopPropagation();

        userMenu.classList.toggle('open');
    });


    // Cerrar al hacer click fuera
    document.addEventListener('click', (event) => {

        if (!userMenu.contains(event.target)) {
            userMenu.classList.remove('open');
        }
    });
}


// =============================================
// FORMULARIOS DE LOGIN / REGISTRO
// =============================================

function setupAuthForms() {

    // ── LOGIN ──────────────────────────────────

    const loginForm = document.getElementById('loginForm');

    if (loginForm) {

        loginForm.addEventListener('submit', async (e) => {

            e.preventDefault();

            const btn =
                loginForm.querySelector('button[type="submit"]');

            const username =
                document.getElementById('username').value.trim();

            const password =
                document.getElementById('password').value;


            btn.disabled = true;
            btn.textContent = 'Ingresando...';


            try {

                const result =
                    await window.api.login(username, password);

                // result = {
                //     token,
                //     user: { id, username, role }
                // }

                storeSession(result.token, result.user);

                updateNavButtons();

                showAlert(
                    '¡Bienvenido! Redirigiendo...',
                    'success'
                );


                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);


            } catch (error) {

                showAlert(error.message, 'danger');

                btn.disabled = false;
                btn.textContent = 'Iniciar Sesión';
            }
        });
    }


    // ── REGISTRO ───────────────────────────────

    const registerForm =
        document.getElementById('registerForm');


    if (registerForm) {

        const passwordInput =
            document.getElementById('password');


        // Fortaleza de contraseña
        if (passwordInput) {

            passwordInput.addEventListener('input', (e) => {

                const strength =
                    getPasswordStrength(e.target.value);

                const el =
                    document.getElementById('passwordStrength');


                if (el) {

                    el.textContent =
                        `Fortaleza: ${strength.text}`;

                    el.className =
                        `password-strength strength-${strength.level}`;
                }
            });
        }


        registerForm.addEventListener('submit', async (e) => {

            e.preventDefault();


            const btn =
                registerForm.querySelector('button[type="submit"]');


            const username =
                document.getElementById('username').value.trim();

            const dni =
                document.getElementById('dni').value.trim();

            const phone =
                document.getElementById('phone').value.trim();

            const password =
                document.getElementById('password').value;

            const confirmPassword =
                document.getElementById('confirmPassword').value;


            // Verificar contraseñas
            if (password !== confirmPassword) {

                return showAlert(
                    'Las contraseñas no coinciden',
                    'danger'
                );
            }

            // Verificar DNI (7 u 8 dígitos)
            if (!/^\d{7,8}$/.test(dni)) {

                return showAlert(
                    'Ingresá un DNI válido (7 u 8 números, sin puntos ni espacios)',
                    'danger'
                );
            }

            // Verificar teléfono (al menos 8 dígitos)
            const phoneDigits = phone.replace(/[\s\-()]/g, '');
            if (!/^\+?\d{8,15}$/.test(phoneDigits)) {

                return showAlert(
                    'Ingresá un teléfono válido (solo números, mínimo 8 dígitos)',
                    'danger'
                );
            }


            btn.disabled = true;
            btn.textContent = 'Creando cuenta...';


            try {

                await window.api.register(
                    username,
                    password,
                    dni,
                    phone
                );


                // Auto-login después de registrarse
                const loginResult =
                    await window.api.login(
                        username,
                        password
                    );


                storeSession(
                    loginResult.token,
                    loginResult.user
                );


                showAlert(
                    '¡Cuenta creada! Redirigiendo...',
                    'success'
                );


                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);


            } catch (error) {

                showAlert(
                    error.message,
                    'danger'
                );

                btn.disabled = false;
                btn.textContent = 'Registrarse';
            }
        });
    }
}


// =============================================
// PROTECCIÓN DE RUTAS
// =============================================

function protectRoutes() {

    const page =
        window.location.pathname
            .split('/')
            .pop();


    const authPages = [
        'crear-reporte.html'
    ];


    const adminPages = [
        'admin.html'
    ];


    // Usuario sin sesión intentando reportar
    if (
        authPages.includes(page) &&
        !window.currentUser
    ) {

        window.location.href = 'login.html';
        return;
    }


    // Un admin no carga reportes, los gestiona
    if (
        authPages.includes(page) &&
        window.currentUser &&
        window.currentUser.role === 'admin'
    ) {

        window.location.href = 'index.html';
        return;
    }


    // Protección de admin
    if (adminPages.includes(page)) {

        if (!window.currentUser) {

            window.location.href = 'login.html';
            return;
        }


        if (window.currentUser.role !== 'admin') {

            window.location.href = 'index.html';
            return;
        }
    }


    // Usuario logueado intentando volver a login/registro
    if (
        (page === 'login.html' ||
         page === 'register.html') &&
        window.currentUser
    ) {

        window.location.href = 'index.html';
    }
}

function showAlert(message, type) {

    const container =
        document.getElementById('alertContainer');


    if (!container) return;


    container.innerHTML =
        `<div class="alert alert-${type}">${message}</div>`;


    setTimeout(() => {

        container.innerHTML = '';

    }, 4000);
}

function getPasswordStrength(password) {

    let score = 0;


    if (password.length >= 6) score++;

    if (password.length >= 8) score++;

    if (
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password)
    ) {
        score++;
    }

    if (/\d/.test(password)) score++;

    if (/[^a-zA-Z\d]/.test(password)) score++;


    if (score <= 2) {
        return {
            text: 'Débil',
            level: 'weak'
        };
    }

    
    if (score <= 4) {
        return {
            text: 'Media',
            level: 'medium'
        };
    }


    return {
        text: 'Fuerte',
        level: 'strong'
    };
}


function logout() {

    clearSession();

    window.location.href =
        '../html/index.html';
}