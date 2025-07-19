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

        if (resultado.success && resultado.data.length > 0) {
            tbody.innerHTML = '';
            mensajeSinUsuarios.style.display = 'none';

            resultado.data.forEach(usuario => {
                const fila = crearFilaUsuarioAdmin(usuario);
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
const crearFilaUsuarioAdmin = (usuario) => {
    const fila = document.createElement('tr');

    // Formatear fecha
    const fechaRegistro = new Date(usuario.fecha_registro).toLocaleDateString('es-CO');
    
    // Clase CSS según rol
    const rolClass = `rol-${usuario.rol}`;

    fila.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.usuario}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.correo || 'Sin correo'}</td>
        <td>${usuario.telefono || 'Sin teléfono'}</td>
        <td><span class="${rolClass}">${usuario.rol}</span></td>
        <td>${fechaRegistro}</td>
        <td>
            ${crearBotonesAccionUsuario(usuario)}
        </td>
    `;

    return fila;
};

// Función para crear botones de acción para usuarios
const crearBotonesAccionUsuario = (usuario) => {
    return `
        <select class="select-rol" onchange="cambiarRolUsuario(${usuario.id}, this.value)">
            <option value="">Cambiar rol</option>
            <option value="admin" ${usuario.rol === 'admin' ? 'disabled' : ''}>Admin</option>
            <option value="panaderia" ${usuario.rol === 'panaderia' ? 'disabled' : ''}>Panadero</option>
            <option value="cliente" ${usuario.rol === 'cliente' ? 'disabled' : ''}>Cliente</option>
        </select>
        <button class="btn-accion btn-editar" onclick="editarUsuario(${usuario.id})">
            Editar
        </button>
        <button class="btn-accion btn-eliminar" onclick="eliminarUsuario(${usuario.id})">
            Eliminar
        </button>
    `;
};

// Configurar controles
const configurarControles = () => {
    const filtroRol = document.getElementById('filtro-rol');
    const btnCrearUsuario = document.getElementById('btn-crear-usuario');

    if (filtroRol) {
        filtroRol.addEventListener('change', (e) => {
            cargarUsuariosAdmin(e.target.value);
        });
    }

    if (btnCrearUsuario) {
        btnCrearUsuario.addEventListener('click', crearNuevoUsuario);
    }
};

// Función global para cambiar rol de usuario
window.cambiarRolUsuario = async (usuarioId, nuevoRol) => {
    if (!nuevoRol) return;

    try {
        alertaLoading('Actualizando', `Cambiando rol a ${nuevoRol}...`);

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
        cerrarAlerta();

        if (resultado.success) {
            await alertaExito('¡Éxito!', `Rol actualizado a ${nuevoRol}`);
            // Recargar la tabla
            const filtroActual = document.getElementById('filtro-rol').value;
            await cargarUsuariosAdmin(filtroActual);
        } else {
            await alertaError('Error', resultado.error || 'Error al actualizar el rol');
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al cambiar rol del usuario:', error);
        await alertaError('Error', 'Error al actualizar el rol del usuario');
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

// Función para crear nuevo usuario
const crearNuevoUsuario = () => {
    // Por ahora solo mostrar mensaje, implementar según necesidades
    alertaExito('Crear Usuario', 'Funcionalidad de creación de usuarios en desarrollo');
};
