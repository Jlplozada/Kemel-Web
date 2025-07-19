import { navigate } from '../../router/router.js';
import { alertaConfirmacion } from '../../helpers/alertas.js';
import { clearAuth } from '../../helpers/auth.js';

// Header para el panel de panadero, solo muestra la opción Cerrar Sesión
export const headerPanadero = () => {
    const barraNavegacion = document.createElement('nav');
    const divLogo = document.createElement('div');
    const logo = document.createElement('img');
    const logoApi = document.createElement('a');
    const divMenu = document.createElement('div');
    const menuBtn = document.createElement('button');
    const menuIcon = document.createElement('img');

    // Botón de cerrar sesión único
    const cerrarSesion = document.createElement('a');

    logo.src = '../public/kemel.png';
    logo.alt = 'Logo Kemel';

    logoApi.href = '#panadero';
    logoApi.appendChild(logo);

    cerrarSesion.textContent = 'Cerrar Sesión';
    cerrarSesion.setAttribute('href', '#logout');

    divMenu.classList.add('nav-menu');
    divLogo.classList.add('nav-logo');

    divMenu.appendChild(cerrarSesion);
    divLogo.appendChild(logoApi);

    menuBtn.classList.add('menu-hamburguesa');
    menuIcon.src = '../public/ico/menu-line.svg';
    menuIcon.alt = 'Menú';
    menuBtn.appendChild(menuIcon);

    menuBtn.addEventListener('click', () => {
        divMenu.classList.toggle('activo');
    });

    // Interceptar el click para cerrar sesión
    cerrarSesion.addEventListener('click', async (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        
        // Confirmar antes de cerrar sesión
        const resultado = await alertaConfirmacion(
            '¿Cerrar Sesión?',
            '¿Estás seguro de que quieres cerrar sesión?',
            'Sí, cerrar sesión',
            'Cancelar'
        );
        
        if (resultado.isConfirmed) {
            // Limpiar datos de autenticación
            clearAuth();
            // Redirigir al login
            navigate('login');
        }
    });

    barraNavegacion.appendChild(divLogo);
    barraNavegacion.appendChild(menuBtn);
    barraNavegacion.appendChild(divMenu);

    barraNavegacion.classList.add('header');
    return barraNavegacion;
}