
import { registrarUsuario, obtenerCiudades } from '../../../helpers/api.js';
import { alertaError, alertaExito, alertaLoading, cerrarAlerta, toast } from '../../../helpers/alertas.js';

export function registrarseControlador() {
  console.log("registrarseControlador ejecutado");

  // Cargar ciudades desde la API y poblar el select
  cargarCiudades();

  // Configurar funcionalidad de mostrar/ocultar contraseñas
  configurarMostrarPasswords();

  // Configurar el formulario de registro
  const form = document.getElementById("registro-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    
    if (validarFormulario(form)) {
      await procesarRegistro(form);
    }
  });

  // Navegación SPA para el enlace de login
  const linkLogin = document.querySelector('.form-links a');
  if (linkLogin) {
    linkLogin.addEventListener('click', function(e) {
      e.preventDefault();
      window.navigate ? window.navigate('login') : window.location.hash = '#/login';
    });
  }
}

// Función para cargar ciudades desde la API
async function cargarCiudades() {
  const selectCiudad = document.getElementById("ciudad");
  if (!selectCiudad) return;

  selectCiudad.innerHTML = '<option value="">Cargando ciudades...</option>';
  
  const resultado = await obtenerCiudades();
  
  if (resultado.success) {
    selectCiudad.innerHTML = '<option value="">Selecciona una ciudad...</option>';
    resultado.data.forEach(ciudad => {
      const option = document.createElement("option");
      option.value = ciudad.id;
      option.textContent = ciudad.nombre;
      selectCiudad.appendChild(option);
    });
  } else {
    selectCiudad.innerHTML = '<option value="">Error al cargar ciudades</option>';
    console.error("Error al cargar ciudades:", resultado.error);
  }
}

// Función para validar el formulario
function validarFormulario(form) {
  let valido = true;

  // Limpiar errores anteriores
  limpiarErrores();

  // Validar nombre
  const nombre = form.nombre.value.trim();
  if (nombre.length < 3) {
    mostrarError("error-nombre", "El nombre debe tener al menos 3 caracteres.");
    valido = false;
  }

  // Validar usuario
  const usuario = form.usuario.value.trim();
  if (usuario.length < 3) {
    mostrarError("error-usuario", "El usuario debe tener al menos 3 caracteres.");
    valido = false;
  } else if (usuario.length > 50) {
    mostrarError("error-usuario", "El usuario no puede exceder 50 caracteres.");
    valido = false;
  } else if (!/^[a-zA-Z0-9_]+$/.test(usuario)) {
    mostrarError("error-usuario", "El usuario solo puede contener letras, números y guiones bajos.");
    valido = false;
  }

  // Validar email
  const email = form.email.value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    mostrarError("error-email", "Correo electrónico inválido.");
    valido = false;
  }

  // Validar contraseña
  const password = form.password.value;
  if (password.length < 6) {
    mostrarError("error-password", "La contraseña debe tener al menos 6 caracteres.");
    valido = false;
  }

  // Validar confirmación
  const confirmar = form.confirmar.value;
  if (password !== confirmar) {
    mostrarError("error-confirmar", "Las contraseñas no coinciden.");
    valido = false;
  }

  // Validar teléfono
  const telefono = form.telefono.value.trim();
  if (telefono && !/^\d{10}$/.test(telefono)) {
    mostrarError("error-telefono", "El teléfono debe tener 10 dígitos.");
    valido = false;
  }

  return valido;
}

// Función para procesar el registro
async function procesarRegistro(form) {
  // Mostrar loading
  alertaLoading('Registrando Usuario', 'Creando tu cuenta...');

  try {
    // Preparar datos para enviar
    const datosUsuario = {
      usuario: form.usuario.value.trim(),
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
      telefono: form.telefono.value.trim() || null,
      direccion: form.direccion.value.trim() || null,
      ciudad: form.ciudad.value || null
    };

    // Enviar datos a la API
    const resultado = await registrarUsuario(datosUsuario);
    
    if (resultado.success) {
      // Registro exitoso
      cerrarAlerta();
      
      // Construir mensaje con el nombre de usuario final
      let mensaje = '¡Tu cuenta ha sido creada! Puedes iniciar sesión ahora.';
      if (resultado.data && resultado.data.usuario) {
        mensaje += `\n\nTu nombre de usuario final es: ${resultado.data.usuario}`;
        if (resultado.data.mensaje) {
          mensaje += `\n${resultado.data.mensaje}`;
        }
        mensaje += '\nPuedes usar este nombre de usuario o tu correo electrónico para iniciar sesión.';
      }
      
      await alertaExito('¡Registro Exitoso!', mensaje);
      form.reset();
      
      // Redirigir al login
      window.navigate ? window.navigate('login') : window.location.hash = '#/login';
      
    } else {
      // Error en el registro
      cerrarAlerta();
      await alertaError('Error en el Registro', resultado.error);
    }
    
  } catch (error) {
    console.error('Error inesperado:', error);
    cerrarAlerta();
    await alertaError('Error Inesperado', 'Error inesperado. Por favor, intenta de nuevo.');
  }
}

// Función para limpiar errores
function limpiarErrores() {
  const errores = document.querySelectorAll('[id^="error-"]');
  errores.forEach(error => {
    if (error) error.textContent = "";
  });
  
  const mensajeGeneral = document.querySelector('.mensaje-general');
  if (mensajeGeneral) {
    mensajeGeneral.remove();
  }
}

// Función para mostrar error específico
function mostrarError(idError, mensaje) {
  let errorElement = document.getElementById(idError);
  
  if (!errorElement) {
    // Si no existe el elemento de error, crearlo
    errorElement = document.createElement('div');
    errorElement.id = idError;
    errorElement.className = 'error';
    errorElement.style.cssText = `
      color: #c33;
      font-size: 0.9em;
      margin-top: 5px;
    `;
    
    // Encontrar el campo relacionado y agregar el error después
    const campo = idError.replace('error-', '');
    const input = document.getElementById(campo) || document.querySelector(`[name="${campo}"]`);
    if (input && input.parentNode) {
      input.parentNode.appendChild(errorElement);
    }
  }
  
  errorElement.textContent = mensaje;
}

// Función para mostrar mensaje de éxito general
function mostrarExitoGeneral(mensaje) {
  // Remover mensaje anterior
  const mensajeAnterior = document.querySelector('.mensaje-general');
  if (mensajeAnterior) {
    mensajeAnterior.remove();
  }

  // Crear nuevo mensaje
  const mensajeDiv = document.createElement('div');
  mensajeDiv.className = 'mensaje-general';
  mensajeDiv.style.cssText = `
    background-color: #efe;
    color: #3c3;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #cfc;
    text-align: center;
    font-weight: bold;
  `;
  mensajeDiv.textContent = mensaje;

  const form = document.getElementById("registro-form");
  form.insertBefore(mensajeDiv, form.firstChild);
}

// Función para configurar la funcionalidad de mostrar/ocultar contraseñas
function configurarMostrarPasswords() {
  const checkboxMostrar = document.getElementById('mostrar-passwords');
  const inputPassword = document.getElementById('password');
  const inputConfirmar = document.getElementById('confirmar');
  
  if (checkboxMostrar && inputPassword && inputConfirmar) {
    checkboxMostrar.addEventListener('change', function() {
      if (this.checked) {
        inputPassword.type = 'text';
        inputConfirmar.type = 'text';
      } else {
        inputPassword.type = 'password';
        inputConfirmar.type = 'password';
      }
    });
  }
}
