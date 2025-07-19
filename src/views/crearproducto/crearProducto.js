import { API_URL } from '../../helpers/api.js';
import { getData } from '../../helpers/auth.js';
import { alertaExito, alertaError, alertaConfirmacion, alertaLoading, cerrarAlerta, toast } from '../../helpers/alertas.js';

class CrearProductoControlador {
    constructor() {
        this.editMode = false;
        this.productId = null;
        this.checkEditMode();
        this.initializeForm();
        this.setupEventListeners();
        
        if (this.editMode) {
            this.loadProductData();
        }
    }

    checkEditMode() {
        // Verificar si viene con ID en la URL para editar
        const hash = window.location.hash;
        const urlParams = new URLSearchParams(hash.split('?')[1]);
        const id = urlParams.get('id');
        
        if (id) {
            this.editMode = true;
            this.productId = id;
            this.updateUIForEdit();
        }
    }

    updateUIForEdit() {
        const titulo = document.getElementById('titulo-form');
        const subtitulo = document.getElementById('subtitulo-form');
        const btnCrear = document.getElementById('btn-crear');
        
        if (titulo) titulo.textContent = 'Editar Producto';
        if (subtitulo) subtitulo.textContent = 'Modifica la información del producto';
        if (btnCrear) btnCrear.textContent = 'Actualizar Producto';
    }

    async loadProductData() {
        try {
            alertaLoading('Cargando', 'Obteniendo datos del producto...');
            
            const { token } = getData();
            const response = await fetch(`${API_URL}/productos/${this.productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('No se pudo cargar el producto');
            }

            const resultado = await response.json();
            cerrarAlerta();

            if (resultado.success) {
                this.fillForm(resultado.data);
            } else {
                throw new Error(resultado.error || 'Error al cargar el producto');
            }
        } catch (error) {
            cerrarAlerta();
            console.error('Error al cargar producto:', error);
            await alertaError('Error', error.message || 'No se pudo cargar el producto');
            window.location.hash = 'administrar-productos';
        }
    }

    fillForm(producto) {
        document.getElementById('nombre').value = producto.nombre || '';
        document.getElementById('descripcion').value = producto.descripcion || '';
        document.getElementById('precio').value = producto.precio || '';
        
        // Si tiene imagen, mostrarla
        if (producto.imagen) {
            this.showImagePreview(`${API_URL}${producto.imagen}`);
        }
    }

    initializeForm() {
        this.form = document.getElementById('form-crear-producto');
        this.imagenInput = document.getElementById('imagen');
        this.previewContainer = document.getElementById('preview-container');
        this.imagePreview = document.getElementById('image-preview');
        this.removeImageBtn = document.getElementById('remove-image');
        this.btnCrear = document.getElementById('btn-crear');
        this.btnCancelar = document.getElementById('btn-cancelar');
    }

    setupEventListeners() {
        // Evento para el formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Evento para cancelar
        this.btnCancelar.addEventListener('click', () => this.handleCancel());
        
        // Eventos para la imagen
        this.imagenInput.addEventListener('change', (e) => this.handleImageChange(e));
        if (this.removeImageBtn) {
            this.removeImageBtn.addEventListener('click', () => this.removeImage());
        }
    }

    handleImageChange(event) {
        const file = event.target.files[0];
        
        if (!file) {
            this.removeImage();
            return;
        }

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            alertaError('Archivo no válido', 'Por favor selecciona una imagen válida');
            return;
        }

        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            alertaError('Archivo muy grande', 'La imagen no debe superar los 5MB');
            return;
        }

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.showImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(src) {
        if (this.imagePreview) {
            this.imagePreview.src = src;
        }
        if (this.previewContainer) {
            this.previewContainer.style.display = 'block';
        }
    }

    removeImage() {
        if (this.imagenInput) {
            this.imagenInput.value = '';
        }
        if (this.previewContainer) {
            this.previewContainer.style.display = 'none';
        }
        if (this.imagePreview) {
            this.imagePreview.src = '';
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.form.checkValidity()) {
            this.form.reportValidity();
            return;
        }

        const action = this.editMode ? 'Actualizando' : 'Creando';
        alertaLoading(`${action} Producto`, `Por favor espera mientras se ${action.toLowerCase()} el producto...`);

        try {
            const formData = new FormData(this.form);
            
            const productData = {
                nombre: formData.get('nombre').trim(),
                descripcion: formData.get('descripcion').trim(),
                precio: parseFloat(formData.get('precio'))
            };

            // Manejar imagen si se seleccionó una nueva
            const imagenFile = formData.get('imagen');
            if (imagenFile && imagenFile.size > 0) {
                productData.imagen = await this.uploadImage(imagenFile);
            }

            let result;
            if (this.editMode) {
                result = await this.updateProduct(productData);
            } else {
                result = await this.createProduct(productData);
            }
            
            cerrarAlerta();
            const successMessage = this.editMode ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente';
            await alertaExito('¡Éxito!', successMessage);
            
            // Redirigir a administrar productos
            window.location.hash = 'administrar-productos';

        } catch (error) {
            console.error('Error:', error);
            cerrarAlerta();
            const errorMessage = this.editMode ? 'No se pudo actualizar el producto' : 'No se pudo crear el producto';
            await alertaError('Error', error.message || errorMessage);
        }
    }

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('imagen', file);

        try {
            const { token } = getData();
            const response = await fetch(`${API_URL}/productos/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al subir la imagen');
            }

            const result = await response.json();
            return result.ruta || result.filename;
        } catch (error) {
            console.error('Error al subir imagen:', error);
            throw new Error('No se pudo subir la imagen');
        }
    }

    async createProduct(productData) {
        try {
            const { token } = getData();
            const response = await fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                throw new Error('Error al crear el producto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al crear producto:', error);
            throw new Error('No se pudo crear el producto');
        }
    }

    async updateProduct(productData) {
        try {
            const { token } = getData();
            const response = await fetch(`${API_URL}/productos/${this.productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el producto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            throw new Error('No se pudo actualizar el producto');
        }
    }

    async handleCancel() {
        const action = this.editMode ? 'edición' : 'creación';
        const resultado = await alertaConfirmacion(
            `¿Cancelar ${action}?`,
            `¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.`,
            'Sí, cancelar',
            'Continuar editando'
        );
        
        if (resultado.isConfirmed) {
            window.location.hash = 'administrar-productos';
        }
    }
}

// Función para cargar el controlador
export function loadCrearProducto() {
    new CrearProductoControlador();
}
