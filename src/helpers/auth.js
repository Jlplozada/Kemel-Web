
// Función para guardar el token cuando el usuario hace login
export const setData = (data) => {
    console.log("=== DEBUG SETDATA ===");
    console.log("setData called con:", data);
    
    // Guardamos solo el token (que llamamos token pero internamente es el refresh token)
    if (data.token) {
        localStorage.setItem('token', data.token);
        console.log("Token guardado en localStorage:", data.token);
    } else {
        console.log("No se recibió token en setData");
    }
    
    // Si viene información del usuario, también la guardamos
    if (data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        console.log("Usuario guardado:", data.usuario);
    }
}

// Función para obtener el token guardado en el navegador
export const getData = () => {
    return {
        token: localStorage.getItem('token')
    };
}

// Función para verificar si el usuario está conectado (autenticado)
export const Autenticado = () => {
    console.log(localStorage.token); // Ver en consola el token actual
    let token = localStorage.getItem('token');

    if (token) {
        console.log("Token encontrado:", token);
        return true; // El usuario SÍ está conectado
    } else {
        return false; // El usuario NO está conectado
    }
}

// Función para limpiar los datos de autenticación (logout)
export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
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
    return rol === 'admin';
}

// Función para verificar si el usuario es panadero
export const esPanadero = () => {
    const rol = getRolUsuario();
    return rol === 'panaderia';
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

// Función para verificar si necesitamos renovar el token
// Devuelve true si el token está próximo a vencer (para futuras implementaciones)
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