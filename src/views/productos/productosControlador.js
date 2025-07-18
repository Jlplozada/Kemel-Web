


// Función para crear una card de producto

function crearCardProducto(producto) {
  const card = document.createElement("div");
  card.className = "producto-card";

  // Imagen
  const img = document.createElement("img");
  img.src = producto.imagen ? producto.imagen : "/img/default.png";
  img.alt = producto.nombre;
  img.className = "producto-img";
  card.appendChild(img);

  // Título
  const titulo = document.createElement("h3");
  titulo.textContent = producto.nombre;
  card.appendChild(titulo);

  // Descripción
  const descripcion = document.createElement("p");
  descripcion.textContent = producto.descripcion;
  card.appendChild(descripcion);

  // Precio
  const precio = document.createElement("div");
  precio.className = "producto-precio";
  precio.textContent = `$ ${parseFloat(producto.precio).toLocaleString()}`;
  card.appendChild(precio);

  // Contador y botones
  const contadorDiv = document.createElement("div");
  contadorDiv.className = "contador-div";

  const btnMenos = document.createElement("button");
  btnMenos.textContent = "-";
  btnMenos.className = "btn-menos";

  const cantidadSpan = document.createElement("span");
  cantidadSpan.textContent = "0";
  cantidadSpan.className = "cantidad-span";

  const btnMas = document.createElement("button");
  btnMas.textContent = "+";
  btnMas.className = "btn-mas";

  // Eventos para los botones
  btnMas.addEventListener("click", () => {
    let cantidad = parseInt(cantidadSpan.textContent);
    cantidadSpan.textContent = cantidad + 1;
  });
  btnMenos.addEventListener("click", () => {
    let cantidad = parseInt(cantidadSpan.textContent);
    if (cantidad > 0) cantidadSpan.textContent = cantidad - 1;
  });

  contadorDiv.appendChild(btnMenos);
  contadorDiv.appendChild(cantidadSpan);
  contadorDiv.appendChild(btnMas);
  card.appendChild(contadorDiv);

  return card;
}

// Función principal para cargar productos


export const productosControlador = async function () {
  try {
    const res = await fetch("http://localhost:5010/productos");
    const productos = await res.json();
    const contenedor = document.getElementById("productos-contenedor");
    contenedor.innerHTML = "";
    productos.forEach(producto => {
      const card = crearCardProducto(producto);
      contenedor.appendChild(card);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}
