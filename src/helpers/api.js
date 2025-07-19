import { getData, setData, clearAuth } from './auth.js';

export const API_URL = "http://localhost:5010";

// Función para hacer peticiones autenticadas
export const authenticatedRequest = async (url, options = {}) => {
  const { token } = getData();
  
  console.log('=== DEBUG AUTHENTICATED REQUEST ===');
  console.log('Token obtenido de localStorage:', token);
  console.log('Token length:', token ? token.length : 0);
  
  if (!token) {
    console.log('No hay token disponible');
    return { success: false, error: 'No hay token de autenticación' };
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  };

  console.log('Headers que se enviarán:', defaultOptions.headers);

  try {
    const response = await fetch(url, defaultOptions);
    
    if (response.status === 401) {
      console.log('Respuesta 401 - Token expirado o inválido');
      // Token expirado o inválido, limpiar autenticación
      clearAuth();
      return { success: false, error: 'Sesión expirada' };
    }

    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error('Error en petición autenticada:', error);
    return { success: false, error: 'Error de conexión' };
  }
};

// Función para hacer login
export const loginUsuario = async (usuario, clave) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, clave })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return { 
        success: true, 
        data: {
          token: data.data.token, // Solo un token
          usuario: data.data.usuario
        }
      };
    } else {
      return { success: false, error: data.message || 'Error en el login' };
    }
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, error: 'Error de conexión' };
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
    const { token } = getData();
    
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
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
    const result = await authenticatedRequest(`${API_URL}/usuarios/perfil`);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error || 'Error al obtener perfil' };
    }
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// Función para actualizar perfil del usuario
export const actualizarPerfil = async (datosActualizados) => {
  try {
    const result = await authenticatedRequest(`${API_URL}/usuarios/perfil`, {
      method: 'PUT',
      body: JSON.stringify(datosActualizados)
    });
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error || 'Error al actualizar perfil' };
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
    const result = await authenticatedRequest(`${API_URL}/usuarios/admin/todos`);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error || 'Error al obtener usuarios' };
    }
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// Obtener usuario por ID (admin)
export const obtenerUsuarioPorId = async (id) => {
  try {
    const result = await authenticatedRequest(`${API_URL}/usuarios/admin/${id}`);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error || 'Error al obtener usuario' };
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// Actualizar usuario (admin)
export const actualizarUsuarioAdmin = async (id, datosActualizados) => {
  try {
    const result = await authenticatedRequest(`${API_URL}/usuarios/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datosActualizados)
    });
    
    if (result.success) {
      return { success: true, message: result.data.message };
    } else {
      return { success: false, error: result.error || 'Error al actualizar usuario' };
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// Eliminar usuario (admin)
export const eliminarUsuario = async (id) => {
  try {
    const result = await authenticatedRequest(`${API_URL}/usuarios/admin/${id}`, {
      method: 'DELETE'
    });
    
    if (result.success) {
      return { success: true, message: result.data.message };
    } else {
      return { success: false, error: result.error || 'Error al eliminar usuario' };
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// Restaurar usuario (admin)
export const restaurarUsuario = async (id) => {
  try {
    const result = await authenticatedRequest(`${API_URL}/usuarios/admin/${id}/restaurar`, {
      method: 'PATCH'
    });
    
    if (result.success) {
      return { success: true, message: result.data.message };
    } else {
      return { success: false, error: result.error || 'Error al restaurar usuario' };
    }
  } catch (error) {
    console.error('Error al restaurar usuario:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};

// Crear nuevo usuario (admin)
export const crearUsuarioAdmin = async (datosUsuario) => {
  try {
    const result = await authenticatedRequest(`${API_URL}/usuarios/admin/crear`, {
      method: 'POST',
      body: JSON.stringify(datosUsuario)
    });
    
    if (result.success) {
      return { success: true, message: result.data.message, id: result.data.id };
    } else {
      return { success: false, error: result.error || 'Error al crear usuario' };
    }
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return { success: false, error: error.message || 'Error de conexión' };
  }
};
