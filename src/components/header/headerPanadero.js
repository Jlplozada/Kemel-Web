import { navigate } from '../../router/router.js';
import { clearAuth } from '../../helpers/auth.js';
import { renderHeaderPorRol } from '../../helpers/gestionRoles.js';

// Header simple para panadero - botón de Pedidos Pendientes y Cerrar Sesión
export const headerPanadero = () => {
    const barraNavegacion = document.createElement('nav');
    const divLogo = document.createElement('div');
    const logo = document.createElement('img');
    const logoApi = document.createElement('a');
    const divMenu = document.createElement('div');
    const menuBtn = document.createElement('button');
    const menuIcon = document.createElement('img');

    // Botones de navegación para panadero
    const pedidosPendientes = document.createElement('a');
    const cerrarSesion = document.createElement('a');

    logo.src = '../public/kemel.png';
    logo.alt = 'Logo Kemel';

    logoApi.href = '#inicio';
    logoApi.appendChild(logo);

    pedidosPendientes.textContent = 'Pedidos Pendientes';
    cerrarSesion.textContent = 'Cerrar Sesión';

    pedidosPendientes.setAttribute('href', '#pedidos-pendientes');
    cerrarSesion.setAttribute('href', '#logout');

    divMenu.classList.add('nav-menu');
    divLogo.classList.add('nav-logo');

    divMenu.appendChild(pedidosPendientes);
    divMenu.appendChild(cerrarSesion);
    divLogo.appendChild(logoApi);

    menuBtn.classList.add('menu-hamburguesa');
    menuIcon.src = '../public/ico/menu-line.svg';
    menuIcon.alt = 'Menú';
    menuBtn.appendChild(menuIcon);

    menuBtn.addEventListener('click', () => {
        divMenu.classList.toggle('activo');
    });

    // Event listeners para navegación
    pedidosPendientes.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        navigate('pedidos-pendientes');
    });

    cerrarSesion.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        clearAuth();
        // Re-renderizar el header para usuario no autenticado
        renderHeaderPorRol(null, false);
        navigate('login');
    });

    barraNavegacion.appendChild(divLogo);
    barraNavegacion.appendChild(menuBtn);
    barraNavegacion.appendChild(divMenu);

    barraNavegacion.classList.add('header');
    return barraNavegacion;
}