// Controlador para catálogo
import { API_URL, authenticatedRequest } from '../../helpers/api.js';
import { Autenticado, getUsuario } from '../../helpers/auth.js';
import { alertaError, alertaExito, alertaLoading, alertaConfirmacion, cerrarAlerta } from '../../helpers/alertas.js';

function crearCardCatalogo(producto) {
  const card = document.createElement("div");
  card.className = "catalogo-card";

  // Imagen
  const img = document.createElement("img");
  if (producto.imagen) {
    img.src = `${API_URL}${producto.imagen}`;
    img.onerror = function() {
      this.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.style.cssText = `
        width: 100%;
        height: 200px;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 14px;
      `;
      placeholder.textContent = 'Sin imagen';
      this.parentNode.insertBefore(placeholder, this.nextSibling);
    };
  } else {
    // Si no hay imagen, crear placeholder
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
      width: 100%;
      height: 200px;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 14px;
    `;
    placeholder.textContent = 'Sin imagen';
    card.appendChild(placeholder);
  }
  
  if (producto.imagen) {
    img.alt = producto.nombre;
    img.className = "catalogo-img";
    card.appendChild(img);
  }

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
    if (cantidad < 5) {
      cantidadSpan.textContent = cantidad + 1;
    }
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
    console.log("=== CARGANDO CATÁLOGO ===");
    const res = await fetch(`${API_URL}/productos`);
    
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }
    
    const productos = await res.json();
    console.log("Productos recibidos:", productos);
    console.log("Cantidad de productos activos:", productos.length);
    
    const contenedor = document.getElementById("catalogo-contenedor");
    if (!contenedor) {
      console.error("No se encontró el contenedor del catálogo");
      return;
    }
    
    contenedor.innerHTML = "";
    
    // Verificar que hay productos activos
    if (productos.length === 0) {
      console.log("No hay productos activos disponibles");
      const mensajeVacio = document.createElement("div");
      mensajeVacio.style.cssText = `
        text-align: center;
        padding: 40px;
        color: #666;
        font-size: 18px;
      `;
      mensajeVacio.textContent = "No hay productos disponibles en este momento";
      contenedor.appendChild(mensajeVacio);
      return;
    }
    
    // Agregar productos (solo los activos que vienen del servidor)
    productos.forEach((producto, index) => {
      console.log(`Procesando producto ${index + 1}:`, producto);
      // Solo procesar productos que tienen estado activo (doble verificación)
      if (producto.estado === 'activo' || !producto.estado) { // Si no tiene estado, asumimos que es activo
        const card = crearCardCatalogo(producto);
        contenedor.appendChild(card);
      } else {
        console.log(`Producto ${producto.nombre} omitido por estado: ${producto.estado}`);
      }
    });
    
    // Agregar botón de crear pedido debajo de los productos
    agregarBotonCrearPedido(contenedor);
    
  } catch (error) {
    console.error("Error al cargar catálogo:", error);
    await alertaError("Error", "No se pudieron cargar los productos del catálogo");
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
  // 1. Obtener todas las tarjetas de productos del DOM
  const cards = document.querySelectorAll(".catalogo-card");
  const productosSeleccionados = [];
  
  // 2. Recorrer cada tarjeta para verificar qué productos tienen cantidad > 0
  cards.forEach((card, index) => {
    // 2.1 Obtener la cantidad seleccionada del contador
    const cantidad = parseInt(card.querySelector(".cantidad-span").textContent);
    
    // 2.2 Solo procesar productos que tienen cantidad mayor a 0
    if (cantidad > 0) {
      // 2.3 Extraer información del producto desde el DOM
      const nombre = card.querySelector("h3").textContent;
      const precioTexto = card.querySelector(".catalogo-precio").textContent;
      
      // 2.4 Convertir el precio formateado a número
      // Ejemplo: "$ 26.500" debe convertirse a 26500
      let precio = precioTexto.replace(/[$\s]/g, ''); // Remover símbolo $ y espacios
      precio = precio.replace(/\./g, ''); // Remover puntos separadores de miles
      precio = parseFloat(precio); // Convertir string a número
      
      console.log(`Producto: ${nombre}, Texto original: "${precioTexto}", Precio parseado: ${precio}`);
      
      // 2.5 Crear objeto del producto con subtotal calculado
      productosSeleccionados.push({
        nombre,           // Nombre del producto
        precio,          // Precio unitario (número)
        cantidad,        // Cantidad seleccionada
        subtotal: precio * cantidad  // Precio total de este producto
      });
    }
  });
  
  return productosSeleccionados;
}

// Función para crear el pedido en la base de datos
async function crearPedidoEnBaseDatos(productosSeleccionados) {
  try {
    // 1. Mostrar alerta de carga mientras se procesa
    alertaLoading("Creando pedido", "Procesando tu pedido...");
    
    // 2. Obtener información del usuario autenticado
    const usuario = getUsuario();
    
    // 3. CALCULAR EL TOTAL DEL PEDIDO
    // Suma todos los subtotales de los productos seleccionados
    // Ejemplo: si hay 3 productos con subtotales 10000, 15000, 8000
    // el total será: 10000 + 15000 + 8000 = 33000
    const total = productosSeleccionados.reduce((sum, producto) => sum + producto.subtotal, 0);
    
    // 4. Preparar datos del pedido para enviar al servidor
    const pedidoData = {
      nombre: `Pedido de ${usuario.nombre}`,
      usuario_id: usuario.id,
      direccion_entrega: usuario.direccion || '',
      ciudad_id: usuario.ciudad_id || 1,
      total: total,                    // Total calculado arriba
      estado: 'pendiente',
      productos: productosSeleccionados // Array con todos los productos
    };
    
    console.log("Datos del pedido a enviar:", pedidoData);
    
    // 5. Enviar el pedido al servidor mediante la API
    const result = await authenticatedRequest(`${API_URL}/pedidos`, {
      method: 'POST',
      body: JSON.stringify(pedidoData)
    });
    
    // 6. Cerrar la alerta de carga
    cerrarAlerta();
    
    // 7. MOSTRAR RESULTADO AL USUARIO
    if (result.success) {
      // 7.1 FORMATEAR EL TOTAL PARA MOSTRAR
      // Convertir número a formato colombiano con separadores de miles
      // Ejemplo: 33000 se convierte en "33.000"
      const totalFormateado = total.toLocaleString('es-CO');
      
      // 7.2 MOSTRAR ALERTA DE ÉXITO CON EL TOTAL
      // Esta es la alerta que muestra el total de compra al usuario
      await alertaExito("¡Pedido creado!", `Tu pedido ha sido creado exitosamente. Total: $${totalFormateado}`);
      
      // 7.3 Limpiar el carrito después del éxito
      limpiarCarrito();
      
      console.log("Pedido creado exitosamente:", result.data);
    } else {
      // 7.4 Mostrar error si el servidor rechaza el pedido
      await alertaError("Error al crear pedido", result.error || "No se pudo crear el pedido");
    }
    
  } catch (error) {
    // 8. Manejar errores inesperados
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
