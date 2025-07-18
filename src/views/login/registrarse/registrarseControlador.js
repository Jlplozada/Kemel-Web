

export function registrarseControlador() {
  // Cargar ciudades desde la API y poblar el select
  const selectCiudad = document.getElementById("ciudad");
  if (selectCiudad) {
    selectCiudad.innerHTML = '<option value="">Selecciona una ciudad...</option>';
    fetch("http://localhost:5010/ciudades")
      .then(res => res.json())
      .then(ciudades => {
        ciudades.forEach(c => {
          const option = document.createElement("option");
          option.value = c.id;
          option.textContent = c.nombre;
          selectCiudad.appendChild(option);
        });
      })
      .catch(err => {
        console.error("Error al cargar ciudades:", err);
      });
  }
  const form = document.getElementById("registro-form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let valido = true;

    // Limpiar errores
    document.querySelectorAll(".error").forEach(el => el.textContent = "");

    // Validar nombre
    const nombre = form.nombre.value.trim();
    if (nombre.length < 3) {
      document.getElementById("error-nombre").textContent = "El nombre debe tener al menos 3 caracteres.";
      valido = false;
    }

    // Validar email
    const email = form.email.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      document.getElementById("error-email").textContent = "Correo electrónico inválido.";
      valido = false;
    }

    // Validar contraseña
    const password = form.password.value;
    if (password.length < 6) {
      document.getElementById("error-password").textContent = "La contraseña debe tener al menos 6 caracteres.";
      valido = false;
    }

    // Validar confirmación
    const confirmar = form.confirmar.value;
    if (password !== confirmar) {
      document.getElementById("error-confirmar").textContent = "Las contraseñas no coinciden.";
      valido = false;
    }

    if (valido) {
      // Enviar datos a la API
      const datos = {
        nombre,
        email,
        password
      };
      fetch("/api/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Registro exitoso!");
          form.reset();
        } else {
          // Mostrar error de la API
          document.getElementById("error-email").textContent = data.message || "Error en el registro.";
        }
      })
      .catch(() => {
        document.getElementById("error-email").textContent = "No se pudo conectar con el servidor.";
      });
    }
  });
}
