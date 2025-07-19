import { API_URL } from '../../helpers/api.js';
import { getData } from '../../helpers/auth.js';

export const administrarProductosControlador = async () => {
    console.log("Ejecutando administrarProductosControlador...");

    try {
        // Cargar todos los productos
        await cargarProductosAdmin();
        
        // Configurar controles
        configurarControles();
    } catch (error) {
        console.error('Error al cargar vista de administrar productos:', error);
        alert('Error al cargar la gestión de productos');
    }
};

// Función para cargar todos los productos (sin filtros)
const cargarProductosAdmin = async () => {
    const tbody = document.getElementById('tbody-admin-productos');
    const mensajeSinProductos = document.getElementById('mensaje-sin-productos');
    
    if (!tbody) return;

    try {
        console.log('Cargando productos...');

        const { token } = getData();
        const url = `${API_URL}/productos/admin`; // Usar endpoint admin que trae todos los productos

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const resultado = await response.json();

        console.log("=== RESPUESTA DEL SERVIDOR PRODUCTOS ===");
        console.log("Success:", resultado.success);
        console.log("Datos recibidos:", resultado.data);
        console.log("Cantidad de productos:", resultado.data ? resultado.data.length : 0);

        if (resultado.success && resultado.data && resultado.data.length > 0) {
            tbody.innerHTML = '';
            mensajeSinProductos.style.display = 'none';

            resultado.data.forEach((producto, productoIndex) => {
                console.log(`=== PROCESANDO PRODUCTO ${productoIndex + 1} ===`);
                console.log("Producto:", producto);
                
                // Determinar si el producto es par o impar para el color de fondo
                const esProductoPar = productoIndex % 2 === 0;
                const claseProducto = esProductoPar ? 'pedido-par' : 'pedido-impar';
                
                const fila = crearFilaProductoAdmin(producto, claseProducto);
                tbody.appendChild(fila);
            });
        } else {
            console.log("=== NO HAY PRODUCTOS ===");
            console.log("Success:", resultado.success);
            console.log("Data length:", resultado.data ? resultado.data.length : "data is null/undefined");
            tbody.innerHTML = '';
            mensajeSinProductos.style.display = 'block';
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar los productos');
    }
};

// Función para crear una fila de producto en la tabla
const crearFilaProductoAdmin = (producto, claseProducto) => {
    console.log("Creando fila para producto:", producto);
    
    const fila = document.createElement('tr');
    fila.className = claseProducto;

    // Formatear precio
    const precioFormateado = parseFloat(producto.precio || 0).toLocaleString('es-CO');

    fila.innerHTML = `
        <td>${producto.id}</td>
        <td>
            ${producto.imagen ? 
                `<img src="${API_URL}${producto.imagen}" alt="${producto.nombre}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                 <span style="display: none; font-size: 12px; color: #666;">Sin imagen</span>` :
                `<span style="font-size: 12px; color: #666;">Sin imagen</span>`
            }
        </td>
        <td>${producto.nombre}</td>
        <td>${producto.descripcion || 'Sin descripción'}</td>
        <td>$${precioFormateado}</td>
        <td>${crearBadgeEstado(producto.estado)}</td>
        <td>
            <button class="btn-accion btn-editar" onclick="editarProducto(${producto.id})">
                Editar
            </button>
            <button class="eliminar-btn" onclick="eliminarProducto(${producto.id})">
                Eliminar
            </button>
        </td>
    `;

    return fila;
};

// Función para crear badge de estado (sin select)
const crearBadgeEstado = (estado) => {
    const estadosInfo = {
        'activo': { label: 'Activo', class: 'estado-activo' },
        'inactivo': { label: 'Inactivo', class: 'estado-inactivo' },
        'eliminado': { label: 'Eliminado', class: 'estado-eliminado' }
    };
    
    const info = estadosInfo[estado] || { label: estado, class: 'estado-default' };
    return `<span class="badge ${info.class}">${info.label}</span>`;
};

// Configurar controles
const configurarControles = () => {
    // Configurar botón crear producto
    const btnCrearProducto = document.getElementById('btn-crear-producto');
    if (btnCrearProducto) {
        btnCrearProducto.addEventListener('click', () => {
            window.location.hash = 'crearproducto';
        });
    }
    
    console.log('Controles configurados para administrar productos');
};

// Función global para editar producto
window.editarProducto = async (productoId) => {
    // Por ahora redirigir a la vista de crear producto con el ID
    window.location.hash = `crearproducto?id=${productoId}`;
};

// Función global para eliminar producto
window.eliminarProducto = async (productoId) => {
    try {
        // Confirmación simple
        const confirmacion = confirm('¿Estás seguro? El producto será marcado como eliminado y no aparecerá en el catálogo');

        // Verificar si el usuario confirmó la eliminación
        if (!confirmacion) {
            return;
        }

        console.log('Eliminando producto...');

        const { token } = getData();
        const response = await fetch(`${API_URL}/productos/${productoId}/estado`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: 'eliminado' })
        });

        const resultado = await response.json();

        if (resultado.success) {
            alert('Producto eliminado correctamente');
            // Recargar la tabla
            await cargarProductosAdmin();
        } else {
            alert(resultado.error || 'Error al eliminar el producto');
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
    }
};

// Mantener compatibilidad con el nombre anterior
export const loadAdministrarProductos = administrarProductosControlador;