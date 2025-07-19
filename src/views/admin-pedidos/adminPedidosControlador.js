import { API_URL } from '../../helpers/api.js';
import { getData } from '../../helpers/auth.js';
import { alertaError, alertaExito, alertaLoading, cerrarAlerta } from '../../helpers/alertas.js';

export const adminPedidosControlador = async () => {
    console.log("Ejecutando adminPedidosControlador...");

    try {
        // Cargar todos los pedidos activos
        await cargarPedidosAdmin();
        
        // Configurar filtros
        configurarFiltros();
    } catch (error) {
        console.error('Error al cargar vista de admin pedidos:', error);
        await alertaError('Error', 'Error al cargar la gestión de pedidos');
    }
};

// Función para cargar todos los pedidos con estado_registro activo
const cargarPedidosAdmin = async (filtroEstado = '') => {
    const tbody = document.getElementById('tbody-admin-pedidos');
    const mensajeSinPedidos = document.getElementById('mensaje-sin-pedidos');
    
    if (!tbody) return;

    try {
        alertaLoading('Cargando', 'Obteniendo todos los pedidos...');

        const { token } = getData();
        let url = `${API_URL}/pedidos/admin`;
        if (filtroEstado) {
            url += `?estado=${filtroEstado}`;
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
            mensajeSinPedidos.style.display = 'none';

            resultado.data.forEach(pedido => {
                const fila = crearFilaPedidoAdmin(pedido);
                tbody.appendChild(fila);
            });
        } else {
            tbody.innerHTML = '';
            mensajeSinPedidos.style.display = 'block';
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al cargar pedidos admin:', error);
        await alertaError('Error', 'Error al cargar los pedidos');
    }
};

// Función para crear una fila de pedido en la tabla de admin
const crearFilaPedidoAdmin = (pedido) => {
    const fila = document.createElement('tr');

    // Formatear fecha
    const fecha = new Date(pedido.fecha_pedido).toLocaleDateString('es-CO');
    
    // Formatear productos
    const productosTexto = pedido.productos ? 
        pedido.productos.map(p => `${p.nombre} (x${p.cantidad})`).join(', ') : 
        'Sin detalles';

    // Clase CSS según estado
    const estadoClass = `estado-${pedido.estado}`;

    fila.innerHTML = `
        <td>${pedido.id}</td>
        <td>${pedido.nombre_usuario || 'Cliente'}</td>
        <td>${fecha}</td>
        <td><span class="${estadoClass}">${pedido.estado}</span></td>
        <td>${pedido.direccion_entrega || 'Sin dirección'}</td>
        <td>$${(pedido.total || 0).toLocaleString('es-CO')}</td>
        <td class="productos-lista" title="${productosTexto}">${productosTexto}</td>
        <td>
            ${crearBotonesAccionAdmin(pedido)}
        </td>
    `;

    return fila;
};

// Función para crear botones de acción para admin
const crearBotonesAccionAdmin = (pedido) => {
    return `
        <select class="select-estado" onchange="cambiarEstadoPedidoAdmin(${pedido.id}, this.value)">
            <option value="">Cambiar estado</option>
            <option value="pendiente" ${pedido.estado === 'pendiente' ? 'disabled' : ''}>Pendiente</option>
            <option value="aprobado" ${pedido.estado === 'aprobado' ? 'disabled' : ''}>Aprobado</option>
            <option value="preparado" ${pedido.estado === 'preparado' ? 'disabled' : ''}>Preparado</option>
            <option value="entregado" ${pedido.estado === 'entregado' ? 'disabled' : ''}>Entregado</option>
            <option value="cancelado" ${pedido.estado === 'cancelado' ? 'disabled' : ''}>Cancelado</option>
        </select>
        <button class="btn-accion btn-eliminar" onclick="eliminarPedido(${pedido.id})">
            Eliminar
        </button>
    `;
};

// Configurar filtros
const configurarFiltros = () => {
    const filtroEstado = document.getElementById('filtro-estado');
    const btnExportar = document.getElementById('btn-exportar');

    if (filtroEstado) {
        filtroEstado.addEventListener('change', (e) => {
            cargarPedidosAdmin(e.target.value);
        });
    }

    if (btnExportar) {
        btnExportar.addEventListener('click', exportarReporte);
    }
};

// Función global para cambiar estado de pedido desde admin
window.cambiarEstadoPedidoAdmin = async (pedidoId, nuevoEstado) => {
    if (!nuevoEstado) return;

    try {
        alertaLoading('Actualizando', `Cambiando estado a ${nuevoEstado}...`);

        const { token } = getData();
        const response = await fetch(`${API_URL}/pedidos/${pedidoId}/estado`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        const resultado = await response.json();
        cerrarAlerta();

        if (resultado.success) {
            await alertaExito('¡Éxito!', `Pedido actualizado a ${nuevoEstado}`);
            // Recargar la tabla
            const filtroActual = document.getElementById('filtro-estado').value;
            await cargarPedidosAdmin(filtroActual);
        } else {
            await alertaError('Error', resultado.error || 'Error al actualizar el pedido');
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al cambiar estado del pedido:', error);
        await alertaError('Error', 'Error al actualizar el estado del pedido');
    }
};

// Función global para eliminar pedido
window.eliminarPedido = async (pedidoId) => {
    try {
        alertaLoading('Eliminando', 'Eliminando pedido...');

        const { token } = getData();
        const response = await fetch(`${API_URL}/pedidos/${pedidoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const resultado = await response.json();
        cerrarAlerta();

        if (resultado.success) {
            await alertaExito('¡Éxito!', 'Pedido eliminado correctamente');
            // Recargar la tabla
            const filtroActual = document.getElementById('filtro-estado').value;
            await cargarPedidosAdmin(filtroActual);
        } else {
            await alertaError('Error', resultado.error || 'Error al eliminar el pedido');
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al eliminar pedido:', error);
        await alertaError('Error', 'Error al eliminar el pedido');
    }
};

// Función para exportar reporte
const exportarReporte = () => {
    // Por ahora solo mostrar mensaje, implementar según necesidades
    alertaExito('Función de Exportación', 'Funcionalidad de exportación en desarrollo');
};
