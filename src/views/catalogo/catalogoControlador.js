// Controlador para catálogo
import { API_URL } from '../../helpers/api.js';

function crearCardCatalogo(producto) {
  const card = document.createElement("div");
  card.className = "catalogo-card";

  // Imagen
  const img = document.createElement("img");
  img.src = producto.imagen ? producto.imagen : "/img/default.png";
  img.alt = producto.nombre;
  img.className = "catalogo-img";
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
  precio.className = "catalogo-precio";
  precio.textContent = `$ ${parseFloat(producto.precio).toLocaleString()}`;
  card.appendChild(precio);

  // Contador y botones
  const contadorDiv = document.createElement("div");
  contadorDiv.className = "catalogo-contador";

  const btnMenos = document.createElement("button");
  btnMenos.textContent = "-";
  btnMenos.className = "btn-menos";

  const cantidadSpan = document.createElement("span");
  cantidadSpan.textContent = "0";
  cantidadSpan.className = "cantidad-span";

  const btnMas = document.createElement("button");
  btnMas.textContent = "+";
  btnMas.className = "btn-mas";

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

export const catalogoControlador = async function () {
  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();
    const contenedor = document.getElementById("catalogo-contenedor");
    contenedor.innerHTML = "";
    
    // Agregar productos
    productos.forEach(producto => {
      const card = crearCardCatalogo(producto);
      contenedor.appendChild(card);
    });
    
    // Agregar botón de crear pedido debajo de los productos
    agregarBotonCrearPedido(contenedor);
    
  } catch (error) {
    console.error("Error al cargar catálogo:", error);
  }
}

// Función para agregar el botón de crear pedido
function agregarBotonCrearPedido(contenedor) {
  const botonContainer = document.createElement("div");
  botonContainer.style.cssText = `
    width: 100%;
    text-align: center;
    margin-top: 30px;
    padding: 20px;
  `;
  
  const btnCrearPedido = document.createElement("button");
  btnCrearPedido.textContent = "Crear Pedido";
  btnCrearPedido.style.cssText = `
    background: #333;
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 18px;
    cursor: pointer;
    border-radius: 0;
  `;
  
  btnCrearPedido.addEventListener("click", () => {
    // Recopilar productos seleccionados
    const productosSeleccionados = recopilarProductosSeleccionados();
    
    if (productosSeleccionados.length === 0) {
      alert("Por favor selecciona al menos un producto para crear el pedido");
      return;
    }
    
    // Aquí puedes agregar la lógica para crear el pedido
    console.log("Productos seleccionados:", productosSeleccionados);
    alert(`Pedido creado con ${productosSeleccionados.length} productos`);
  });
  
  btnCrearPedido.addEventListener("mouseenter", () => {
    btnCrearPedido.style.background = "#555";
  });
  
  btnCrearPedido.addEventListener("mouseleave", () => {
    btnCrearPedido.style.background = "#333";
  });
  
  botonContainer.appendChild(btnCrearPedido);
  contenedor.appendChild(botonContainer);
}

// Función para recopilar productos seleccionados
function recopilarProductosSeleccionados() {
  const cards = document.querySelectorAll(".catalogo-card");
  const productosSeleccionados = [];
  
  cards.forEach((card, index) => {
    const cantidad = parseInt(card.querySelector(".cantidad-span").textContent);
    if (cantidad > 0) {
      const nombre = card.querySelector("h3").textContent;
      const precio = card.querySelector(".catalogo-precio").textContent;
      productosSeleccionados.push({
        nombre,
        precio,
        cantidad
      });
    }
  });
  
  return productosSeleccionados;
}
