// =============================================================
// CIUDADACTIVA — MODO OSCURO
// =============================================================

document.addEventListener('DOMContentLoaded', () => {

    const themeToggle =
        document.getElementById('themeToggle');

    if (!themeToggle) return;


    // El ícono (sol/luna) ahora lo resuelve el CSS solo,
    // en base al atributo data-theme del <html>. Acá solo
    // actualizamos el texto accesible del botón.


    // =========================================================
    // Aplicar tema guardado
    // =========================================================

    const savedTheme =
        localStorage.getItem('theme');


    if (savedTheme === 'dark') {

        document.documentElement.setAttribute(
            'data-theme',
            'dark'
        );

        updateThemeButton(true);

    } else {

        document.documentElement.setAttribute(
            'data-theme',
            'light'
        );

        updateThemeButton(false);

    }


    // =========================================================
    // Cambiar tema
    // =========================================================

    themeToggle.addEventListener('click', () => {

        const isDark =
            document.documentElement.getAttribute(
                'data-theme'
            ) === 'dark';


        if (isDark) {

            document.documentElement.setAttribute(
                'data-theme',
                'light'
            );

            localStorage.setItem(
                'theme',
                'light'
            );

            updateThemeButton(false);

        } else {

            document.documentElement.setAttribute(
                'data-theme',
                'dark'
            );

            localStorage.setItem(
                'theme',
                'dark'
            );

            updateThemeButton(true);

        }

    });


    // =========================================================
    // Actualizar botón
    // =========================================================

    function updateThemeButton(isDark) {

        themeToggle.setAttribute(
            'aria-label',
            isDark
                ? 'Activar modo claro'
                : 'Activar modo oscuro'
        );


        themeToggle.setAttribute(
            'title',
            isDark
                ? 'Activar modo claro'
                : 'Activar modo oscuro'
        );

    }

});