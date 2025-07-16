import { navigate } from '../../router/router.js';

// Header para el panel de administrador
export const headerAdministrador = () => {
    const barraNavegacion = document.createElement('nav');
    const divLogo = document.createElement('div');
    const logo = document.createElement('img');
    const logoApi = document.createElement('a');
    const divMenu = document.createElement('div');
    const menuBtn = document.createElement('button');
    const menuIcon = document.createElement('img');

    // Botones de navegación
    const pedidos = document.createElement('a');
    const clientes = document.createElement('a');
    const productos = document.createElement('a');
    const cerrarSesion = document.createElement('a');

    logo.src = '../public/kemel.png';
    logo.alt = 'Logo Kemel';

    logoApi.href = '#administrador';
    logoApi.appendChild(logo);

    pedidos.textContent = 'Pedidos';
    clientes.textContent = 'Clientes';
    productos.textContent = 'Productos';
    cerrarSesion.textContent = 'Cerrar sesión';

    pedidos.setAttribute('href', '#pedidos');
    clientes.setAttribute('href', '#clientes');
    productos.setAttribute('href', '#productos');
    cerrarSesion.setAttribute('href', '#login');

    divMenu.classList.add('nav-menu');
    divLogo.classList.add('nav-logo');

    divMenu.appendChild(pedidos);
    divMenu.appendChild(clientes);
    divMenu.appendChild(productos);
    divMenu.appendChild(cerrarSesion);
    divLogo.appendChild(logoApi);

    menuBtn.classList.add('menu-hamburguesa');
    menuIcon.src = '../public/ico/menu-line.svg';
    menuIcon.alt = 'Menú';
    menuBtn.appendChild(menuIcon);

    menuBtn.addEventListener('click', () => {
        divMenu.classList.toggle('activo');
    });

    // Interceptar el click para usar el router SPA
    [pedidos, clientes, productos, cerrarSesion].forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        const ruta = link.getAttribute('href').replace('#', '');
        navigate(ruta);
      });
    });

    barraNavegacion.appendChild(divLogo);
    barraNavegacion.appendChild(menuBtn);
    barraNavegacion.appendChild(divMenu);

    barraNavegacion.classList.add('header');
    return barraNavegacion;
}
