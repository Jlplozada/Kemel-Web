
// Guarda el token de autenticación en el localStorage del navegador
// data: objeto que debe contener accessToken
export const setData = (data) => {
    console.log("setData called"); // Mensaje para depuración
    // Guardar el accessToken en el almacenamiento local
    localStorage.setItem('accessToken', data.accessToken);
}

// Recupera el token almacenado en el localStorage
// Retorna un objeto con accessToken
export const getData = () => {
    return {
        accessToken: localStorage.getItem('accessToken')
    };
}

// Verifica si el usuario está autenticado
// Retorna true si existe un accessToken, false en caso contrario
export const Autenticado = () => {
    console.log(localStorage.accessToken); // Muestra el token actual en consola
    let token = localStorage.getItem('accessToken');

    if (token) {
        console.log("Token encontrado:", token);
        return true; // El usuario está autenticado
    } else {
        return false; // El usuario no está autenticado
    }
}