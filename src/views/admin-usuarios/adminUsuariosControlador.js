import { API_URL } from '../../helpers/api.js';
import { getData } from '../../helpers/auth.js';
import { alertaError, alertaExito, alertaLoading, cerrarAlerta } from '../../helpers/alertas.js';

export const adminUsuariosControlador = async () => {
    console.log("Ejecutando adminUsuariosControlador...");

    try {
        // Cargar todos los usuarios activos
        await cargarUsuariosAdmin();
        
        // Configurar filtros y botones
        configurarControles();
    } catch (error) {
        console.error('Error al cargar vista de admin usuarios:', error);
        await alertaError('Error', 'Error al cargar la gestión de usuarios');
    }
};

// Función para cargar todos los usuarios con estado activo
const cargarUsuariosAdmin = async (filtroRol = '') => {
    const tbody = document.getElementById('tbody-admin-usuarios');
    const mensajeSinUsuarios = document.getElementById('mensaje-sin-usuarios');
    
    if (!tbody) return;

    try {
        alertaLoading('Cargando', 'Obteniendo usuarios...');

        const { token } = getData();
        let url = `${API_URL}/usuarios/admin`;
        if (filtroRol) {
            url += `?rol=${filtroRol}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const resultado = await response.json();
        cerrarAlerta();

        console.log("=== RESPUESTA DEL SERVIDOR USUARIOS ===");
        console.log("Success:", resultado.success);
        console.log("Datos recibidos:", resultado.data);
        console.log("Cantidad de usuarios:", resultado.data ? resultado.data.length : 0);

        if (resultado.success && resultado.data.length > 0) {
            tbody.innerHTML = '';
            mensajeSinUsuarios.style.display = 'none';

            resultado.data.forEach((usuario, usuarioIndex) => {
                console.log(`=== PROCESANDO USUARIO ${usuarioIndex + 1} ===`);
                console.log("Usuario:", usuario);
                
                // Determinar si el usuario es par o impar para el color de fondo
                const esUsuarioPar = usuarioIndex % 2 === 0;
                const claseUsuario = esUsuarioPar ? 'pedido-par' : 'pedido-impar';
                
                const fila = crearFilaUsuarioAdmin(usuario, claseUsuario);
                tbody.appendChild(fila);
            });
        } else {
            tbody.innerHTML = '';
            mensajeSinUsuarios.style.display = 'block';
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al cargar usuarios admin:', error);
        await alertaError('Error', 'Error al cargar los usuarios');
    }
};

// Función para crear una fila de usuario en la tabla de admin
const crearFilaUsuarioAdmin = (usuario, claseUsuario) => {
    console.log("Creando fila para usuario:", usuario);
    
    const fila = document.createElement('tr');
    fila.className = claseUsuario;

    // Formatear fecha
    const fechaRegistro = new Date(usuario.fecha_registro).toLocaleDateString('es-CO');

    fila.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.usuario}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.correo || 'Sin correo'}</td>
        <td>${usuario.telefono || 'Sin teléfono'}</td>
        <td>${crearSelectRol(usuario.rol, usuario.id)}</td>
        <td>${fechaRegistro}</td>
        <td>
            <button class="eliminar-btn" onclick="eliminarUsuario(${usuario.id})">
                Eliminar
            </button>
        </td>
    `;

    return fila;
};

// Función para crear select de rol
const crearSelectRol = (rolActual, usuarioId) => {
    const roles = ['admin', 'panaderia', 'cliente'];
    
    let selectHTML = `<select class="estado-select" onchange="cambiarRolUsuario(${usuarioId}, this.value, this)">`;
    
    roles.forEach(rol => {
        const selected = rol === rolActual ? 'selected' : '';
        selectHTML += `<option value="${rol}" ${selected}>${rol.charAt(0).toUpperCase() + rol.slice(1)}</option>`;
    });
    
    selectHTML += '</select>';
    return selectHTML;
};

// Configurar controles
const configurarControles = () => {
    const filtroRol = document.getElementById('filtro-rol');

    if (filtroRol) {
        filtroRol.addEventListener('change', (e) => {
            cargarUsuariosAdmin(e.target.value);
        });
    }
};

// Función global para cambiar rol de usuario
window.cambiarRolUsuario = async (usuarioId, nuevoRol, selectElement) => {
    if (!nuevoRol) return;

    console.log(`=== CAMBIANDO ROL DE USUARIO ===`);
    console.log("ID Usuario:", usuarioId);
    console.log("Nuevo rol:", nuevoRol);

    const selectOriginal = selectElement.cloneNode(true);

    try {
        // Deshabilitar el select mientras se procesa
        selectElement.disabled = true;

        const { token } = getData();
        const response = await fetch(`${API_URL}/usuarios/${usuarioId}/rol`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rol: nuevoRol })
        });

        const resultado = await response.json();
        console.log("Respuesta del servidor:", resultado);

        if (resultado.success) {
            await alertaExito('¡Éxito!', `Rol actualizado a ${nuevoRol}`);
        } else {
            // Revertir el select al valor anterior
            selectElement.parentNode.replaceChild(selectOriginal, selectElement);
            await alertaError('Error', resultado.error || 'Error al actualizar el rol');
        }
    } catch (error) {
        // Revertir el select al valor anterior
        selectElement.parentNode.replaceChild(selectOriginal, selectElement);
        console.error('Error al cambiar rol del usuario:', error);
        await alertaError('Error', 'Error al actualizar el rol del usuario');
    } finally {
        // Re-habilitar el select
        const currentSelect = selectElement.parentNode.querySelector('.estado-select');
        if (currentSelect) {
            currentSelect.disabled = false;
        }
    }
};

// Función global para editar usuario
window.editarUsuario = async (usuarioId) => {
    // Por ahora solo mostrar mensaje, implementar según necesidades
    alertaExito('Editar Usuario', `Funcionalidad de edición en desarrollo para usuario ID: ${usuarioId}`);
};

// Función global para eliminar usuario
window.eliminarUsuario = async (usuarioId) => {
    try {
        alertaLoading('Eliminando', 'Eliminando usuario...');

        const { token } = getData();
        const response = await fetch(`${API_URL}/usuarios/${usuarioId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const resultado = await response.json();
        cerrarAlerta();

        if (resultado.success) {
            await alertaExito('¡Éxito!', 'Usuario eliminado correctamente');
            // Recargar la tabla
            const filtroActual = document.getElementById('filtro-rol').value;
            await cargarUsuariosAdmin(filtroActual);
        } else {
            await alertaError('Error', resultado.error || 'Error al eliminar el usuario');
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al eliminar usuario:', error);
        await alertaError('Error', 'Error al eliminar el usuario');
    }
};

// Mantener compatibilidad con el nombre anterior
export const loadAdminUsuarios = adminUsuariosControlador;