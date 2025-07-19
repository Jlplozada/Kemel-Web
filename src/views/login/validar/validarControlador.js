import { loginUsuario } from '../../../helpers/api.js';
import { setData } from '../../../helpers/auth.js';
import { cargarHeaderSegunRol, redirigirSegunRol } from '../../../helpers/gestionRoles.js';
import { alertaError, alertaExito, alertaLoading, cerrarAlerta, toast } from '../../../helpers/alertas.js';

// Controlador para la vista de validación/login
export function validarControlador() {
    console.log("validarControlador ejecutado");

    // Obtener el formulario de login
    const form = document.querySelector('.form-login');
    if (!form) return;

    // Configurar funcionalidad de mostrar/ocultar contraseña
    configurarMostrarPassword();

    // Agregar event listener al formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener los valores del formulario
        const usuario = document.getElementById('usuario').value.trim();
        const clave = document.getElementById('password').value.trim();
        
        // Validar que los campos no estén vacíos
        if (!usuario || !clave) {
            await alertaError('Campos Requeridos', 'Por favor, completa todos los campos');
            return;
        }

        // Mostrar estado de carga
        alertaLoading('Iniciando Sesión', 'Verificando credenciales...');

        try {
            // Intentar hacer login (el campo usuario debe ser el nombre de usuario)
            const resultado = await loginUsuario(usuario, clave);
            
            if (resultado.success) {
                // Login exitoso - guardamos los tokens y datos del usuario
                console.log("Login exitoso, guardando datos...");
                console.log("Datos del usuario:", resultado.data.usuario);
                
                // Guardar token y datos del usuario usando la función simplificada
                setData({
                    token: resultado.data.token, // Solo un token
                    usuario: resultado.data.usuario
                });
                
                // Cerrar loading y mostrar mensaje de éxito
                cerrarAlerta();
                const rolUsuario = resultado.data.usuario.rol || 'cliente';
                await toast(`¡Bienvenido ${resultado.data.usuario.nombre}! Entrando como ${rolUsuario}...`, 'success');
                
                // Cargar el header correcto según el rol
                await cargarHeaderSegunRol();
                
                // Pequeña pausa para que el usuario vea el mensaje
                setTimeout(() => {
                    // Redirigir según el rol del usuario
                    redirigirSegunRol();
                }, 1500);
                
            } else {
                // Error en el login - mostrar mensaje de error
                cerrarAlerta();
                await alertaError('Error de Autenticación', resultado.error || 'Error al iniciar sesión');
            }
        } catch (error) {
            console.error('Error inesperado en login:', error);
            cerrarAlerta();
            await alertaError('Error Inesperado', 'Error inesperado. Por favor, intenta de nuevo.');
        }
    });

    // Navegación SPA para el enlace de registro
    const linkRegistro = document.querySelector('.form-links a');
    if (linkRegistro) {
        linkRegistro.addEventListener('click', function(e) {
            e.preventDefault();
            // Navegar a la página de registro
            if (window.navigate) {
                window.navigate('register');
            } else {
                window.location.hash = '#/register';
            }
        });
    }
}

// Función simple para mostrar mensajes de error
function mostrarError(mensaje) {
    // Remover cualquier mensaje anterior
    const mensajeAnterior = document.querySelector('.mensaje-error, .mensaje-exito');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }

    // Crear elemento para mostrar el error
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-error';
    mensajeDiv.style.cssText = `
        background-color: #fee;
        color: #c33;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 15px;
        border: 1px solid #fcc;
        text-align: center;
    `;
    mensajeDiv.textContent = mensaje;

    // Agregar el mensaje al formulario
    const form = document.querySelector('.form-login');
    form.insertBefore(mensajeDiv, form.firstChild);
}

// Función simple para mostrar mensajes de éxito
function mostrarExito(mensaje) {
    // Remover cualquier mensaje anterior
    const mensajeAnterior = document.querySelector('.mensaje-error, .mensaje-exito');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }

    // Crear elemento para mostrar el éxito
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-exito';
    mensajeDiv.style.cssText = `
        background-color: #efe;
        color: #3c3;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 15px;
        border: 1px solid #cfc;
        text-align: center;
    `;
    mensajeDiv.textContent = mensaje;

    // Agregar el mensaje al formulario
    const form = document.querySelector('.form-login');
    form.insertBefore(mensajeDiv, form.firstChild);
}

// Función para configurar la funcionalidad de mostrar/ocultar contraseña
function configurarMostrarPassword() {
    const checkboxMostrar = document.getElementById('mostrar-password');
    const inputPassword = document.getElementById('password');
    
    if (checkboxMostrar && inputPassword) {
        checkboxMostrar.addEventListener('change', function() {
            if (this.checked) {
                inputPassword.type = 'text';
            } else {
                inputPassword.type = 'password';
            }
        });
    }
}
