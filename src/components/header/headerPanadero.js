import { navigate } from '../../router/router.js';

// Header para el panel de panadero, solo muestra la opción Pedidos
export const headerPanadero = () => {
    const barraNavegacion = document.createElement('nav');
    const divLogo = document.createElement('div');
    const logo = document.createElement('img');
    const logoApi = document.createElement('a');
    const divMenu = document.createElement('div');
    const menuBtn = document.createElement('button');
    const menuIcon = document.createElement('img');

    // Botón de navegación único
    const pedidos = document.createElement('a');

    logo.src = '../public/kemel.png';
    logo.alt = 'Logo Kemel';

    logoApi.href = '#panadero';
    logoApi.appendChild(logo);

    pedidos.textContent = 'Pedidos';
    pedidos.setAttribute('href', '#pedidos');

    divMenu.classList.add('nav-menu');
    divLogo.classList.add('nav-logo');

    divMenu.appendChild(pedidos);
    divLogo.appendChild(logoApi);

    menuBtn.classList.add('menu-hamburguesa');
    menuIcon.src = '../public/ico/menu-line.svg';
    menuIcon.alt = 'Menú';
    menuBtn.appendChild(menuIcon);

    menuBtn.addEventListener('click', () => {
        divMenu.classList.toggle('activo');
    });

    // Interceptar el click para usar el router SPA
    pedidos.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        const ruta = pedidos.getAttribute('href').replace('#', '');
        navigate(ruta);
    });

    barraNavegacion.appendChild(divLogo);
    barraNavegacion.appendChild(menuBtn);
    barraNavegacion.appendChild(divMenu);

    barraNavegacion.classList.add('header');
    return barraNavegacion;
}