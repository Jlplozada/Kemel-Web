import { API_URL } from '../../helpers/api.js';
import { getData } from '../../helpers/auth.js';
import { alertaExito, alertaError, alertaLoading, cerrarAlerta } from '../../helpers/alertas.js';

// Controlador principal para detalles del pedido
const detallePedidoControlador = async () => {
    console.log("=== INICIANDO DETALLE PEDIDO ===");
    
    try {
        // Obtener ID del pedido de la URL
        const pedidoId = obtenerIdPedido();
        if (!pedidoId) {
            await alertaError('Error', 'No se especificó un pedido válido');
            window.location.hash = 'admin-pedidos';
            return;
        }

        // Configurar eventos
        configurarEventos(pedidoId);
        
        // Cargar datos del pedido
        await cargarDetallesPedido(pedidoId);
        
    } catch (error) {
        console.error('Error al inicializar detalle pedido:', error);
        await alertaError('Error', 'Error al cargar los detalles del pedido');
    }
};

// Obtener ID del pedido de la URL
const obtenerIdPedido = () => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split('?')[1]);
    return urlParams.get('id');
};

// Configurar eventos de la vista
const configurarEventos = (pedidoId) => {
    // Botón volver
    const btnVolver = document.getElementById('btn-volver');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            window.location.hash = 'admin-pedidos';
        });
    }

    // Botón actualizar estado
    const btnActualizarEstado = document.getElementById('btn-actualizar-estado');
    if (btnActualizarEstado) {
        btnActualizarEstado.addEventListener('click', () => {
            actualizarEstadoPedido(pedidoId);
        });
    }

    // Botón eliminar pedido
    const btnEliminarPedido = document.getElementById('btn-eliminar-pedido');
    if (btnEliminarPedido) {
        btnEliminarPedido.addEventListener('click', () => {
            eliminarPedidoDetalle(pedidoId);
        });
    }
};

// Cargar detalles completos del pedido
const cargarDetallesPedido = async (pedidoId) => {
    try {
        alertaLoading('Cargando', 'Obteniendo detalles del pedido...');

        const { token } = getData();
        const response = await fetch(`${API_URL}/pedidos/${pedidoId}/detalle`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const resultado = await response.json();
        cerrarAlerta();

        console.log("=== RESPUESTA DETALLE PEDIDO ===");
        console.log("Success:", resultado.success);
        console.log("Datos:", resultado.data);

        if (resultado.success && resultado.data) {
            mostrarDetallesPedido(resultado.data);
        } else {
            throw new Error(resultado.error || 'No se pudieron cargar los detalles');
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al cargar detalles:', error);
        await alertaError('Error', error.message || 'Error al cargar los detalles del pedido');
    }
};

// Mostrar detalles del pedido en la interfaz
const mostrarDetallesPedido = (datos) => {
    const { pedido, cliente, productos } = datos;

    console.log("=== MOSTRANDO DETALLES ===");
    console.log("Pedido:", pedido);
    console.log("Cliente:", cliente);
    console.log("Productos:", productos);

    // Información del pedido
    document.getElementById('numero-pedido').textContent = pedido.id;
    document.getElementById('pedido-id').textContent = pedido.id;
    document.getElementById('pedido-fecha').textContent = new Date(pedido.fecha_pedido).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const estadoBadge = document.getElementById('pedido-estado');
    estadoBadge.textContent = pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1);
    estadoBadge.className = `estado-badge estado-${pedido.estado}`;
    
    document.getElementById('pedido-total').textContent = `$${(pedido.total || 0).toLocaleString('es-CO')}`;
    document.getElementById('pedido-direccion').textContent = pedido.direccion_entrega || 'Sin dirección especificada';
    document.getElementById('pedido-notas').textContent = pedido.notas || 'Sin notas adicionales';

    // Información del cliente
    document.getElementById('cliente-nombre').textContent = cliente.nombre || 'No especificado';
    document.getElementById('cliente-correo').textContent = cliente.correo || 'No especificado';
    document.getElementById('cliente-telefono').textContent = cliente.telefono || 'No especificado';
    document.getElementById('cliente-direccion').textContent = cliente.direccion || 'No especificada';

    // Productos del pedido
    mostrarProductosPedido(productos);

    // Configurar select de estado
    const selectEstado = document.getElementById('cambiar-estado');
    if (selectEstado) {
        selectEstado.value = pedido.estado;
    }
};

// Mostrar productos en la tabla
const mostrarProductosPedido = (productos) => {
    const tbody = document.getElementById('tbody-productos');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!productos || productos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="mensaje-vacio">No hay productos en este pedido</td>
            </tr>
        `;
        return;
    }

    productos.forEach(producto => {
        const fila = document.createElement('tr');
        const subtotal = (producto.precio_unitario || 0) * (producto.cantidad || 0);
        
        fila.innerHTML = `
            <td>
                <img src="${API_URL}/img/${producto.imagen || 'default.jpg'}" 
                     alt="${producto.nombre}" 
                     class="imagen-producto-detalle"
                     onerror="this.src='${API_URL}/img/default.jpg'">
            </td>
            <td><strong>${producto.nombre || 'Producto sin nombre'}</strong></td>
            <td>${producto.descripcion || 'Sin descripción'}</td>
            <td>$${(producto.precio_unitario || 0).toLocaleString('es-CO')}</td>
            <td>${producto.cantidad || 0}</td>
            <td><strong>$${subtotal.toLocaleString('es-CO')}</strong></td>
        `;
        
        tbody.appendChild(fila);
    });
};

// Actualizar estado del pedido
const actualizarEstadoPedido = async (pedidoId) => {
    const selectEstado = document.getElementById('cambiar-estado');
    const nuevoEstado = selectEstado.value;

    if (!nuevoEstado) {
        await alertaError('Error', 'Por favor selecciona un estado');
        return;
    }

    try {
        alertaLoading('Actualizando', 'Cambiando estado del pedido...');

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
            await alertaExito('¡Éxito!', 'Estado actualizado correctamente');
            // Recargar detalles para mostrar el cambio
            await cargarDetallesPedido(pedidoId);
        } else {
            await alertaError('Error', resultado.error || 'Error al actualizar el estado');
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al actualizar estado:', error);
        await alertaError('Error', 'Error al actualizar el estado del pedido');
    }
};

// Eliminar pedido desde detalles
const eliminarPedidoDetalle = async (pedidoId) => {
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará permanentemente el pedido',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

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
            window.location.hash = 'admin-pedidos';
        } else {
            await alertaError('Error', resultado.error || 'Error al eliminar el pedido');
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al eliminar pedido:', error);
        await alertaError('Error', 'Error al eliminar el pedido');
    }
};

// Exportar controlador
export { detallePedidoControlador as loadDetallePedido };
