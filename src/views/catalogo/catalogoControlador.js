// Controlador para catálogo
import { API_URL, authenticatedRequest } from '../../helpers/api.js';
import { Autenticado, getUsuario } from '../../helpers/auth.js';
import { alertaError, alertaExito, alertaLoading, alertaConfirmacion, cerrarAlerta } from '../../helpers/alertas.js';

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
  
  btnCrearPedido.addEventListener("click", async () => {
    // Recopilar productos seleccionados
    const productosSeleccionados = recopilarProductosSeleccionados();
    
    if (productosSeleccionados.length === 0) {
      await alertaError("Productos requeridos", "Por favor selecciona al menos un producto para crear el pedido");
      return;
    }
    
    // Verificar si el usuario está autenticado
    if (!Autenticado()) {
      await alertaError("Autenticación requerida", "Debes iniciar sesión para crear un pedido");
      // Redirigir al login
      setTimeout(() => {
        if (window.navigate) {
          window.navigate('login');
        } else {
          window.location.hash = '#/login';
        }
      }, 2000);
      return;
    }
    
    // Crear el pedido en la base de datos
    await crearPedidoEnBaseDatos(productosSeleccionados);
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
      const precioTexto = card.querySelector(".catalogo-precio").textContent;
      
      // Extraer el precio numérico del texto para pesos colombianos
      // El texto viene como "$ 26.500" y necesitamos convertirlo a 26500
      let precio = precioTexto.replace(/[$\s]/g, ''); // Remover $ y espacios
      precio = precio.replace(/\./g, ''); // Remover puntos (separadores de miles)
      precio = parseFloat(precio); // Convertir a número
      
      console.log(`Producto: ${nombre}, Texto original: "${precioTexto}", Precio parseado: ${precio}`);
      
      productosSeleccionados.push({
        nombre,
        precio,
        cantidad,
        subtotal: precio * cantidad
      });
    }
  });
  
  return productosSeleccionados;
}

// Función para crear el pedido en la base de datos
async function crearPedidoEnBaseDatos(productosSeleccionados) {
  try {
    alertaLoading("Creando pedido", "Procesando tu pedido...");
    
    const usuario = getUsuario();
    
    // Calcular el total del pedido
    const total = productosSeleccionados.reduce((sum, producto) => sum + producto.subtotal, 0);
    
    // Datos del pedido
    const pedidoData = {
      nombre: `Pedido de ${usuario.nombre}`,
      usuario_id: usuario.id,
      direccion_entrega: usuario.direccion || '',
      ciudad_id: usuario.ciudad_id || 1,
      total: total,
      estado: 'pendiente',
      productos: productosSeleccionados
    };
    
    console.log("Datos del pedido a enviar:", pedidoData);
    
    // Crear el pedido mediante la API
    const result = await authenticatedRequest(`${API_URL}/pedidos`, {
      method: 'POST',
      body: JSON.stringify(pedidoData)
    });
    
    cerrarAlerta();
    
    if (result.success) {
      // Formatear el total en pesos colombianos
      const totalFormateado = total.toLocaleString('es-CO');
      await alertaExito("¡Pedido creado!", `Tu pedido ha sido creado exitosamente. Total: $${totalFormateado}`);
      
      // Limpiar el carrito (resetear contadores)
      limpiarCarrito();
      
      console.log("Pedido creado exitosamente:", result.data);
    } else {
      await alertaError("Error al crear pedido", result.error || "No se pudo crear el pedido");
    }
    
  } catch (error) {
    cerrarAlerta();
    console.error("Error al crear pedido:", error);
    await alertaError("Error inesperado", "Ocurrió un error al crear el pedido. Intenta nuevamente.");
  }
}

// Función para limpiar el carrito después de crear el pedido
function limpiarCarrito() {
  const contadores = document.querySelectorAll(".cantidad-span");
  contadores.forEach(contador => {
    contador.textContent = "0";
  });
}
