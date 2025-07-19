import "./style.css";
import { Autenticado, getData } from "./helpers/auth.js";
import { API_URL } from "./helpers/api.js";
import { renderHeaderPorRol } from "./helpers/gestionRoles.js";
import { router } from "./router/router.js";
import { footer } from "./components/footer/footer.js";
// Importa aquí otros componentes o helpers si los necesitas

// Obtener datos del usuario autenticado
const { token } = getData();

// Selecciona el contenedor principal de la app
const app = document.querySelector('#app');

// Renderiza el header correspondiente según el rol
const headerContainer = document.querySelector('#header');
let headerRendered = false;

// Ejemplo de manejo de botones según autenticación
const subir_crear = document.querySelector('.subir_crear');
const subir_capitulo = document.querySelector('.subir_capitulo');

if (subir_crear && !Autenticado()) {
    subir_crear.remove();
}

// Obtener perfil del usuario autenticado (si hay token) y renderizar header según rol
let perfilData = null;
if (token) {
  try {
    // Primero intentar obtener datos del localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      perfilData = JSON.parse(usuarioGuardado);
      console.log('Datos de usuario desde localStorage:', perfilData);
      renderHeaderPorRol(perfilData.rol, true);
    } else {
      // Si no hay datos en localStorage, hacer petición a la API
      console.log('No hay usuario en localStorage, limpiando token');
      localStorage.removeItem('token');
      renderHeaderPorRol(undefined, false);
    }
  } catch (e) {
    console.error('Error al procesar datos del usuario:', e);
    // Si hay error, limpiar tokens
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    renderHeaderPorRol(undefined, false);
  }
} else {
  // Si no hay token, renderizar header por defecto (no autenticado)
  console.log('No hay token, renderizando header no autenticado');
  renderHeaderPorRol(undefined, false);
}

// Manejo de navegación SPA
document.addEventListener("DOMContentLoaded", () => {
    // Verificar si la URL está vacía y redirigir a inicio
    if (window.location.hash === '' || window.location.hash === '#' || window.location.hash === '#/') {
        console.log('URL vacía detectada, redirigiendo a inicio');
        window.location.hash = '#inicio';
    }
    
    // Inicializar el router
    router(app);
    
    // Renderizar footer solo una vez
    if (!document.querySelector('footer.footer')) {
        document.body.appendChild(footer());
    }
});

// También verificar cuando la página se carga completamente
window.addEventListener('load', () => {
    if (window.location.hash === '' || window.location.hash === '#' || window.location.hash === '#/') {
        console.log('URL vacía en load, redirigiendo a inicio');
        window.location.hash = '#inicio';
    }
});
