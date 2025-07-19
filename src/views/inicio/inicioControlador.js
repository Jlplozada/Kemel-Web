import { getUsuario, Autenticado } from '../../helpers/auth.js';
import { cargarHeaderSegunRol } from '../../helpers/gestionRoles.js';

export const inicioControlador = async () => {
    console.log("Ejecutando inicioControlador...");

    // La página de inicio es pública - no necesita protección
    // Solo cargar el header correcto si el usuario está autenticado
    if (Autenticado()) {
        cargarHeaderSegunRol();
    }

    // Limpiar solo el contenedor principal de la app
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = '';

    // Obtener información del usuario para personalizar la bienvenida (si está logueado)
    const usuario = getUsuario();
    const nombreUsuario = usuario ? usuario.nombre : 'Visitante';
    const estaLogueado = Autenticado();

    // Crear sección de bienvenida
    const section = document.createElement('section');
    section.className = 'inicio-section';

    // Título principal personalizado
    const titulo = document.createElement('h1');
    if (estaLogueado) {
        titulo.textContent = `¡Hola ${nombreUsuario}! Bienvenido a Kemel: Panadería Saludable`;
    } else {
        titulo.textContent = '¡Bienvenido a Kemel: Panadería Saludable!';
    }
    section.appendChild(titulo);


    // Contenedor flex para dos bloques independientes
    const flexContainer = document.createElement('div');
    flexContainer.className = 'inicio-flex';

    // Primer bloque: texto 1 + imagen 1
    const bloque1 = document.createElement('div');
    bloque1.className = 'inicio-bloque';
    const texto1 = document.createElement('div');
    texto1.className = 'inicio-texto';
    const intro = document.createElement('p');
    intro.textContent = 'En Kemel, creemos que el pan puede ser delicioso y saludable. Descubre nuestras variedades elaboradas con ingredientes naturales, integrales y sin aditivos, pensadas para cuidar tu bienestar y el de tu familia.';
    texto1.appendChild(intro);
    const img1 = document.createElement('img');
    img1.src = '/public/img/1.png';
    img1.alt = 'Pan saludable Kemel';
    img1.className = 'img-inicio';
    bloque1.appendChild(texto1);
    bloque1.appendChild(img1);

    // Segundo bloque: texto 2 + imagen 2
    const bloque2 = document.createElement('div');
    bloque2.className = 'inicio-bloque';
    const texto2 = document.createElement('div');
    texto2.className = 'inicio-texto';
    const textoSalud = document.createElement('p');
    textoSalud.textContent = 'Nuestro pan no contiene conservantes ni aditivos artificiales. Está hecho con granos enteros, semillas y grasas saludables que favorecen la saciedad y pueden apoyar estilos de vida como la cetosis. Es ideal para quienes buscan una alimentación natural, rica en fibra y nutrientes esenciales.';
    texto2.appendChild(textoSalud);
    const img2 = document.createElement('img');
    img2.src = '/public/img/2.png';
    img2.alt = 'Pan saludable con semillas';
    img2.className = 'img-inicio';
    bloque2.appendChild(texto2);
    bloque2.appendChild(img2);

    flexContainer.appendChild(bloque1);
    flexContainer.appendChild(bloque2);
    section.appendChild(flexContainer);

    // Agregar sección al contenedor principal
    app.appendChild(section);
};