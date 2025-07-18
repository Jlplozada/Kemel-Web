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

    // Botones de navegación
    const pedidos = document.createElement('a');
    const crearProducto = document.createElement('a');
    const cerrarSesion = document.createElement('a');

    logo.src = '../public/kemel.png';
    logo.alt = 'Logo Kemel';

    logoApi.href = '#/inicio';
    logoApi.appendChild(logo);

    pedidos.textContent = 'Pedidos';
    crearProducto.textContent = 'Crear Producto';
    cerrarSesion.textContent = 'Cerrar sesión';

    pedidos.setAttribute('href', '#/pedidos');
    crearProducto.setAttribute('href', '#/crear-producto');
    cerrarSesion.setAttribute('href', '#/login');

    divMenu.classList.add('nav-menu');
    divLogo.classList.add('nav-logo');

    divMenu.appendChild(pedidos);
    divMenu.appendChild(crearProducto);
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
    pedidos.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        navigate('/pedidos');
    });

    crearProducto.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        navigate('/crear-producto');
    });

    cerrarSesion.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        // Limpiar tokens y redirigir a login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    });

    barraNavegacion.appendChild(divLogo);
    barraNavegacion.appendChild(menuBtn);
    barraNavegacion.appendChild(divMenu);

    barraNavegacion.classList.add('header');
    return barraNavegacion;
}