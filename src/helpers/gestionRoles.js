import { esAdministrador, esPanadero, getUsuario } from './auth.js';
import { header } from '../components/header/header.js';
import { headerAdministrador } from '../components/header/headerAdministrador.js';
import { headerPanadero } from '../components/header/headerPanadero.js';

/**
 * Función para cargar el header correcto según el rol del usuario
 * Se ejecuta después del login exitoso o al verificar autenticación
 */
export const cargarHeaderSegunRol = () => {
    console.log("Cargando header según rol del usuario...");
    
    const usuario = getUsuario();
    if (!usuario) {
        console.log("No hay usuario logueado, cargando header por defecto");
        renderHeaderPorRol(null, false);
        return;
    }

    console.log(`Usuario: ${usuario.nombre}, Rol: ${usuario.rol}`);
    
    // Usar la función de renderizado centralizada
    renderHeaderPorRol(usuario.rol, true);
}

/**
 * Función centralizada para renderizar headers según el rol
 */
export const renderHeaderPorRol = (rol, autenticado = false) => {
    const headerContainer = document.querySelector('#header');
    if (!headerContainer) {
        console.error('No se encontró el contenedor #header');
        return;
    }
    
    headerContainer.innerHTML = "";
    
    console.log('Renderizando header para rol:', rol, 'autenticado:', autenticado);
    
    if (rol === 'admin') {
        headerContainer.appendChild(headerAdministrador());
        console.log('Header de administrador renderizado');
    } else if (rol === 'panaderia') {
        headerContainer.appendChild(headerPanadero());
        console.log('Header de panadero renderizado');
    } else {
        // Header de cliente (normal)
        headerContainer.appendChild(header());
        console.log('Header normal renderizado');
    }
}

/**
 * Función para verificar si el usuario puede acceder a una vista específica según su rol
 */
export const puedeAccederPorRol = (vistaRequerida) => {
    const usuario = getUsuario();
    if (!usuario) return false;

    // Definir qué vistas puede ver cada rol
    const permisosVistas = {
        'administrador': [
            'inicio', 'catalogo', 'productos', 'crearproducto', 
            'usuarios', 'pedidos', 'reportes', 'configuracion'
        ],
        'admin': [
            'inicio', 'catalogo', 'productos', 'crearproducto', 
            'usuarios', 'pedidos', 'reportes', 'configuracion'
        ],
        'panadero': [
            'inicio', 'catalogo', 'productos', 'crearproducto', 'pedidos'
        ],
        'cliente': [
            'inicio', 'catalogo', 'productos'
        ]
    };

    const rolUsuario = usuario.rol || 'cliente';
    const vistasPermitidas = permisosVistas[rolUsuario] || permisosVistas['cliente'];
    
    return vistasPermitidas.includes(vistaRequerida);
}

/**
 * Función para obtener las rutas de navegación según el rol del usuario
 */
export const obtenerRutasSegunRol = () => {
    const usuario = getUsuario();
    if (!usuario) return [];

    const rolUsuario = usuario.rol || 'cliente';

    // Definir rutas disponibles por rol
    const rutasPorRol = {
        'administrador': [
            { nombre: 'Inicio', ruta: 'inicio', icono: '🏠' },
            { nombre: 'Catálogo', ruta: 'catalogo', icono: '📚' },
            { nombre: 'Productos', ruta: 'productos', icono: '🍞' },
            { nombre: 'Crear Producto', ruta: 'crearproducto', icono: '➕' },
            { nombre: 'Usuarios', ruta: 'usuarios', icono: '👥' },
            { nombre: 'Pedidos', ruta: 'pedidos', icono: '📦' },
            { nombre: 'Reportes', ruta: 'reportes', icono: '📊' },
            { nombre: 'Configuración', ruta: 'configuracion', icono: '⚙️' }
        ],
        'admin': [
            { nombre: 'Inicio', ruta: 'inicio', icono: '🏠' },
            { nombre: 'Catálogo', ruta: 'catalogo', icono: '📚' },
            { nombre: 'Productos', ruta: 'productos', icono: '🍞' },
            { nombre: 'Crear Producto', ruta: 'crearproducto', icono: '➕' },
            { nombre: 'Usuarios', ruta: 'usuarios', icono: '👥' },
            { nombre: 'Pedidos', ruta: 'pedidos', icono: '📦' },
            { nombre: 'Reportes', ruta: 'reportes', icono: '📊' },
            { nombre: 'Configuración', ruta: 'configuracion', icono: '⚙️' }
        ],
        'panadero': [
            { nombre: 'Inicio', ruta: 'inicio', icono: '🏠' },
            { nombre: 'Catálogo', ruta: 'catalogo', icono: '📚' },
            { nombre: 'Productos', ruta: 'productos', icono: '🍞' },
            { nombre: 'Crear Producto', ruta: 'crearproducto', icono: '➕' },
            { nombre: 'Pedidos', ruta: 'pedidos', icono: '📦' }
        ],
        'cliente': [
            { nombre: 'Inicio', ruta: 'inicio', icono: '🏠' },
            { nombre: 'Catálogo', ruta: 'catalogo', icono: '📚' },
            { nombre: 'Productos', ruta: 'productos', icono: '🍞' }
        ]
    };

    return rutasPorRol[rolUsuario] || rutasPorRol['cliente'];
}

/**
 * Función para redirigir al usuario a su página de inicio según su rol
 */
export const redirigirSegunRol = () => {
    const usuario = getUsuario();
    if (!usuario) {
        // Si no hay usuario, ir al login
        if (window.navigate) {
            window.navigate('login');
        } else {
            window.location.hash = '#/login';
        }
        return;
    }

    const rolUsuario = usuario.rol || 'cliente';
    let rutaInicio = 'inicio'; // Por defecto

    // Opcional: diferentes páginas de inicio según el rol
    if (esAdministrador()) {
        rutaInicio = 'inicio'; // Los admin van al inicio normal, pero con header diferente
    } else if (esPanadero()) {
        rutaInicio = 'inicio'; // Los panaderos también van al inicio
    }

    console.log(`Redirigiendo usuario ${rolUsuario} a: ${rutaInicio}`);
    
    if (window.navigate) {
        window.navigate(rutaInicio);
    } else {
        window.location.hash = `#/${rutaInicio}`;
    }
}
