import { API_URL } from '../../helpers/api.js';
import { getData } from '../../helpers/auth.js';
import { alertaError, alertaExito, alertaLoading, cerrarAlerta } from '../../helpers/alertas.js';

export const pedidosPendientesControlador = async () => {
    console.log("Ejecutando pedidosPendientesControlador...");

    try {
        // Cargar pedidos pendientes
        await cargarPedidosPendientes();
    } catch (error) {
        console.error('Error al cargar vista de pedidos pendientes:', error);
        await alertaError('Error', 'Error al cargar los pedidos pendientes');
    }
};

// Función para cargar pedidos con estado pendiente
const cargarPedidosPendientes = async () => {
    const tbody = document.getElementById('tbody-pedidos-pendientes');
    const mensajeSinPedidos = document.getElementById('mensaje-sin-pedidos');
    
    if (!tbody) return;

    try {
        alertaLoading('Cargando', 'Obteniendo pedidos pendientes...');

        const { token } = getData();
        const response = await fetch(`${API_URL}/pedidos/pendientes`, {
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
                const fila = crearFilaPedido(pedido);
                tbody.appendChild(fila);
            });
        } else {
            tbody.innerHTML = '';
            mensajeSinPedidos.style.display = 'block';
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al cargar pedidos pendientes:', error);
        await alertaError('Error', 'Error al cargar los pedidos pendientes');
    }
};

// Función para crear una fila de pedido en la tabla
const crearFilaPedido = (pedido) => {
    const fila = document.createElement('tr');

    // Formatear fecha
    const fecha = new Date(pedido.fecha_pedido).toLocaleDateString('es-CO');
    
    // Formatear productos (si los hay)
    const productosTexto = pedido.productos ? 
        pedido.productos.map(p => `${p.nombre} (x${p.cantidad})`).join(', ') : 
        'Sin detalles';

    fila.innerHTML = `
        <td>${pedido.id}</td>
        <td>${pedido.nombre_usuario || 'Cliente'}</td>
        <td>${fecha}</td>
        <td>${pedido.direccion_entrega || 'Sin dirección'}</td>
        <td>$${(pedido.total || 0).toLocaleString('es-CO')}</td>
        <td class="productos-lista" title="${productosTexto}">${productosTexto}</td>
        <td>
            ${crearBotonesAccion(pedido)}
        </td>
    `;

    return fila;
};

// Función para crear botones de acción según el estado del pedido
const crearBotonesAccion = (pedido) => {
    switch (pedido.estado) {
        case 'pendiente':
            return `
                <button class="btn-accion btn-aprobar" onclick="cambiarEstadoPedido(${pedido.id}, 'aprobado')">
                    Aprobar
                </button>
            `;
        case 'aprobado':
            return `
                <button class="btn-accion btn-preparar" onclick="cambiarEstadoPedido(${pedido.id}, 'preparado')">
                    Marcar Preparado
                </button>
            `;
        case 'preparado':
            return `
                <button class="btn-accion btn-entregar" onclick="cambiarEstadoPedido(${pedido.id}, 'entregado')">
                    Marcar Entregado
                </button>
            `;
        default:
            return `<span class="estado-${pedido.estado}">${pedido.estado}</span>`;
    }
};

// Función global para cambiar estado de pedido
window.cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
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
            await alertaExito('¡Éxito!', `Pedido marcado como ${nuevoEstado}`);
            // Recargar la tabla
            await cargarPedidosPendientes();
        } else {
            await alertaError('Error', resultado.error || 'Error al actualizar el pedido');
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al cambiar estado del pedido:', error);
        await alertaError('Error', 'Error al actualizar el estado del pedido');
    }
};
