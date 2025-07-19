import { API_URL } from '../../helpers/api.js';
import { alertaExito, alertaError, alertaConfirmacion, alertaLoading, cerrarAlerta, toast } from '../../helpers/alertas.js';

class CrearProductoControlador {
    constructor() {
        this.initializeForm();
        this.setupEventListeners();
    }

    initializeForm() {
        this.form = document.getElementById('form-crear-producto');
        this.imagenInput = document.getElementById('imagen');
        this.previewContainer = document.getElementById('preview-container');
        this.imagePreview = document.getElementById('image-preview');
        this.removeImageBtn = document.getElementById('remove-image');
        this.mensajeResultado = document.getElementById('mensaje-resultado');
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
        this.removeImageBtn.addEventListener('click', () => this.removeImage());
        
        // Validación en tiempo real del precio
        document.getElementById('precio').addEventListener('input', (e) => {
            this.validatePrice(e.target);
        });
        
        // Validación en tiempo real del nombre
        document.getElementById('nombre').addEventListener('input', (e) => {
            this.validateName(e.target);
        });
    }

    handleImageChange(event) {
        const file = event.target.files[0];
        
        if (!file) {
            this.removeImage();
            return;
        }

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            this.showMessage('Por favor, selecciona un archivo de imagen válido.', 'error');
            this.imagenInput.value = '';
            return;
        }

        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            this.showMessage('La imagen debe ser menor a 5MB.', 'error');
            this.imagenInput.value = '';
            return;
        }

        // Mostrar vista previa
        const reader = new FileReader();
        reader.onload = (e) => {
            this.imagePreview.src = e.target.result;
            this.previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.imagenInput.value = '';
        this.previewContainer.style.display = 'none';
        this.imagePreview.src = '';
    }

    validatePrice(input) {
        const value = parseFloat(input.value);
        
        if (isNaN(value) || value < 0) {
            input.setCustomValidity('El precio debe ser un número positivo');
        } else {
            input.setCustomValidity('');
        }
    }

    validateName(input) {
        const value = input.value.trim();
        
        if (value.length < 2) {
            input.setCustomValidity('El nombre debe tener al menos 2 caracteres');
        } else if (value.length > 100) {
            input.setCustomValidity('El nombre no puede exceder 100 caracteres');
        } else {
            input.setCustomValidity('');
        }
    }

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('imagen', file);

        try {
            const response = await fetch(`${API_URL}/productos/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al subir la imagen');
            }

            const result = await response.json();
            return result.ruta;
        } catch (error) {
            console.error('Error al subir imagen:', error);
            throw new Error('No se pudo subir la imagen');
        }
    }

    async createProduct(productData) {
        try {
            const response = await fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: {
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

    async handleSubmit(event) {
        event.preventDefault();
        
        // Validar formulario
        if (!this.form.checkValidity()) {
            this.form.reportValidity();
            return;
        }

        // Mostrar loading
        alertaLoading('Creando Producto', 'Por favor espera mientras se crea el producto...');

        try {
            const formData = new FormData(this.form);
            
            // Preparar datos del producto
            const productData = {
                nombre: formData.get('nombre').trim(),
                descripcion: formData.get('descripcion').trim(),
                precio: parseFloat(formData.get('precio')),
                estado: formData.get('estado'),
                imagen: null
            };

            // Subir imagen si existe
            const imagenFile = formData.get('imagen');
            if (imagenFile && imagenFile.size > 0) {
                productData.imagen = await this.uploadImage(imagenFile);
            }

            // Crear producto
            const result = await this.createProduct(productData);
            
            // Cerrar loading y mostrar éxito
            cerrarAlerta();
            await alertaExito('¡Producto Creado!', 'El producto se ha creado exitosamente');
            
            this.resetForm();
            window.location.hash = '#/productos';

        } catch (error) {
            console.error('Error:', error);
            // Cerrar loading y mostrar error
            cerrarAlerta();
            await alertaError('Error al Crear Producto', error.message || 'No se pudo crear el producto');
        }
    }

    async handleCancel() {
        if (this.hasChanges()) {
            const resultado = await alertaConfirmacion(
                '¿Cancelar creación?',
                '¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.',
                'Sí, cancelar',
                'Continuar editando'
            );
            
            if (resultado.isConfirmed) {
                window.location.hash = '#/productos';
            }
        } else {
            window.location.hash = '#/productos';
        }
    }

    hasChanges() {
        const formData = new FormData(this.form);
        const nombre = formData.get('nombre').trim();
        const descripcion = formData.get('descripcion').trim();
        const precio = formData.get('precio');
        const imagen = formData.get('imagen');

        return nombre || descripcion || precio || (imagen && imagen.size > 0);
    }

    setLoading(loading) {
        const spinner = this.btnCrear.querySelector('.loading-spinner');
        const text = this.btnCrear.querySelector('span:not(.loading-spinner)') || this.btnCrear;
        
        if (loading) {
            spinner.style.display = 'inline-block';
            text.textContent = 'Creando...';
            this.btnCrear.disabled = true;
        } else {
            spinner.style.display = 'none';
            text.textContent = 'Crear Producto';
            this.btnCrear.disabled = false;
        }
    }

    showMessage(message, type) {
        this.mensajeResultado.textContent = message;
        this.mensajeResultado.className = `mensaje ${type}`;
        this.mensajeResultado.style.display = 'block';
        
        // Scroll hacia el mensaje
        this.mensajeResultado.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }

    hideMessage() {
        this.mensajeResultado.style.display = 'none';
    }

    resetForm() {
        this.form.reset();
        this.removeImage();
        this.hideMessage();
    }
}

// Función para cargar el controlador
export function loadCrearProducto() {
    new CrearProductoControlador();
}

// Auto-inicializar si se carga directamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('form-crear-producto')) {
            loadCrearProducto();
        }
    });
} else {
    if (document.getElementById('form-crear-producto')) {
        loadCrearProducto();
    }
}
