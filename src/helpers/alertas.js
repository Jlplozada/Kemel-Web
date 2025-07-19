import Swal from 'sweetalert2';


// Alerta de éxito
export const alertaExito = (titulo, mensaje = '') => {
    return Swal.fire({
        icon: 'success',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#28a745'
    });
};

// Alerta de error
export const alertaError = (titulo, mensaje = '') => {
    return Swal.fire({
        icon: 'error',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc3545'
    });
};

// Alerta de advertencia
export const alertaAdvertencia = (titulo, mensaje = '') => {
    return Swal.fire({
        icon: 'warning',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ffc107'
    });
};

// Alerta de información
export const alertaInfo = (titulo, mensaje = '') => {
    return Swal.fire({
        icon: 'info',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#17a2b8'
    });
};

// Confirmación (sí/no)
export const alertaConfirmacion = (titulo, mensaje = '', textoConfirmar = 'Sí', textoCancelar = 'No') => {
    return Swal.fire({
        title: titulo,
        text: mensaje,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#dc3545',
        confirmButtonText: textoConfirmar,
        cancelButtonText: textoCancelar
    });
};

// Alerta con input
export const alertaInput = (titulo, mensaje = '', placeholder = '') => {
    return Swal.fire({
        title: titulo,
        text: mensaje,
        input: 'text',
        inputPlaceholder: placeholder,
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#dc3545',
        inputValidator: (value) => {
            if (!value) {
                return 'Debes escribir algo';
            }
        }
    });
};

// Toast (notificación pequeña)
export const toast = (mensaje, tipo = 'success', posicion = 'top-end') => {
    const Toast = Swal.mixin({
        toast: true,
        position: posicion,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    return Toast.fire({
        icon: tipo,
        title: mensaje
    });
};

// Loading con texto personalizable
export const alertaLoading = (titulo = 'Cargando...', mensaje = 'Por favor espera') => {
    return Swal.fire({
        title: titulo,
        text: mensaje,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

// Cerrar cualquier alerta activa
export const cerrarAlerta = () => {
    Swal.close();
};

// Alerta personalizada para el tema de la panadería
export const alertaPanaderia = (titulo, mensaje = '', icono = 'success') => {
    return Swal.fire({
        title: titulo,
        text: mensaje,
        icon: icono,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#8B4513', // Color marrón para el tema de panadería
        background: '#FFF8DC', // Fondo color crema
        color: '#8B4513'
    });
};
