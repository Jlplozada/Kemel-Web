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

        console.log("=== RESPUESTA DEL SERVIDOR ===");
        console.log("Success:", resultado.success);
        console.log("Datos recibidos:", resultado.data);
        console.log("Cantidad de pedidos:", resultado.data ? resultado.data.length : 0);

        if (resultado.success && resultado.data.length > 0) {
            tbody.innerHTML = '';
            mensajeSinPedidos.style.display = 'none';

            // Procesar cada pedido y sus productos
            resultado.data.forEach((pedido, pedidoIndex) => {
                console.log(`=== PROCESANDO PEDIDO ${pedidoIndex + 1} ===`);
                console.log("Pedido:", pedido);
                console.log("Productos del pedido:", pedido.productos);
                
                // Determinar si el pedido es par o impar para el color de fondo
                const esPedidoPar = pedidoIndex % 2 === 0;
                const clasePedido = esPedidoPar ? 'pedido-par' : 'pedido-impar';
                
                if (pedido.productos && pedido.productos.length > 0) {
                    // Crear una fila por cada producto del pedido
                    pedido.productos.forEach((producto, index) => {
                        console.log(`Creando fila para producto ${index + 1}:`, producto);
                        const fila = crearFilaProducto(pedido, producto, index === 0, clasePedido);
                        tbody.appendChild(fila);
                    });
                } else {
                    // Si no hay productos, crear una fila vacía
                    console.log("Pedido sin productos, creando fila vacía");
                    const esPedidoPar = pedidoIndex % 2 === 0;
                    const clasePedido = esPedidoPar ? 'pedido-par' : 'pedido-impar';
                    const fila = crearFilaProducto(pedido, null, true, clasePedido);
                    tbody.appendChild(fila);
                }
            });
        } else {
            console.log("=== NO HAY PEDIDOS PENDIENTES ===");
            console.log("Success:", resultado.success);
            console.log("Data length:", resultado.data ? resultado.data.length : "data is null/undefined");
            tbody.innerHTML = '';
            mensajeSinPedidos.style.display = 'block';
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al cargar pedidos pendientes:', error);
        await alertaError('Error', 'Error al cargar los pedidos pendientes');
    }
};

// Función para crear una fila por producto
const crearFilaProducto = (pedido, producto, mostrarIdPedido, clasePedido = '') => {
    const fila = document.createElement('tr');
    
    // Agregar la clase para el color de fondo del pedido
    if (clasePedido) {
        fila.className = clasePedido;
    }

    if (producto) {
        fila.innerHTML = `
            <td>${mostrarIdPedido ? pedido.id : ''}</td>
            <td>${producto.cantidad}</td>
            <td>${producto.nombre}</td>
            <td>${mostrarIdPedido ? crearBotonAccion(pedido) : ''}</td>
        `;
    } else {
        // Si no hay producto
        fila.innerHTML = `
            <td>${pedido.id}</td>
            <td>-</td>
            <td>Sin productos</td>
            <td>${crearBotonAccion(pedido)}</td>
        `;
    }

    return fila;
};

// Función para crear botón de acción - solo cambiar a preparado
const crearBotonAccion = (pedido) => {
    // Solo mostrar botón si el estado es pendiente o aprobado
    if (pedido.estado === 'pendiente' || pedido.estado === 'aprobado') {
        return `
            <button class="btn-accion btn-preparar" onclick="marcarComoPreparado(${pedido.id})">
                Marcar Preparado
            </button>
        `;
    } else if (pedido.estado === 'preparado') {
        return `<span class="estado-preparado">✓ Preparado</span>`;
    } else if (pedido.estado === 'entregado') {
        return `<span class="estado-entregado">✓ Entregado</span>`;
    } else if (pedido.estado === 'cancelado') {
        return `<span class="estado-cancelado">✗ Cancelado</span>`;
    } else {
        return `<span class="estado-${pedido.estado}">${pedido.estado}</span>`;
    }
};

// Función global específica para marcar pedido como preparado
window.marcarComoPreparado = async (pedidoId) => {
    try {
        alertaLoading('Actualizando', 'Marcando pedido como preparado...');

        const { token } = getData();
        const response = await fetch(`${API_URL}/pedidos/${pedidoId}/estado`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: 'preparado' })
        });

        const resultado = await response.json();
        cerrarAlerta();

        if (resultado.success) {
            await alertaExito('¡Éxito!', 'Pedido marcado como preparado');
            // Recargar la tabla
            await cargarPedidosPendientes();
        } else {
            await alertaError('Error', resultado.error || 'Error al actualizar el pedido');
        }
    } catch (error) {
        cerrarAlerta();
        console.error('Error al marcar pedido como preparado:', error);
        await alertaError('Error', 'Error al actualizar el estado del pedido');
    }
};
