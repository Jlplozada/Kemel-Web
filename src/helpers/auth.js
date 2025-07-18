
// Función para guardar los tokens cuando el usuario hace login
export const setData = (data) => {
    console.log("setData called"); // Mensaje para ver en consola que se ejecutó
    
    // Guardamos el token de acceso (se usa para autenticar las peticiones)
    localStorage.setItem('accessToken', data.accessToken);
    
    // Guardamos el token de refresco (se usa para obtener nuevos tokens de acceso)
    localStorage.setItem('refreshToken', data.refreshToken);
    
    // Si viene información del usuario, también la guardamos
    if (data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
    }
}

// Función para obtener los tokens guardados en el navegador
export const getData = () => {
    return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken')
    };
}

// Función para verificar si el usuario está conectado (autenticado)
export const Autenticado = () => {
    console.log(localStorage.accessToken); // Ver en consola el token actual
    let token = localStorage.getItem('accessToken');

    if (token) {
        console.log("Token encontrado:", token);
        return true; // El usuario SÍ está conectado
    } else {
        return false; // El usuario NO está conectado
    }
}

// Función para obtener un nuevo token cuando el actual expira
// Esta función se ejecuta automáticamente cuando el token caduca
export const refreshNewToken = async () => {
    // Obtenemos el refreshToken guardado
    const {refreshToken} = getData();

    // Si no hay refreshToken, no podemos renovar
    if (!refreshToken) {
        console.log("No hay refresh token disponible");
        return null;
    }

    try {
        // Pedimos a la API un nuevo token usando el refreshToken
        const respuestaRefresh = await fetch('http://localhost:5010/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken: refreshToken })
        });

        // Si la petición falló, no podemos renovar
        if (!respuestaRefresh.ok) {
            console.log("Error al refrescar token");
            return null;
        }

        // Convertimos la respuesta a formato JSON
        const data = await respuestaRefresh.json();
        console.log("Respuesta del refresh:", data);
        
        // Si la API nos devolvió un nuevo token de acceso
        if (data.success && data.data.token) {
            // Guardamos el nuevo accessToken
            localStorage.setItem('accessToken', data.data.token);

            // Si también nos dio un nuevo refreshToken, lo guardamos
            if (data.data.refreshToken) {
                localStorage.setItem('refreshToken', data.data.refreshToken);
            }

            // Devolvemos el nuevo token para usarlo inmediatamente
            return data.data.token;

        } else {
            console.log("No se pudo obtener nuevo token");
            return null;
        }
        
    } catch (error) {
        console.error("Error al refrescar el token:", error);
        return null; // Devuelve null si hubo algún error
    }
}

// Función para obtener información del usuario guardada
export const getUsuario = () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}

// Función para obtener el rol del usuario actual
export const getRolUsuario = () => {
    const usuario = getUsuario();
    return usuario ? usuario.rol : null;
}

// Función para verificar si el usuario es administrador
export const esAdministrador = () => {
    const rol = getRolUsuario();
    return rol === 'administrador' || rol === 'admin';
}

// Función para verificar si el usuario es panadero
export const esPanadero = () => {
    const rol = getRolUsuario();
    return rol === 'panadero';
}

// Función para verificar si el usuario tiene un rol específico
export const tieneRol = (rolRequerido) => {
    const rol = getRolUsuario();
    return rol === rolRequerido;
}

// Función para verificar si el usuario tiene alguno de varios roles
export const tieneAlgunRol = (...rolesPermitidos) => {
    const rol = getRolUsuario();
    return rolesPermitidos.includes(rol);
}

// Función para limpiar todos los datos cuando el usuario cierra sesión
export const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    console.log("Datos de autenticación eliminados");
}

// Función para verificar si necesitamos renovar el token
// Devuelve true si el token está próximo a vencer
export const tokenNearExpiry = (token) => {
    // Si no hay token, consideramos que necesita renovación
    if (!token) return true;
    
    try {
        // Extraemos la información del token (sin verificar la firma)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000; // Tiempo actual en segundos
        
        // Si faltan menos de 2 minutos para que expire, decimos que necesita renovación
        return (payload.exp - currentTime) < 120;
    } catch (error) {
        console.error('Error al verificar expiración del token:', error);
        return true; // Si hay error, mejor renovamos
    }
}