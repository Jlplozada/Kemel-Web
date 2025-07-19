import { getUsuario, setData, clearAuth } from '../../helpers/auth.js';
import { API_URL, authenticatedRequest } from '../../helpers/api.js';
import { alertaError, alertaLoading, cerrarAlerta } from '../../helpers/alertas.js';

export const cuentaControlador = async function() {
    console.log("=== CUENTA CONTROLADOR ===");
    
    // Cargar estilos
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/views/cuenta/cuenta.css';
    document.head.appendChild(link);
    
    // Obtener datos del usuario actual
    const usuario = getUsuario();
    if (!usuario) {
        alertaError("Error", "No se pudo cargar la información del usuario");
        return;
    }
    
    console.log("Usuario actual:", usuario);
    
    // Cargar ciudades en el select
    await cargarCiudades();
    
    // Prellenar el formulario con los datos actuales
    document.getElementById('nombre').value = usuario.nombre || '';
    document.getElementById('email').value = usuario.email || '';
    document.getElementById('telefono').value = usuario.telefono || '';
    document.getElementById('direccion').value = usuario.direccion || '';
    
    // Seleccionar la ciudad actual
    if (usuario.ciudad_id) {
        document.getElementById('ciudad').value = usuario.ciudad_id;
    }
    
    // Event listeners
    document.getElementById('cuenta-form').addEventListener('submit', manejarActualizacion);
    document.getElementById('btn-volver').addEventListener('click', () => {
        window.navigate('inicio');
    });
    document.getElementById('btn-cerrar-sesion').addEventListener('click', manejarCerrarSesion);
};

// Función para cargar las ciudades
async function cargarCiudades() {
    try {
        const response = await fetch(`${API_URL}/ciudades`);
        const ciudades = await response.json();
        
        const selectCiudad = document.getElementById('ciudad');
        selectCiudad.innerHTML = '<option value="">Selecciona una ciudad</option>';
        
        ciudades.forEach(ciudad => {
            const option = document.createElement('option');
            option.value = ciudad.id;
            option.textContent = ciudad.nombre;
            selectCiudad.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error al cargar ciudades:', error);
        alertaError("Error", "No se pudieron cargar las ciudades");
    }
}

// Función para manejar la actualización de datos
async function manejarActualizacion(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const datos = {
        nombre: formData.get('nombre').trim(),
        email: formData.get('email').trim(),
        telefono: formData.get('telefono').trim(),
        direccion: formData.get('direccion').trim(),
        ciudad_id: parseInt(formData.get('ciudad')),
        password: formData.get('password').trim()
    };
    
    // Validaciones
    if (!datos.nombre || !datos.email || !datos.telefono || !datos.direccion || !datos.ciudad_id) {
        alertaError("Datos incompletos", "Por favor completa todos los campos obligatorios");
        return;
    }
    
    // Validar contraseñas si se está cambiando
    if (datos.password) {
        const confirmarPassword = formData.get('confirmar-password').trim();
        if (datos.password !== confirmarPassword) {
            alertaError("Contraseñas no coinciden", "La nueva contraseña y su confirmación deben ser iguales");
            return;
        }
        
        if (datos.password.length < 6) {
            alertaError("Contraseña muy corta", "La contraseña debe tener al menos 6 caracteres");
            return;
        }
    } else {
        // Si no se cambia la contraseña, remover del objeto
        delete datos.password;
    }
    
    console.log("Datos a actualizar:", datos);
    
    try {
        alertaLoading("Actualizando", "Guardando tus cambios...");
        
        const usuario = getUsuario();
        
        // Hacer la petición de actualización
        const result = await authenticatedRequest(`${API_URL}/usuarios/${usuario.id}`, {
            method: 'PUT',
            body: JSON.stringify(datos)
        });
        
        cerrarAlerta();
        
        if (result.success) {
            // Actualizar los datos del usuario en localStorage
            const usuarioActualizado = { ...usuario, ...datos };
            // Remover password del objeto para no guardarlo en localStorage
            delete usuarioActualizado.password;
            
            // Guardar usuario actualizado
            setData({ 
                token: localStorage.getItem('token'),
                usuario: usuarioActualizado 
            });
            
            await alertaExito("¡Datos actualizados!", "Tu información ha sido actualizada exitosamente");
            
            // Opcional: redirigir al inicio después de un tiempo
            setTimeout(() => {
                window.navigate('inicio');
            }, 2000);
            
        } else {
            await alertaError("Error al actualizar", result.error || "No se pudieron actualizar los datos");
        }
        
    } catch (error) {
        cerrarAlerta();
        console.error("Error al actualizar cuenta:", error);
        await alertaError("Error inesperado", "Ocurrió un error al actualizar tu información");
    }
}

// Función para manejar el cerrar sesión
function manejarCerrarSesion() {
    // Limpiar datos de autenticación
    clearAuth();
    
    // Redirigir al inicio
    window.location.hash = '#inicio';
    window.location.reload();
}
