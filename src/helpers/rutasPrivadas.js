import { Autenticado, getData, refreshNewToken, clearAuth } from './auth.js';
import { puedeAccederPorRol, cargarHeaderSegunRol } from './gestionRoles.js';
import { alertaError } from './alertas.js';

// Función para verificar si un token necesita ser renovado
// Verifica si está próximo a vencer (menos de 2 minutos)
const tokenNeedRefresh = (token) => {
    if (!token) return true;
    
    try {
        // Decodificamos el token para ver su fecha de expiración
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        
        const tiempoActual = Date.now() / 1000; // Tiempo actual en segundos
        const tiempoExpiracion = payload.exp; // Tiempo de expiración del token
        
        // Si faltan menos de 2 minutos (120 segundos), necesita renovación
        const tiempoRestante = tiempoExpiracion - tiempoActual;
        
        console.log(`Tiempo restante del token: ${Math.floor(tiempoRestante / 60)} minutos`);
        
        return tiempoRestante < 120;
        
    } catch (error) {
        console.error("Error al verificar token:", error);
        return true; // Si hay error, mejor renovamos
    }
}

// Función para mostrar mensaje de acceso denegado
const mostrarMensajeAccesoDenegado = async () => {
    await alertaError('Acceso Denegado', 'No tienes permisos para acceder a esta página.');
    
    // Redirigir a una página permitida según el rol
    const { redirigirSegunRol } = await import('./gestionRoles.js');
    redirigirSegunRol();
}

// Función principal para verificar si el usuario puede acceder a rutas privadas
// Retorna true si puede acceder, false si debe ir al login
export const verificarAccesoPrivado = async () => {
    console.log("Verificando acceso a ruta privada...");
    
    // Primero verificamos si hay un token guardado
    if (!Autenticado()) {
        console.log("No hay token, redirigiendo al login");
        return false;
    }

    // Obtenemos el token actual
    const { accessToken } = getData();
    
    // Si el token está próximo a vencer, intentamos renovarlo
    if (tokenNeedRefresh(accessToken)) {
        console.log("Token próximo a vencer, intentando renovar...");
        
        const nuevoToken = await refreshNewToken();
        
        if (!nuevoToken) {
            console.log("No se pudo renovar el token, redirigiendo al login");
            clearAuth(); // Limpiamos datos inválidos
            return false;
        }
        
        console.log("Token renovado exitosamente");
    }
    
    // Si llegamos aquí, el usuario puede acceder
    return true;
}

// Función para proteger una vista con verificación de rol opcional
export const protegerVista = async (nombreVista = "esta vista", rolRequerido = null) => {
    console.log(`Protegiendo ${nombreVista}...`);
    
    // Verificar autenticación básica
    const puedeAcceder = await verificarAccesoPrivado();
    
    if (!puedeAcceder) {
        console.log(`Acceso denegado a ${nombreVista}, redirigiendo al login`);
        
        // Redirigir al login
        if (window.navigate) {
            window.navigate('login');
        } else {
            window.location.hash = '#/login';
        }
        
        return false;
    }

    // Si se especifica un rol requerido o nombre de vista, verificar permisos
    if (rolRequerido) {
        const { tieneRol } = await import('./auth.js');
        if (!tieneRol(rolRequerido)) {
            console.log(`Acceso denegado: se requiere rol ${rolRequerido}`);
            await mostrarMensajeAccesoDenegado();
            return false;
        }
    } else if (nombreVista && nombreVista !== "esta vista") {
        // Verificar si puede acceder a esta vista específica según su rol
        if (!puedeAccederPorRol(nombreVista)) {
            console.log(`Acceso denegado a la vista ${nombreVista} según el rol del usuario`);
            await mostrarMensajeAccesoDenegado();
            return false;
        }
    }

    // Cargar el header correcto según el rol después de verificar acceso
    await cargarHeaderSegunRol();
    
    console.log(`Acceso permitido a ${nombreVista}`);
    return true;
}

// Función para hacer peticiones a rutas protegidas de la API
// Automáticamente maneja la autenticación y renovación de tokens
export const hacerPeticionPrivada = async (url, opciones = {}) => {
    console.log("Haciendo petición privada a:", url);
    
    // Verificamos acceso antes de hacer la petición
    const puedeAcceder = await verificarAccesoPrivado();
    
    if (!puedeAcceder) {
        throw new Error("No autorizado - redirigir al login");
    }

    // Obtenemos el token actual (ya renovado si era necesario)
    const { accessToken } = getData();
    
    // Preparamos los headers con el token
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...opciones.headers // Permitimos headers adicionales
    };

    try {
        // Hacemos la petición con el token
        const respuesta = await fetch(url, {
            ...opciones,
            headers
        });

        // Si obtenemos 401 (no autorizado), intentamos renovar una vez más
        if (respuesta.status === 401) {
            console.log("Token inválido, intentando renovar una vez más...");
            
            const nuevoToken = await refreshNewToken();
            
            if (nuevoToken) {
                // Reintentamos la petición con el nuevo token
                headers.Authorization = `Bearer ${nuevoToken}`;
                
                const segundaRespuesta = await fetch(url, {
                    ...opciones,
                    headers
                });
                
                return segundaRespuesta;
            } else {
                // Si no se pudo renovar, limpiamos datos y devolvemos error
                clearAuth();
                throw new Error("Sesión expirada - redirigir al login");
            }
        }

        return respuesta;
        
    } catch (error) {
        console.error("Error en petición privada:", error);
        throw error;
    }
}

// Función simple para proteger una vista completa (versión original para compatibilidad)
export const protegerVistaSimple = async (nombreVista = "esta vista") => {
    return await protegerVista(nombreVista);
}
