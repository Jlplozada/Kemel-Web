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
    const administrarProductos = document.createElement('a');
    const crearProducto = document.createElement('a');
    const usuarios = document.createElement('a');
    const pedidos = document.createElement('a');
    const cerrarSesion = document.createElement('a');

    logo.src = '../public/kemel.png';
    logo.alt = 'Logo Kemel';

    logoApi.href = '#/inicio';
    logoApi.appendChild(logo);

    administrarProductos.textContent = 'Administrar Productos';
    crearProducto.textContent = 'Crear Producto';
    usuarios.textContent = 'Usuarios';
    pedidos.textContent = 'Pedidos';
    cerrarSesion.textContent = 'Cerrar sesión';

    administrarProductos.setAttribute('href', '#/administrar-productos');
    crearProducto.setAttribute('href', '#/crear-producto');
    usuarios.setAttribute('href', '#/usuarios');
    pedidos.setAttribute('href', '#/pedidos');
    cerrarSesion.setAttribute('href', '#/login');

    // Event listeners para navegación
    administrarProductos.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/administrar-productos');
    });

    crearProducto.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/crear-producto');
    });

    usuarios.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/usuarios');
    });

    pedidos.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/pedidos');
    });

    cerrarSesion.addEventListener('click', (e) => {
        e.preventDefault();
        // Limpiar tokens y redirigir a login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    });

    divMenu.classList.add('nav-menu');
    divLogo.classList.add('nav-logo');

    divMenu.appendChild(administrarProductos);
    divMenu.appendChild(crearProducto);
    divMenu.appendChild(usuarios);
    divMenu.appendChild(pedidos);
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
