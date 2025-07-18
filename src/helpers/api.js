import { getData, setData, clearAuth, tokenNearExpiry } from './auth.js';

export const API_URL = "http://localhost:5010";

// Función para hacer refresh del token automáticamente
export const refreshAccessToken = async () => {
  try {
    const { refreshToken } = getData();
    
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      // Actualizar tokens
      setData({
        accessToken: data.data.token,
        refreshToken: data.data.refreshToken
      });
      return { success: true, token: data.data.token };
    } else {
      // Si el refresh token es inválido, limpiar todo
      clearAuth();
      return { success: false, error: data.message || 'Error al refrescar token' };
    }
  } catch (error) {
    console.error('Error al refrescar token:', error);
    clearAuth();
    return { success: false, error: 'Error de conexión al refrescar token' };
  }
};

// Función para hacer peticiones autenticadas con manejo automático de tokens
export const authenticatedRequest = async (url, options = {}) => {
  let { accessToken } = getData();
  
  // Verificar si el token necesita ser refrescado
  if (accessToken && tokenNearExpiry(accessToken)) {
    console.log('Token próximo a expirar, refrescando...');
    const refreshResult = await refreshAccessToken();
    
    if (refreshResult.success) {
      accessToken = refreshResult.token;
    } else {
      throw new Error('No se pudo refrescar el token');
    }
  }

  // Configurar headers de autorización
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Hacer la petición
  const response = await fetch(url, {
    ...options,
    headers
  });

  // Si obtenemos 401, intentar refrescar token una vez más
  if (response.status === 401 && accessToken) {
    console.log('Token inválido, intentando refrescar...');
    const refreshResult = await refreshAccessToken();
    
    if (refreshResult.success) {
      // Reintentar la petición con el nuevo token
      headers.Authorization = `Bearer ${refreshResult.token}`;
      return await fetch(url, {
        ...options,
        headers
      });
    } else {
      // Si no se puede refrescar, limpiar datos y devolver error
      clearAuth();
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
  }

  return response;
};

// Función para hacer login
export const loginUsuario = async (email, clave) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, clave })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return { 
        success: true, 
        data: {
          token: data.data.token,
          refreshToken: data.data.refreshToken,
          usuario: data.data.usuario
        }
      };
    } else {
      return { success: false, error: data.message || 'Error en el login' };
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    return { success: false, error: 'No se pudo conectar con el servidor' };
  }
};

// Función para registrar usuario
export const registrarUsuario = async (datosUsuario) => {
  try {
    const response = await fetch(`${API_URL}/usuarios/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosUsuario)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || 'Error en el registro' };
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    return { success: false, error: 'No se pudo conectar con el servidor' };
  }
};

// Función para obtener ciudades
export const obtenerCiudades = async () => {
  try {
    const response = await fetch(`${API_URL}/ciudades`);
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: 'Error al cargar ciudades' };
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    return { success: false, error: 'No se pudo conectar con el servidor' };
  }
};

// Función para logout
export const logout = async () => {
  try {
    const { refreshToken } = getData();
    
    if (refreshToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });
    }
  } catch (error) {
    console.error('Error en logout:', error);
  } finally {
    // Siempre limpiar datos locales
    clearAuth();
  }
};

// Función para obtener perfil del usuario
export const obtenerPerfil = async () => {
  try {
    const response = await authenticatedRequest(`${API_URL}/usuarios/perfil`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Error al obtener perfil' };
    }
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// Función para actualizar perfil del usuario
export const actualizarPerfil = async (datosActualizados) => {
  try {
    const response = await authenticatedRequest(`${API_URL}/usuarios/perfil`, {
      method: 'PUT',
      body: JSON.stringify(datosActualizados)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || 'Error al actualizar perfil' };
    }
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// === FUNCIONES PARA ADMINISTRACIÓN DE USUARIOS ===

// Obtener todos los usuarios (admin)
export const obtenerTodosUsuarios = async () => {
  try {
    const response = await authenticatedRequest(`${API_URL}/usuarios/admin/todos`);
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error || 'Error al obtener usuarios' };
    }
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// Obtener usuario por ID (admin)
export const obtenerUsuarioPorId = async (id) => {
  try {
    const response = await authenticatedRequest(`${API_URL}/usuarios/admin/${id}`);
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error || 'Error al obtener usuario' };
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// Actualizar usuario (admin)
export const actualizarUsuarioAdmin = async (id, datosActualizados) => {
  try {
    const response = await authenticatedRequest(`${API_URL}/usuarios/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datosActualizados)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.error || 'Error al actualizar usuario' };
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// Eliminar usuario (admin)
export const eliminarUsuario = async (id) => {
  try {
    const response = await authenticatedRequest(`${API_URL}/usuarios/admin/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.error || 'Error al eliminar usuario' };
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// Restaurar usuario (admin)
export const restaurarUsuario = async (id) => {
  try {
    const response = await authenticatedRequest(`${API_URL}/usuarios/admin/${id}/restaurar`, {
      method: 'PATCH'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.error || 'Error al restaurar usuario' };
    }
  } catch (error) {
    console.error('Error al restaurar usuario:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// Crear nuevo usuario (admin)
export const crearUsuarioAdmin = async (datosUsuario) => {
  try {
    const response = await authenticatedRequest(`${API_URL}/usuarios/admin/crear`, {
      method: 'POST',
      body: JSON.stringify(datosUsuario)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message, id: data.id };
    } else {
      return { success: false, error: data.error || 'Error al crear usuario' };
    }
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};
