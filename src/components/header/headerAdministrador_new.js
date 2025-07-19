import { navigate } from '../../router/router.js';
import { clearAuth } from '../../helpers/auth.js';

// Header completo para administrador - múltiples opciones de gestión
export const headerAdministrador = () => {
    const barraNavegacion = document.createElement('nav');
    const divLogo = document.createElement('div');
    const logo = document.createElement('img');
    const logoApi = document.createElement('a');
    const divMenu = document.createElement('div');
    const menuBtn = document.createElement('button');
    const menuIcon = document.createElement('img');

    // Botones de navegación para administrador
    const pedidos = document.createElement('a');
    const usuarios = document.createElement('a');
    const productos = document.createElement('a');
    const crearProducto = document.createElement('a');
    const cerrarSesion = document.createElement('a');

    logo.src = '../public/kemel.png';
    logo.alt = 'Logo Kemel';

    logoApi.href = '#inicio';
    logoApi.appendChild(logo);

    pedidos.textContent = 'Gestionar Pedidos';
    usuarios.textContent = 'Gestionar Usuarios';
    productos.textContent = 'Administrar Productos';
    crearProducto.textContent = 'Crear Producto';
    cerrarSesion.textContent = 'Cerrar Sesión';

    pedidos.setAttribute('href', '#admin-pedidos');
    usuarios.setAttribute('href', '#admin-usuarios');
    productos.setAttribute('href', '#administrar-productos');
    crearProducto.setAttribute('href', '#crearproducto');
    cerrarSesion.setAttribute('href', '#logout');

    divMenu.classList.add('nav-menu');
    divLogo.classList.add('nav-logo');

    divMenu.appendChild(pedidos);
    divMenu.appendChild(usuarios);
    divMenu.appendChild(productos);
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
        navigate('admin-pedidos');
    });

    usuarios.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        navigate('admin-usuarios');
    });

    productos.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        navigate('administrar-productos');
    });

    crearProducto.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        navigate('crearproducto');
    });

    cerrarSesion.addEventListener('click', (e) => {
        e.preventDefault();
        divMenu.classList.remove('activo');
        clearAuth();
        navigate('login');
    });

    barraNavegacion.appendChild(divLogo);
    barraNavegacion.appendChild(menuBtn);
    barraNavegacion.appendChild(divMenu);

    barraNavegacion.classList.add('header');
    return barraNavegacion;
};
