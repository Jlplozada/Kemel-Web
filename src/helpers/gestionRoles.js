import { esAdministrador, esPanadero, getUsuario } from './auth.js';

/**
 * Función para cargar el header correcto según el rol del usuario
 * Se ejecuta después del login exitoso o al verificar autenticación
 */
export const cargarHeaderSegunRol = async () => {
    console.log("Cargando header según rol del usuario...");
    
    const usuario = getUsuario();
    if (!usuario) {
        console.log("No hay usuario logueado, no se carga header");
        return;
    }

    console.log(`Usuario: ${usuario.nombre}, Rol: ${usuario.rol}`);

    // Determinar qué header cargar según el rol
    let headerControlador = null;
    let nombreHeader = '';

    if (esAdministrador()) {
        // Cargar header de administrador
        try {
            const { headerAdministradorControlador } = await import('../components/header/headerAdministrador.js');
            headerControlador = headerAdministradorControlador;
            nombreHeader = 'Administrador';
        } catch (error) {
            console.error('Error al cargar header de administrador:', error);
        }
    } else if (esPanadero()) {
        // Cargar header de panadero
        try {
            const { headerPanaderoControlador } = await import('../components/header/headerPanadero.js');
            headerControlador = headerPanaderoControlador;
            nombreHeader = 'Panadero';
        } catch (error) {
            console.error('Error al cargar header de panadero:', error);
        }
    } else {
        // Cargar header normal para usuarios
        try {
            const { headerControlador: headerNormal } = await import('../components/header/header.js');
            headerControlador = headerNormal;
            nombreHeader = 'Usuario';
        } catch (error) {
            console.error('Error al cargar header normal:', error);
        }
    }

    // Ejecutar el controlador del header si se cargó correctamente
    if (headerControlador) {
        console.log(`Cargando header de ${nombreHeader}...`);
        headerControlador();
    } else {
        console.error('No se pudo cargar ningún header');
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
