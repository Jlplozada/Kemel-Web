import { clearAuth, getUsuario } from './auth.js';
import { logout } from './api.js';
import { alertaConfirmacion } from './alertas.js';

// Función simple para agregar un botón de cerrar sesión a cualquier vista
export const agregarBotonCerrarSesion = (contenedor) => {
    // Crear el botón de cerrar sesión
    const botonLogout = document.createElement('button');
    botonLogout.textContent = 'Cerrar Sesión';
    botonLogout.className = 'btn-logout';
    
    // Estilos simples para el botón
    botonLogout.style.cssText = `
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin: 10px;
        font-size: 14px;
    `;
    
    // Hover effect
    botonLogout.addEventListener('mouseenter', () => {
        botonLogout.style.backgroundColor = '#c82333';
    });
    
    botonLogout.addEventListener('mouseleave', () => {
        botonLogout.style.backgroundColor = '#dc3545';
    });
    
    // Acción al hacer clic
    botonLogout.addEventListener('click', async () => {
        // Confirmar antes de cerrar sesión
        const resultado = await alertaConfirmacion(
            '¿Cerrar Sesión?', 
            '¿Estás seguro de que quieres cerrar sesión?',
            'Sí, cerrar sesión',
            'Cancelar'
        );
        
        if (resultado.isConfirmed) {
            console.log("Cerrando sesión...");
            
            // Cambiar texto del botón mientras procesa
            botonLogout.textContent = 'Cerrando...';
            botonLogout.disabled = true;
            
            try {
                // Intentar hacer logout en la API (opcional)
                await logout();
            } catch (error) {
                console.log("Error al hacer logout en API:", error);
                // Continuamos con el logout local aunque falle la API
            }
            
            // Limpiar datos locales
            clearAuth();
            
            // Redirigir al login
            if (window.navigate) {
                window.navigate('login');
            } else {
                window.location.hash = '#/login';
            }
        }
    });
    
    // Agregar el botón al contenedor especificado
    if (contenedor) {
        contenedor.appendChild(botonLogout);
    }
    
    return botonLogout;
}

// Función para mostrar información del usuario en la interfaz
export const mostrarInfoUsuario = (contenedor) => {
    // Obtener información del usuario
    const usuario = getUsuario();
    
    if (!usuario) {
        console.log("No hay información de usuario");
        return;
    }
    
    // Crear elemento para mostrar la info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info-usuario';
    infoDiv.style.cssText = `
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 10px;
        margin: 10px;
    `;
    
    // Agregar información del usuario
    infoDiv.innerHTML = `
        <p><strong>Nombre:</strong> ${usuario.nombre}</p>
        <p><strong>Email:</strong> ${usuario.correo}</p>
        ${usuario.telefono ? `<p><strong>Teléfono:</strong> ${usuario.telefono}</p>` : ''}
    `;
    
    // Agregar al contenedor
    if (contenedor) {
        contenedor.appendChild(infoDiv);
    }
    
    return infoDiv;
}
