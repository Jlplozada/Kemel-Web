import { API_URL } from '../../helpers/api.js';
import { getData } from '../../helpers/auth.js';
import { navigate } from '../../router/router.js';

class AdministrarProductosControlador {
    constructor() {
        this.productos = [];
        this.filtroActual = 'activo';
        this.busquedaActual = '';
        this.productoAEliminar = null;
        this.productoARestaurar = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.cargarProductos();
    }

    initializeElements() {
        this.productosGrid = document.getElementById('productos-grid');
        this.loadingSpinner = document.getElementById('loading-productos');
        this.noProductos = document.getElementById('no-productos');
        this.buscarInput = document.getElementById('buscar-producto');
        this.btnBuscar = document.getElementById('btn-buscar');
        this.filtroEstado = document.getElementById('filtro-estado');
        this.btnCrearNuevo = document.getElementById('btn-crear-nuevo');
        this.mensajeResultado = document.getElementById('mensaje-resultado');
        
        // Modales
        this.modalEliminar = document.getElementById('modal-eliminar');
        this.modalRestaurar = document.getElementById('modal-restaurar');
        this.btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
        this.btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
        this.btnConfirmarRestaurar = document.getElementById('btn-confirmar-restaurar');
        this.btnCancelarRestaurar = document.getElementById('btn-cancelar-restaurar');
        this.productoNombreEliminar = document.getElementById('producto-nombre-eliminar');
        this.productoNombreRestaurar = document.getElementById('producto-nombre-restaurar');
    }

    setupEventListeners() {
        // Búsqueda
        this.btnBuscar.addEventListener('click', () => this.filtrarProductos());
        this.buscarInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.filtrarProductos();
            }
        });
        this.buscarInput.addEventListener('input', () => {
            if (this.buscarInput.value === '') {
                this.filtrarProductos();
            }
        });

        // Filtros
        this.filtroEstado.addEventListener('change', () => {
            this.filtroActual = this.filtroEstado.value;
            this.filtrarProductos();
        });

        // Crear nuevo producto
        this.btnCrearNuevo.addEventListener('click', () => {
            navigate('/crear-producto');
        });

        // Modales
        this.btnCancelarEliminar.addEventListener('click', () => this.cerrarModalEliminar());
        this.btnCancelarRestaurar.addEventListener('click', () => this.cerrarModalRestaurar());
        this.btnConfirmarEliminar.addEventListener('click', () => this.eliminarProducto());
        this.btnConfirmarRestaurar.addEventListener('click', () => this.restaurarProducto());

        // Cerrar modal al hacer click fuera
        this.modalEliminar.addEventListener('click', (e) => {
            if (e.target === this.modalEliminar) {
                this.cerrarModalEliminar();
            }
        });
        this.modalRestaurar.addEventListener('click', (e) => {
            if (e.target === this.modalRestaurar) {
                this.cerrarModalRestaurar();
            }
        });
    }

    async cargarProductos() {
        try {
            this.showLoading(true);
            const { accessToken } = getData();
            
            const response = await fetch(`${API_URL}/productos/admin/todos`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar productos');
            }

            this.productos = await response.json();
            this.filtrarProductos();
            
        } catch (error) {
            console.error('Error cargando productos:', error);
            this.mostrarMensaje('Error al cargar los productos', 'error');
            this.productos = [];
            this.renderizarProductos([]);
        } finally {
            this.showLoading(false);
        }
    }

    filtrarProductos() {
        this.busquedaActual = this.buscarInput.value.toLowerCase().trim();
        
        let productosFiltrados = this.productos.filter(producto => {
            // Filtro por estado
            let cumpleEstado = true;
            if (this.filtroActual === 'activo') {
                cumpleEstado = producto.estado === 'activo';
            } else if (this.filtroActual === 'eliminado') {
                cumpleEstado = producto.estado === 'eliminado';
            }
            // Si filtroActual === 'todos', no filtra por estado

            // Filtro por búsqueda
            let cumpleBusqueda = true;
            if (this.busquedaActual) {
                cumpleBusqueda = 
                    producto.nombre.toLowerCase().includes(this.busquedaActual) ||
                    producto.descripcion.toLowerCase().includes(this.busquedaActual);
            }

            return cumpleEstado && cumpleBusqueda;
        });

        this.renderizarProductos(productosFiltrados);
    }

    renderizarProductos(productos) {
        if (productos.length === 0) {
            this.productosGrid.style.display = 'none';
            this.noProductos.style.display = 'block';
            return;
        }

        this.productosGrid.style.display = 'grid';
        this.noProductos.style.display = 'none';
        
        this.productosGrid.innerHTML = productos.map(producto => 
            this.crearProductoCard(producto)
        ).join('');

        // Agregar event listeners a los botones
        this.agregarEventListenersProductos();
    }

    crearProductoCard(producto) {
        const esEliminado = producto.estado === 'eliminado';
        const imagenUrl = producto.imagen ? `${API_URL}${producto.imagen}` : null;
        
        return `
            <div class="producto-card ${esEliminado ? 'eliminado' : ''}" data-id="${producto.id}">
                <div class="producto-imagen">
                    ${imagenUrl ? 
                        `<img src="${imagenUrl}" alt="${producto.nombre}" onerror="this.style.display='none'; this.parentElement.innerHTML='Sin imagen';">` : 
                        'Sin imagen'
                    }
                </div>
                <div class="producto-info">
                    <div class="producto-nombre">${producto.nombre}</div>
                    <div class="producto-descripcion">${producto.descripcion || 'Sin descripción'}</div>
                    <div class="producto-precio">$${parseFloat(producto.precio).toLocaleString()}</div>
                    <div class="producto-estado ${producto.estado}">
                        ${producto.estado === 'activo' ? 'Activo' : 'Eliminado'}
                    </div>
                </div>
                <div class="producto-actions">
                    ${!esEliminado ? `
                        <button class="btn-editar" data-id="${producto.id}">
                            ✏️ Editar
                        </button>
                        <button class="btn-eliminar" data-id="${producto.id}" data-nombre="${producto.nombre}">
                            🗑️ Eliminar
                        </button>
                    ` : `
                        <button class="btn-restaurar" data-id="${producto.id}" data-nombre="${producto.nombre}">
                            ↩️ Restaurar
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    agregarEventListenersProductos() {
        // Botones de editar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                navigate(`/editar-producto/${id}`);
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const nombre = e.target.getAttribute('data-nombre');
                this.abrirModalEliminar(id, nombre);
            });
        });

        // Botones de restaurar
        document.querySelectorAll('.btn-restaurar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const nombre = e.target.getAttribute('data-nombre');
                this.abrirModalRestaurar(id, nombre);
            });
        });
    }

    abrirModalEliminar(id, nombre) {
        this.productoAEliminar = id;
        this.productoNombreEliminar.textContent = nombre;
        this.modalEliminar.style.display = 'flex';
    }

    cerrarModalEliminar() {
        this.productoAEliminar = null;
        this.modalEliminar.style.display = 'none';
    }

    abrirModalRestaurar(id, nombre) {
        this.productoARestaurar = id;
        this.productoNombreRestaurar.textContent = nombre;
        this.modalRestaurar.style.display = 'flex';
    }

    cerrarModalRestaurar() {
        this.productoARestaurar = null;
        this.modalRestaurar.style.display = 'none';
    }

    async eliminarProducto() {
        if (!this.productoAEliminar) return;

        try {
            const { accessToken } = getData();
            
            const response = await fetch(`${API_URL}/productos/${this.productoAEliminar}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar producto');
            }

            this.mostrarMensaje('Producto eliminado correctamente', 'exito');
            this.cerrarModalEliminar();
            this.cargarProductos(); // Recargar la lista
            
        } catch (error) {
            console.error('Error eliminando producto:', error);
            this.mostrarMensaje('Error al eliminar el producto', 'error');
        }
    }

    async restaurarProducto() {
        if (!this.productoARestaurar) return;

        try {
            const { accessToken } = getData();
            
            const response = await fetch(`${API_URL}/productos/${this.productoARestaurar}/restaurar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al restaurar producto');
            }

            this.mostrarMensaje('Producto restaurado correctamente', 'exito');
            this.cerrarModalRestaurar();
            this.cargarProductos(); // Recargar la lista
            
        } catch (error) {
            console.error('Error restaurando producto:', error);
            this.mostrarMensaje('Error al restaurar el producto', 'error');
        }
    }

    showLoading(show) {
        this.loadingSpinner.style.display = show ? 'block' : 'none';
        this.productosGrid.style.display = show ? 'none' : 'grid';
    }

    mostrarMensaje(mensaje, tipo) {
        this.mensajeResultado.textContent = mensaje;
        this.mensajeResultado.className = `mensaje-resultado ${tipo}`;
        this.mensajeResultado.style.display = 'block';
        
        setTimeout(() => {
            this.mensajeResultado.style.display = 'none';
        }, 5000);
    }
}

// Ejecutar cuando se cargue la vista
document.addEventListener('DOMContentLoaded', () => {
    console.log('Administrar productos controlador ejecutado');
    new AdministrarProductosControlador();
});

// Función de carga para el router
export const loadAdministrarProductos = () => {
    console.log('Cargando administrar productos...');
    // El controlador se ejecuta automáticamente cuando se carga el DOM
    return new AdministrarProductosControlador();
};

export default AdministrarProductosControlador;
