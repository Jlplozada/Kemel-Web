import { 
    alertaExito, 
    alertaError, 
    alertaAdvertencia, 
    alertaInfo, 
    alertaConfirmacion, 
    alertaInput, 
    toast, 
    alertaLoading, 
    cerrarAlerta, 
    alertaPanaderia 
} from '../helpers/alertas.js';

/**
 * Archivo de demostración de todas las funcionalidades de SweetAlert2
 * implementadas en el proyecto KemelOnline
 */

// Ejemplo de uso en una función de demo
export function mostrarEjemplosAlertas() {
    const contenedor = document.createElement('div');
    contenedor.innerHTML = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2>Ejemplos de Alertas con SweetAlert2</h2>
            <div style="display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                <button id="btn-exito" class="btn-demo">Alerta de Éxito</button>
                <button id="btn-error" class="btn-demo">Alerta de Error</button>
                <button id="btn-advertencia" class="btn-demo">Alerta de Advertencia</button>
                <button id="btn-info" class="btn-demo">Alerta de Información</button>
                <button id="btn-confirmacion" class="btn-demo">Confirmación</button>
                <button id="btn-input" class="btn-demo">Input</button>
                <button id="btn-toast" class="btn-demo">Toast</button>
                <button id="btn-loading" class="btn-demo">Loading</button>
                <button id="btn-panaderia" class="btn-demo">Tema Panadería</button>
            </div>
        </div>
        <style>
            .btn-demo {
                padding: 10px 15px;
                border: none;
                border-radius: 5px;
                background: #007bff;
                color: white;
                cursor: pointer;
                transition: background 0.3s;
            }
            .btn-demo:hover {
                background: #0056b3;
            }
        </style>
    `;

    // Eventos de los botones de ejemplo
    setTimeout(() => {
        document.getElementById('btn-exito')?.addEventListener('click', async () => {
            await alertaExito('¡Operación Exitosa!', 'El producto se ha guardado correctamente');
        });

        document.getElementById('btn-error')?.addEventListener('click', async () => {
            await alertaError('Error en el Sistema', 'No se pudo conectar con el servidor');
        });

        document.getElementById('btn-advertencia')?.addEventListener('click', async () => {
            await alertaAdvertencia('Atención', 'Algunos campos están vacíos');
        });

        document.getElementById('btn-info')?.addEventListener('click', async () => {
            await alertaInfo('Información', 'Esta función estará disponible próximamente');
        });

        document.getElementById('btn-confirmacion')?.addEventListener('click', async () => {
            const resultado = await alertaConfirmacion(
                '¿Eliminar Producto?',
                '¿Estás seguro de que quieres eliminar este producto?',
                'Sí, eliminar',
                'Cancelar'
            );
            
            if (resultado.isConfirmed) {
                await toast('Producto eliminado', 'success');
            } else {
                await toast('Operación cancelada', 'info');
            }
        });

        document.getElementById('btn-input')?.addEventListener('click', async () => {
            const resultado = await alertaInput(
                'Nuevo Nombre',
                'Ingresa el nuevo nombre del producto:',
                'Ej: Pan Francés'
            );
            
            if (resultado.isConfirmed && resultado.value) {
                await toast(`Nuevo nombre: ${resultado.value}`, 'success');
            }
        });

        document.getElementById('btn-toast')?.addEventListener('click', async () => {
            await toast('¡Notificación toast!', 'success');
        });

        document.getElementById('btn-loading')?.addEventListener('click', async () => {
            alertaLoading('Procesando', 'Por favor espera...');
            
            // Simular proceso
            setTimeout(() => {
                cerrarAlerta();
                toast('Proceso completado', 'success');
            }, 3000);
        });

        document.getElementById('btn-panaderia')?.addEventListener('click', async () => {
            await alertaPanaderia('¡Bienvenido a KemelOnline!', 'Tu panadería favorita en línea');
        });
    }, 100);

    return contenedor;
}

// Ejemplos de uso común en el proyecto:

// 1. Para validación de formularios
export async function validarFormularioEjemplo(datos) {
    if (!datos.nombre) {
        await alertaError('Campo Requerido', 'El nombre es obligatorio');
        return false;
    }
    
    if (!datos.email || !datos.email.includes('@')) {
        await alertaError('Email Inválido', 'Por favor ingresa un email válido');
        return false;
    }
    
    return true;
}

// 2. Para confirmación de acciones críticas
export async function confirmarEliminarProducto(nombreProducto) {
    const resultado = await alertaConfirmacion(
        '¿Eliminar Producto?',
        `¿Estás seguro de que quieres eliminar "${nombreProducto}"?`,
        'Sí, eliminar',
        'Cancelar'
    );
    
    return resultado.isConfirmed;
}

// 3. Para procesos con loading
export async function procesarPedido(datosProducto) {
    try {
        alertaLoading('Procesando Pedido', 'Guardando información...');
        
        // Simular llamada a API
        const resultado = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosProducto)
        });
        
        cerrarAlerta();
        
        if (resultado.ok) {
            await alertaExito('¡Pedido Confirmado!', 'Tu pedido se ha procesado correctamente');
        } else {
            await alertaError('Error en el Pedido', 'No se pudo procesar el pedido');
        }
        
    } catch (error) {
        cerrarAlerta();
        await alertaError('Error de Conexión', 'Verifica tu conexión a internet');
    }
}

// 4. Para notificaciones rápidas
export function notificarCambios(accion, elemento) {
    switch (accion) {
        case 'crear':
            toast(`${elemento} creado exitosamente`, 'success');
            break;
        case 'actualizar':
            toast(`${elemento} actualizado`, 'info');
            break;
        case 'eliminar':
            toast(`${elemento} eliminado`, 'warning');
            break;
        default:
            toast('Acción completada', 'success');
    }
}

// 5. Para manejo de errores de autenticación
export async function manejarErrorAuth(errorCode) {
    switch (errorCode) {
        case 401:
            await alertaError('Sesión Expirada', 'Por favor inicia sesión nuevamente');
            // Redirigir al login
            window.location.hash = '#/login';
            break;
        case 403:
            await alertaError('Acceso Denegado', 'No tienes permisos para realizar esta acción');
            break;
        case 404:
            await alertaError('No Encontrado', 'El recurso solicitado no existe');
            break;
        case 500:
            await alertaError('Error del Servidor', 'Ocurrió un error interno. Intenta más tarde');
            break;
        default:
            await alertaError('Error', 'Ocurrió un error inesperado');
    }
}
