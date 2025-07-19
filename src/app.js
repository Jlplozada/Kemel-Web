import "./style.css";
import { Autenticado, getData } from "./helpers/auth.js";
import { API_URL } from "./helpers/api.js";
import { header } from "./components/header/header.js";
import { headerAdministrador } from "./components/header/headerAdministrador.js";
import { headerPanadero } from "./components/header/headerPanadero.js";
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

// Renderiza el header según el rol y el estado de autenticación
function renderHeaderPorRol(rol, autenticado = false) {
  if (!headerContainer) return;
  headerContainer.innerHTML = "";
  if (rol === 'admin') {
    headerContainer.appendChild(headerAdministrador());
    headerRendered = true;
  } else if (rol === 'panaderia') {
    headerContainer.appendChild(headerPanadero());
    headerRendered = true;
  } else {
    // El header de cliente puede recibir si está autenticado o no
    headerContainer.appendChild(header({ autenticado }));
    headerRendered = true;
  }
}

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
    const responsePerfil = await fetch(`${API_URL}/api/usuarios/perfil`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const { data } = await responsePerfil.json();
    perfilData = data;
    // Renderizar header según el rol y autenticación
    renderHeaderPorRol(perfilData.rol, true);
  } catch (e) {
    console.error('No se pudo obtener el perfil:', e);
    // Si hay error, renderizar header por defecto (no autenticado)
    renderHeaderPorRol(undefined, false);
  }
} else {
  // Si no hay token, renderizar header por defecto (no autenticado)
  renderHeaderPorRol(undefined, false);
}

// Manejo de navegación SPA - ya está configurado en router.js
// Solo necesitamos inicializar cuando carga la página
document.addEventListener("DOMContentLoaded", () => {
    router(app);
    // Renderizar footer solo una vez
    if (!document.querySelector('footer.footer')) {
        document.body.appendChild(footer());
    }
});
