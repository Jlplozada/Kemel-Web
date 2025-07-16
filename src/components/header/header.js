import { navigate } from '../../router/router.js';

export const header = () => {
    // Usar <nav> para la barra de navegación para mejor semántica y compatibilidad CSS
    const barraNavegacion = document.createElement('nav');
    const divLogo = document.createElement('div');
    const logo = document.createElement('img');
    const logoApi = document.createElement('a');
    const divMenu = document.createElement('div');
    const menuBtn = document.createElement('button');
    const menuIcon = document.createElement('img');

    const inicio = document.createElement('a');
    const catalogo = document.createElement('a');
    const carrito = document.createElement('a');
    const cuenta = document.createElement('a');

    logo.src = '../public/kemel.png';
    logo.alt = 'Logo Kemel';

    logoApi.href = '#inicio';
    logoApi.appendChild(logo);

    inicio.textContent = 'Inicio';
    catalogo.textContent = 'Catálogo';
    carrito.textContent = 'Carrito';
    cuenta.textContent = 'Cuenta';

    inicio.setAttribute("href", '#inicio');
    catalogo.setAttribute("href", '#catalogo');
    cuenta.setAttribute("href", '#login');

    divMenu.classList.add('nav-menu');
    divLogo.classList.add('nav-logo');

    divMenu.appendChild(inicio);
    divMenu.appendChild(catalogo);
    divMenu.appendChild(carrito);
    divMenu.appendChild(cuenta);
    divLogo.appendChild(logoApi); 

    menuBtn.classList.add('menu-hamburguesa');
    menuIcon.src = '../public/ico/menu-line.svg';
    menuIcon.alt = 'Menú';
    menuBtn.appendChild(menuIcon);

    menuBtn.addEventListener('click', () => {
        divMenu.classList.toggle('activo');
    });

    // Interceptar el click para usar el router SPA
    [ inicio, catalogo, carrito, cuenta ].forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        // Extraer la ruta sin el '#'
        const ruta = link.getAttribute('href').replace('#', '');
        // Usar navigate del router
        navigate(ruta);
      });
    });

    barraNavegacion.appendChild(divLogo);
    barraNavegacion.appendChild(menuBtn);
    barraNavegacion.appendChild(divMenu);

    barraNavegacion.classList.add('header');
    return barraNavegacion;
}