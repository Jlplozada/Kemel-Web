import { API_URL } from '../../helpers/api.js';
import { getData } from '../../helpers/auth.js';
import { navigate } from '../../router/router.js';
import { alertaError, alertaExito, alertaConfirmacion, alertaLoading, cerrarAlerta, toast } from '../../helpers/alertas.js';

class UsuariosControlador {
    constructor() {
        this.usuarios = [];
        this.filtroEstado = 'activo';
        this.filtroRol = 'todos';
        this.busquedaActual = '';
        this.usuarioAEliminar = null;
        this.usuarioARestaurar = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.cargarUsuarios();
    }

    initializeElements() {
        this.usuariosTable = document.getElementById('usuarios-table');
        this.usuariosTbody = document.getElementById('usuarios-tbody');
        this.loadingSpinner = document.getElementById('loading-usuarios');
        this.noUsuarios = document.getElementById('no-usuarios');
        this.buscarInput = document.getElementById('buscar-usuario');
        this.btnBuscar = document.getElementById('btn-buscar');
        this.filtroEstadoSelect = document.getElementById('filtro-estado');
        this.filtroRolSelect = document.getElementById('filtro-rol');
        this.btnCrearUsuario = document.getElementById('btn-crear-usuario');
        this.btnExportar = document.getElementById('btn-exportar');
        this.mensajeResultado = document.getElementById('mensaje-resultado');
        
        // Modales
        this.modalEliminar = document.getElementById('modal-eliminar');
        this.modalRestaurar = document.getElementById('modal-restaurar');
        this.btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
        this.btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
        this.btnConfirmarRestaurar = document.getElementById('btn-confirmar-restaurar');
        this.btnCancelarRestaurar = document.getElementById('btn-cancelar-restaurar');
        this.usuarioNombreEliminar = document.getElementById('usuario-nombre-eliminar');
        this.usuarioCorreoEliminar = document.getElementById('usuario-correo-eliminar');
        this.usuarioNombreRestaurar = document.getElementById('usuario-nombre-restaurar');
        this.usuarioCorreoRestaurar = document.getElementById('usuario-correo-restaurar');
    }

    setupEventListeners() {
        // Búsqueda
        this.btnBuscar?.addEventListener('click', () => this.filtrarUsuarios());
        this.buscarInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.filtrarUsuarios();
            }
        });
        this.buscarInput?.addEventListener('input', () => {
            if (this.buscarInput.value === '') {
                this.filtrarUsuarios();
            }
        });

        // Filtros
        this.filtroEstadoSelect?.addEventListener('change', () => {
            this.filtroEstado = this.filtroEstadoSelect.value;
            this.filtrarUsuarios();
        });

        this.filtroRolSelect?.addEventListener('change', () => {
            this.filtroRol = this.filtroRolSelect.value;
            this.filtrarUsuarios();
        });

        // Botones de acción
        this.btnCrearUsuario?.addEventListener('click', () => {
            navigate('/crear-usuario');
        });

        this.btnExportar?.addEventListener('click', () => {
            this.exportarExcel();
        });

        // Modales
        this.btnCancelarEliminar?.addEventListener('click', () => this.cerrarModalEliminar());
        this.btnCancelarRestaurar?.addEventListener('click', () => this.cerrarModalRestaurar());
        this.btnConfirmarEliminar?.addEventListener('click', () => this.eliminarUsuario());
        this.btnConfirmarRestaurar?.addEventListener('click', () => this.restaurarUsuario());

        // Cerrar modal al hacer click fuera
        this.modalEliminar?.addEventListener('click', (e) => {
            if (e.target === this.modalEliminar) {
                this.cerrarModalEliminar();
            }
        });
        this.modalRestaurar?.addEventListener('click', (e) => {
            if (e.target === this.modalRestaurar) {
                this.cerrarModalRestaurar();
            }
        });
    }

    async cargarUsuarios() {
        try {
            this.showLoading(true);
            const { accessToken } = getData();
            
            const response = await fetch(`${API_URL}/usuarios/admin/todos`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar usuarios');
            }

            this.usuarios = await response.json();
            this.filtrarUsuarios();
            
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.mostrarMensaje('Error al cargar los usuarios', 'error');
            this.usuarios = [];
            this.renderizarUsuarios([]);
        } finally {
            this.showLoading(false);
        }
    }

    filtrarUsuarios() {
        this.busquedaActual = this.buscarInput?.value.toLowerCase().trim() || '';
        
        let usuariosFiltrados = this.usuarios.filter(usuario => {
            // Filtro por estado
            let cumpleEstado = true;
            if (this.filtroEstado !== 'todos') {
                cumpleEstado = usuario.estado === this.filtroEstado;
            }

            // Filtro por rol
            let cumpleRol = true;
            if (this.filtroRol !== 'todos') {
                cumpleRol = usuario.rol === this.filtroRol;
            }

            // Filtro por búsqueda
            let cumpleBusqueda = true;
            if (this.busquedaActual) {
                cumpleBusqueda = 
                    usuario.nombre.toLowerCase().includes(this.busquedaActual) ||
                    usuario.usuario.toLowerCase().includes(this.busquedaActual) ||
                    (usuario.correo && usuario.correo.toLowerCase().includes(this.busquedaActual)) ||
                    (usuario.telefono && usuario.telefono.includes(this.busquedaActual));
            }

            return cumpleEstado && cumpleRol && cumpleBusqueda;
        });

        this.renderizarUsuarios(usuariosFiltrados);
    }

    renderizarUsuarios(usuarios) {
        if (!this.usuariosTbody) return;

        if (usuarios.length === 0) {
            this.usuariosTable.style.display = 'none';
            if (this.noUsuarios) this.noUsuarios.style.display = 'block';
            return;
        }

        this.usuariosTable.style.display = 'table';
        if (this.noUsuarios) this.noUsuarios.style.display = 'none';
        
        this.usuariosTbody.innerHTML = usuarios.map(usuario => 
            this.crearUsuarioRow(usuario)
        ).join('');

        // Agregar event listeners a los botones
        this.agregarEventListenersUsuarios();
    }

    crearUsuarioRow(usuario) {
        const esEliminado = usuario.estado === 'eliminado';
        const fechaRegistro = new Date(usuario.fecha_registro).toLocaleDateString();
        
        return `
            <tr class="${esEliminado ? 'eliminado' : ''}" data-id="${usuario.id}">
                <td>${usuario.id}</td>
                <td title="${usuario.usuario}">${usuario.usuario}</td>
                <td title="${usuario.nombre}">${usuario.nombre}</td>
                <td title="${usuario.correo || 'Sin correo'}">${usuario.correo || 'Sin correo'}</td>
                <td>${usuario.telefono || 'Sin teléfono'}</td>
                <td>${usuario.ciudad_nombre || 'Sin ciudad'}</td>
                <td>
                    <span class="rol-badge ${usuario.rol}">${this.formatearRol(usuario.rol)}</span>
                </td>
                <td>
                    <span class="estado-badge ${usuario.estado}">${this.formatearEstado(usuario.estado)}</span>
                </td>
                <td>${fechaRegistro}</td>
                <td>
                    <div class="acciones-usuario">
                        ${!esEliminado ? `
                            <button class="btn-accion btn-editar" data-id="${usuario.id}">
                                ✏️ Editar
                            </button>
                            <button class="btn-accion btn-eliminar" data-id="${usuario.id}" data-nombre="${usuario.nombre}" data-correo="${usuario.correo || ''}">
                                🗑️ Eliminar
                            </button>
                        ` : `
                            <button class="btn-accion btn-restaurar" data-id="${usuario.id}" data-nombre="${usuario.nombre}" data-correo="${usuario.correo || ''}">
                                ↩️ Restaurar
                            </button>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }

    formatearRol(rol) {
        const roles = {
            'admin': 'Administrador',
            'panaderia': 'Panadero',
            'cliente': 'Cliente'
        };
        return roles[rol] || rol;
    }

    formatearEstado(estado) {
        const estados = {
            'activo': 'Activo',
            'inactivo': 'Inactivo',
            'eliminado': 'Eliminado'
        };
        return estados[estado] || estado;
    }

    agregarEventListenersUsuarios() {
        // Botones de editar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                navigate(`/editar-usuario/${id}`);
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const nombre = e.target.getAttribute('data-nombre');
                const correo = e.target.getAttribute('data-correo');
                await this.confirmarEliminarUsuario(id, nombre, correo);
            });
        });

        // Botones de restaurar
        document.querySelectorAll('.btn-restaurar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const nombre = e.target.getAttribute('data-nombre');
                const correo = e.target.getAttribute('data-correo');
                await this.confirmarRestaurarUsuario(id, nombre, correo);
            });
        });
    }

    async confirmarEliminarUsuario(id, nombre, correo) {
        const resultado = await alertaConfirmacion(
            '¿Eliminar Usuario?',
            `¿Estás seguro de que quieres eliminar a ${nombre} (${correo})?`,
            'Sí, eliminar',
            'Cancelar'
        );

        if (resultado.isConfirmed) {
            await this.eliminarUsuario(id);
        }
    }

    async confirmarRestaurarUsuario(id, nombre, correo) {
        const resultado = await alertaConfirmacion(
            '¿Restaurar Usuario?',
            `¿Estás seguro de que quieres restaurar a ${nombre} (${correo})?`,
            'Sí, restaurar',
            'Cancelar'
        );

        if (resultado.isConfirmed) {
            await this.restaurarUsuario(id);
        }
    }

    async eliminarUsuario(usuarioId) {
        try {
            alertaLoading('Eliminando Usuario', 'Por favor espera...');
            
            const { accessToken } = getData();
            
            const response = await fetch(`${API_URL}/usuarios/${usuarioId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar usuario');
            }

            cerrarAlerta();
            await toast('Usuario eliminado correctamente', 'success');
            this.cargarUsuarios(); // Recargar la lista
            
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            cerrarAlerta();
            await alertaError('Error', 'Error al eliminar el usuario');
        }
    }

    async restaurarUsuario(usuarioId) {
        try {
            alertaLoading('Restaurando Usuario', 'Por favor espera...');
            
            const { accessToken } = getData();
            
            const response = await fetch(`${API_URL}/usuarios/${usuarioId}/restaurar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al restaurar usuario');
            }

            cerrarAlerta();
            await toast('Usuario restaurado correctamente', 'success');
            this.cargarUsuarios(); // Recargar la lista
            
        } catch (error) {
            console.error('Error restaurando usuario:', error);
            cerrarAlerta();
            await alertaError('Error', 'Error al restaurar el usuario');
        }
    }

    exportarExcel() {
        if (this.usuarios.length === 0) {
            this.mostrarMensaje('No hay datos para exportar', 'error');
            return;
        }

        // Crear datos para exportar (sin contraseñas)
        const datosExport = this.usuarios.map(usuario => ({
            'ID': usuario.id,
            'Usuario': usuario.usuario,
            'Nombre': usuario.nombre,
            'Correo': usuario.correo || 'Sin correo',
            'Teléfono': usuario.telefono || 'Sin teléfono',
            'Ciudad': usuario.ciudad_nombre || 'Sin ciudad',
            'Rol': this.formatearRol(usuario.rol),
            'Estado': this.formatearEstado(usuario.estado),
            'Fecha Registro': new Date(usuario.fecha_registro).toLocaleDateString()
        }));

        // Convertir a CSV
        const csv = this.convertirACSV(datosExport);
        
        // Crear y descargar archivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.mostrarMensaje('Archivo Excel exportado correctamente', 'exito');
    }

    convertirACSV(objArray) {
        if (!objArray.length) return '';
        
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = '';
        
        // Headers
        const headers = Object.keys(array[0]);
        str += headers.join(',') + '\r\n';
        
        // Data
        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (const header of headers) {
                if (line !== '') line += ',';
                line += `"${array[i][header]}"`;
            }
            str += line + '\r\n';
        }
        
        return str;
    }

    showLoading(show) {
        if (this.loadingSpinner) this.loadingSpinner.style.display = show ? 'block' : 'none';
        if (this.usuariosTable) this.usuariosTable.style.display = show ? 'none' : 'table';
    }

    mostrarMensaje(mensaje, tipo) {
        if (!this.mensajeResultado) return;
        
        this.mensajeResultado.textContent = mensaje;
        this.mensajeResultado.className = `mensaje-resultado ${tipo}`;
        this.mensajeResultado.style.display = 'block';
        
        setTimeout(() => {
            if (this.mensajeResultado) this.mensajeResultado.style.display = 'none';
        }, 5000);
    }
}

// Función de carga para el router
export const loadUsuarios = () => {
    console.log('Cargando gestión de usuarios...');
    return new UsuariosControlador();
};

// NO ejecutar automáticamente - solo cuando se llame explícitamente desde el router
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('Usuarios controlador ejecutado');
//     new UsuariosControlador();
// });

export default UsuariosControlador;
