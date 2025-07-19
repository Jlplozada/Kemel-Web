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

        console.log("=== RESPUESTA DEL SERVIDOR ADMIN ===");
        console.log("Success:", resultado.success);
        console.log("Datos recibidos:", resultado.data);
        console.log("Cantidad de pedidos:", resultado.data ? resultado.data.length : 0);

        if (resultado.success && resultado.data.length > 0) {
            tbody.innerHTML = '';
            mensajeSinPedidos.style.display = 'none';

            // Procesar cada pedido y sus productos como en pedidos pendientes
            resultado.data.forEach((pedido, pedidoIndex) => {
                console.log(`=== PROCESANDO PEDIDO ADMIN ${pedidoIndex + 1} ===`);
                console.log("Pedido:", pedido);
                console.log("Productos del pedido:", pedido.productos);
                
                // Determinar si el pedido es par o impar para el color de fondo
                const esPedidoPar = pedidoIndex % 2 === 0;
                const clasePedido = esPedidoPar ? 'pedido-par' : 'pedido-impar';
                
                if (pedido.productos && pedido.productos.length > 0) {
                    // Crear una fila por cada producto del pedido
                    pedido.productos.forEach((producto, index) => {
                        console.log(`Creando fila para producto ${index + 1}:`, producto);
                        const fila = crearFilaProductoAdmin(pedido, producto, index === 0, clasePedido);
                        tbody.appendChild(fila);
                    });
                } else {
                    // Si no hay productos, crear una fila vacía
                    console.log("Pedido sin productos, creando fila vacía");
                    const fila = crearFilaProductoAdmin(pedido, null, true, clasePedido);
                    tbody.appendChild(fila);
                }
            });
        } else {
            console.log("=== NO HAY PEDIDOS ADMIN ===");
            console.log("Success:", resultado.success);
            console.log("Data length:", resultado.data ? resultado.data.length : "data is null/undefined");
            tbody.innerHTML = '';
            mensajeSinPedidos.style.display = 'block';
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al cargar pedidos admin:', error);
        await alertaError('Error', 'Error al cargar los pedidos');
    }
};

// Función para crear una fila por producto en la tabla de admin
const crearFilaProductoAdmin = (pedido, producto, mostrarDatosPedido, clasePedido = '') => {
    const fila = document.createElement('tr');
    
    // Agregar la clase para el color de fondo del pedido
    if (clasePedido) {
        fila.className = clasePedido;
    }

    // Formatear fecha
    const fecha = new Date(pedido.fecha_pedido).toLocaleDateString('es-CO');
    
    // Formatear total
    const totalFormateado = (pedido.total || 0).toLocaleString('es-CO');

    if (producto) {
        fila.innerHTML = `
            <td>${mostrarDatosPedido ? pedido.id : ''}</td>
            <td>${mostrarDatosPedido ? (pedido.nombre_usuario || 'Cliente') : ''}</td>
            <td>${mostrarDatosPedido ? fecha : ''}</td>
            <td>${mostrarDatosPedido ? crearSelectEstado(pedido) : ''}</td>
            <td>${mostrarDatosPedido ? (pedido.direccion_entrega || 'Sin dirección') : ''}</td>
            <td>${mostrarDatosPedido ? `$${totalFormateado}` : ''}</td>
            <td>${producto.cantidad}x ${producto.nombre}</td>
            <td>${mostrarDatosPedido ? crearBotonesAccionAdmin(pedido) : ''}</td>
        `;
    } else {
        // Si no hay producto
        fila.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.nombre_usuario || 'Cliente'}</td>
            <td>${fecha}</td>
            <td>${crearSelectEstado(pedido)}</td>
            <td>${pedido.direccion_entrega || 'Sin dirección'}</td>
            <td>$${totalFormateado}</td>
            <td>Sin productos</td>
            <td>${crearBotonesAccionAdmin(pedido)}</td>
        `;
    }

    return fila;
};

// Función para crear select de estado
const crearSelectEstado = (pedido) => {
    const estados = ['pendiente', 'aprobado', 'preparado', 'entregado', 'cancelado'];
    
    let selectHTML = `<select class="select-estado-admin" onchange="cambiarEstadoPedidoAdmin(${pedido.id}, this.value)">`;
    
    estados.forEach(estado => {
        const selected = estado === pedido.estado ? 'selected' : '';
        const estadoCapitalizado = estado.charAt(0).toUpperCase() + estado.slice(1);
        selectHTML += `<option value="${estado}" ${selected}>${estadoCapitalizado}</option>`;
    });
    
    selectHTML += '</select>';
    return selectHTML;
};

// Función para crear botones de acción para admin
const crearBotonesAccionAdmin = (pedido) => {
    return `
        <button class="btn-accion btn-detalles" onclick="verDetallesPedido(${pedido.id})">
            Detalles
        </button>
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
            // Recargar la tabla manteniendo el filtro actual
            const filtroActual = document.getElementById('filtro-estado').value;
            await cargarPedidosAdmin(filtroActual);
        } else {
            await alertaError('Error', resultado.error || 'Error al actualizar el pedido');
            // Recargar para revertir el select al estado anterior
            const filtroActual = document.getElementById('filtro-estado').value;
            await cargarPedidosAdmin(filtroActual);
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al cambiar estado del pedido:', error);
        await alertaError('Error', 'Error al actualizar el estado del pedido');
        // Recargar para revertir el select al estado anterior
        const filtroActual = document.getElementById('filtro-estado').value;
        await cargarPedidosAdmin(filtroActual);
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

// Función global para ver detalles del pedido
window.verDetallesPedido = (pedidoId) => {
    // Navegar a la vista de detalles con el ID del pedido
    window.location.hash = `detalle-pedido?id=${pedidoId}`;
};

// Función para exportar reporte
const exportarReporte = () => {
    // Por ahora solo mostrar mensaje, implementar según necesidades
    alertaExito('Función de Exportación', 'Funcionalidad de exportación en desarrollo');
};
