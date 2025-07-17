// Router SPA con rutas personalizadas y soporte para autenticación
import { Autenticado } from "../helpers/auth.js";
import { loadView } from "../helpers/loadView";
// Importa aquí tus controladores según la estructura de tu proyecto
// Ejemplo:
import { inicioControlador } from "../views/inicio/inicioControlador.js";
// import { productosController } from "../views/productos/controllers/productosController.js";
// ...

const routes = {
    "": {
        template: "inicio/inicio.html",
        controlador: inicioControlador,
        private: false,
    },
    inicio: {
        template: "inicio/inicio.html",
        controlador: inicioControlador,
        private: false,
    },
    productos: {
        template: "productos/index.html",
        controlador: window.productosController,
        private: false,
    },
    register: {
        template: "registro/registro.html",
        controlador: window.registroController,
        private: false,
    },
    panadero: {
        template: "panadero/index.html",
        controlador: window.panaderoController,
        private: true,
    },
    administrador: {
        template: "administrador/index.html",
        controlador: window.administradorController,
        private: true,
    },
    pedidos: {
        template: "pedidos/index.html",
        controlador: window.pedidosController,
        private: true,
    },
    catalogo: {
        template: "catalogo/index.html",
        controlador: window.catalogoController,
        private: false,
    },
    // Puedes agregar más rutas aquí, incluyendo rutas con parámetros dinámicos si lo necesitas
    // ejemplo: "producto/:id": { ... }
};

// Función principal del router
export const router = async (app) => {
    // Usar pathname en vez de hash
    const path = location.pathname.replace(/^\//, ''); // Quita el / inicial
    const [rutas, params] = matchRoute(path); // Busca la ruta y extrae parámetros

    if (!rutas) {
        // Si la ruta no existe, redirige a inicio
        await loadView(app, "inicio/index.html");
        if (window.inicioController) window.inicioController();
        return;
    }

    // Si la ruta es privada y el usuario no está autenticado, redirige a register
    if (rutas.private && !Autenticado()) {
        await loadView(app, "registro/registro.html");
        if (window.registroController) window.registroController();
        return;
    }

    // Carga la vista correspondiente
    await loadView(app, rutas.template);

    // Ejecuta el controlador, pasando los parámetros si existen
    if (rutas.controlador) rutas.controlador(params);
};

// Busca la ruta que coincide y extrae los parámetros dinámicos
const matchRoute = (hash) => {
    const arreglo = hash.split('/');

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
            return [routes[route], params];
        }
    }

    return [null, null];
};

// Navegación SPA: cambia el hash y dispara el router
export function navigate(ruta) {
    const newPath = `/${ruta}`;
    if (location.pathname !== newPath) {
        history.pushState({}, '', newPath);
        router(document.querySelector('#app'));
    } else {
        // Si ya estamos en la ruta, forzar recarga del router
        router(document.querySelector('#app'));
    }
}

// Escucha el evento popstate para navegación con botones del navegador
window.addEventListener('popstate', () => {
    router(document.querySelector('#app'));
});
