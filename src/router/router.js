import { Autenticado } from "../helpers/auth.js";
import { loadView } from "../helpers/loadView";
import { inicioControlador } from "../views/inicio/inicioControlador.js";
import { catalogoControlador } from "../views/catalogo/catalogoControlador.js";
import { registrarseControlador } from "../views/login/registrarse/registrarseControlador.js";
import { validarControlador } from "../views/login/validar/validarControlador.js";
import { loadCrearProducto } from "../views/crearproducto/crearProducto.js";
import { loadAdministrarProductos } from "../views/administrar-productos/administrarProductosControlador.js";
import { loadUsuarios } from "../views/usuarios/usuariosControlador.js";
import { cuentaControlador } from "../views/cuenta/cuentaControlador.js";
import { pedidosPendientesControlador } from "../views/pedidos-pendientes/pedidosPendientesControlador.js";
import { adminPedidosControlador } from "../views/admin-pedidos/adminPedidosControlador.js";
import { adminUsuariosControlador } from "../views/admin-usuarios/adminUsuariosControlador.js";
import { loadDetallePedido } from "../views/detalle-pedido/detallePedidoControlador.js";

const routes = {
    login: {
        template: "login/validar/index.html",
        controlador: validarControlador,
        private: false,
    },
    cuenta: {
        template: "cuenta/index.html",
        controlador: cuentaControlador,
        private: true,
    },
    "": {
        template: "inicio/index.html",
        controlador: inicioControlador,
        private: false,
    },
    inicio: {
        template: "inicio/index.html",
        controlador: inicioControlador,
        private: false,
    },
    catalogo: {
        template: "catalogo/index.html",
        controlador: catalogoControlador,
        private: false,
    },
    register: {
        template: "login/registrarse/index.html",
        controlador: registrarseControlador,
        private: false,
    },
    validar:{
        template: "login/validar/index.html",
        controlador: validarControlador,
        private: true,
    },
    panadero: {
        template: "panadero/index.html",
        controlador: '',
        private: true,
    },
    administrador: {
        template: "administrador/index.html",
        controlador: '',
        private: true,
    },
    pedidos: {
        template: "pedidos/index.html",
        controlador: '',
        private: true,
    },
    productos: {
        template: "productos/index.html",
        controlador: '',
        private: true,
    },
    clientes: {
        template: "usuarios/index.html",
        controlador: '',
        private: true,
    },
    usuarios: {
        template: "usuarios/index.html",
        controlador: loadUsuarios,
        private: true,
    },
    "pedidos-pendientes": {
        template: "pedidos-pendientes/index.html",
        controlador: pedidosPendientesControlador,
        private: true,
    },
    "admin-pedidos": {
        template: "admin-pedidos/index.html",
        controlador: adminPedidosControlador,
        private: true,
    },
    "admin-usuarios": {
        template: "admin-usuarios/index.html",
        controlador: adminUsuariosControlador,
        private: true,
    },
    "administrar-productos": {
        template: "administrar-productos/index.html",
        controlador: loadAdministrarProductos,
        private: true,
    },
    "detalle-pedido": {
        template: "detalle-pedido/index.html",
        controlador: loadDetallePedido,
        private: true,
    },
    "crear-producto": {
        template: "crearproducto/index.html",
        controlador: loadCrearProducto,
        private: true,
    },
    // Puedes agregar más rutas aquí, incluyendo rutas con parámetros dinámicos si lo necesitas
    // ejemplo: "producto/:id": { ... }
};

// Función principal del router
export const router = async (app) => {
    // Usar hash para SPA
    let hash = location.hash.replace('#', '') || ''; // Quita el # inicial
    
    console.log('Router ejecutándose con hash:', hash);
    
    // Si no hay hash o está vacío, establecer 'inicio' como hash por defecto
    if (hash === '' || hash === '/' || hash === null || hash === undefined) {
        console.log('Hash vacío, redirigiendo a inicio');
        hash = 'inicio';
        // Establecer el hash sin disparar hashchange
        history.replaceState(null, '', '#inicio');
    }
    
    const [rutas, params] = matchRoute(hash); // Busca la ruta y extrae parámetros

    console.log('Ruta encontrada:', rutas);
    console.log('Parámetros:', params);

    if (!rutas) {
        console.log('No se encontró ruta, cargando inicio por defecto');
        // Si la ruta no existe, redirige a inicio
        await loadView(app, "inicio/index.html");
        if (inicioControlador) inicioControlador();
        return;
    }

    // Si la ruta es privada y el usuario no está autenticado, redirige a login
    if (rutas.private && !Autenticado()) {
        console.log('Ruta privada sin autenticación, redirigiendo a login');
        await loadView(app, "login/validar/index.html");
        if (validarControlador) validarControlador();
        return;
    }

    console.log('Cargando vista:', rutas.template);
    console.log('Controlador a ejecutar:', rutas.controlador?.name || 'Sin controlador');

    // Carga la vista correspondiente
    await loadView(app, rutas.template);

    // Ejecuta el controlador, pasando los parámetros si existen
    if (rutas.controlador) {
        rutas.controlador(params);
    }
};

// Busca la ruta que coincide y extrae los parámetros dinámicos
const matchRoute = (hash) => {
    // Separar la ruta base de los parámetros de consulta
    const [baseRoute, queryString] = hash.split('?');
    
    // Búsqueda exacta primero con la ruta base
    if (routes[baseRoute]) {
        // Si hay parámetros de consulta, parsearlos
        const queryParams = {};
        if (queryString) {
            const urlParams = new URLSearchParams(queryString);
            for (const [key, value] of urlParams) {
                queryParams[key] = value;
            }
        }
        return [routes[baseRoute], queryParams];
    }
    
    // Si no hay coincidencia exacta, buscar con parámetros dinámicos
    const arreglo = baseRoute.split('/');

    for (const route in routes) {
        const b = route.split('/');
        if (b.length !== arreglo.length) continue;

        const params = {};
        const matched = b.every((parte, i) => {
            if (parte.startsWith(":")) {
                const partName = parte.slice(1);
                params[partName] = arreglo[i];
                return true;
            }
            return parte === arreglo[i];
        });

        if (matched) {
            // Agregar también los parámetros de consulta si existen
            if (queryString) {
                const urlParams = new URLSearchParams(queryString);
                for (const [key, value] of urlParams) {
                    params[key] = value;
                }
            }
            return [routes[route], params];
        }
    }

    return [null, null];
};

// Navegación SPA: cambia el hash y dispara el router
export function navigate(ruta) {
    const newHash = `#${ruta}`;
    if (location.hash !== newHash) {
        location.hash = newHash;
    } else {
        // Si ya estamos en la ruta, forzar recarga del router
        router(document.querySelector('#app'));
    }
}

// Hacer navigate disponible globalmente
window.navigate = navigate;

// Escucha el evento hashchange para navegación con hash
window.addEventListener('hashchange', () => {
    router(document.querySelector('#app'));
});
