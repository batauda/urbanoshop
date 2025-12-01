// -------------------------
// app.js - Completo (Webpay simulado, tarjetas rápidas, validación, historial)
// -------------------------

/* -------------------------
   UTIL & TOAST
   ------------------------- */
function mostrarMensaje(texto, tipo = "success") {
  const toast = document.createElement("div");
  toast.className = "toast " + (tipo === "success" ? "toast-success" : "toast-error");
  toast.textContent = texto;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 50);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function mostrarMensajeCentro(texto) {
  const t = document.createElement("div");
  t.className = "toast-center";
  t.innerHTML = `${texto} <button onclick="window.location.href='catalogo.html'">Volver al inicio</button>`;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 50);
  setTimeout(() => { t.classList.remove("show"); setTimeout(()=>t.remove(),300); }, 4200);
}

/* -------------------------
   THEME
   ------------------------- */
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark":"light");
}
(function applyTheme() {
  const t = localStorage.getItem("theme");
  if (t === "dark") document.body.classList.add("dark");
})();

/* -------------------------
   MENÚ USUARIO
   ------------------------- */
function toggleMenu() {
  const menu = document.getElementById("menu");
  if (!menu) return;
  menu.classList.toggle("show");
}
document.addEventListener("click", (e) => {
  const menu = document.getElementById("menu");
  if (!menu) return;
  const ua = e.target.closest('.user-area');
  if (!ua) menu.classList.remove('show');
});

/* -------------------------
   SESIÓN & USUARIO
   ------------------------- */
function mostrarUsuarioHeader() {
  const nombre = localStorage.getItem("usuario") || "";
  const el = document.getElementById("usuario-log");
  if (el) el.textContent = nombre ? "Hola, " + nombre : "";
}
function verificarSesion() {
  const usuario = localStorage.getItem("usuario");
  if (!usuario && !window.location.pathname.includes("index.html")) {
    window.location.href = "index.html";
  } else {
    mostrarUsuarioHeader();
  }
}
verificarSesion();

function registrar() {
  const email = (document.getElementById("email")||{}).value || "";
  const pass = (document.getElementById("password")||{}).value || "";
  if (!email || !pass) { mostrarMensaje("Completa correo y contraseña.", "error"); return false; }
  localStorage.setItem("usuario", email);
  localStorage.setItem("password", pass);
  if (!localStorage.getItem("tarjetas")) localStorage.setItem("tarjetas", JSON.stringify([]));
  if (!localStorage.getItem("carrito")) localStorage.setItem("carrito", JSON.stringify([]));
  if (!localStorage.getItem("history")) localStorage.setItem("history", JSON.stringify([]));
  mostrarMensaje("Cuenta creada correctamente", "success");
  setTimeout(()=> window.location.href = "catalogo.html",700);
  return false;
}
function login() {
  const email = prompt("Correo:");
  const pass = prompt("Contraseña:");
  const savedEmail = localStorage.getItem("usuario");
  const savedPass = localStorage.getItem("password");
  if (email === savedEmail && pass === savedPass) {
    mostrarMensaje("Inicio de sesión correcto", "success");
    window.location.href = "catalogo.html";
  } else {
    mostrarMensaje("Correo o contraseña incorrectos", "error");
  }
}
function logout() {
  mostrarMensaje("Sesión cerrada", "success");
  setTimeout(()=> window.location.href = "index.html", 500);
}

/* -------------------------
   PERFIL
   ------------------------- */
function cargarPerfil() {
  const emailEl = document.getElementById("perfil-correo");
  if (!emailEl) return;
  emailEl.value = localStorage.getItem("usuario") || "";
  mostrarTarjetas();
  mostrarHistorial();
}
function guardarPerfil() {
  const nuevo = (document.getElementById("perfil-correo")||{}).value.trim();
  if (!nuevo) { mostrarMensaje("Ingresa un correo válido", "error"); return; }
  localStorage.setItem("usuario", nuevo);
  mostrarMensaje("Correo actualizado", "success");
  mostrarUsuarioHeader();
}
function cambiarPassword() {
  const oldPass = (document.getElementById("perfil-pass-old")||{}).value;
  const newPass = (document.getElementById("perfil-pass-new")||{}).value;
  const saved = localStorage.getItem("password") || "";
  if (!oldPass || !newPass) { mostrarMensaje("Completa ambos campos", "error"); return; }
  if (oldPass !== saved) { mostrarMensaje("Contraseña actual incorrecta", "error"); return; }
  localStorage.setItem("password", newPass);
  mostrarMensaje("Contraseña actualizada", "success");
  document.getElementById("perfil-pass-old").value="";
  document.getElementById("perfil-pass-new").value="";
}
function recuperarContrasena() {
  const correo = localStorage.getItem("usuario");
  if (!correo) { mostrarMensaje("No hay usuario registrado", "error"); return; }
  mostrarMensaje("Correo de recuperación enviado (simulado) a " + correo, "success");
}

/* -------------------------
   TARJETAS (perfil)
   ------------------------- */
let tarjetas = JSON.parse(localStorage.getItem("tarjetas")) || [];
function persistirTarjetas(){ localStorage.setItem("tarjetas", JSON.stringify(tarjetas)); }
function mostrarTarjetas() {
  const cont = document.getElementById("lista-tarjetas");
  if (!cont) return;
  tarjetas = JSON.parse(localStorage.getItem("tarjetas")) || [];
  cont.innerHTML = "";
  if (tarjetas.length === 0) { cont.innerHTML = "<p>No tienes tarjetas guardadas.</p>"; return; }
  tarjetas.forEach((t,i)=>{
    const div = document.createElement("div");
    div.className = "item-carrito";
    div.innerHTML = `<div style="flex:1"><strong>${t.numero}</strong><br>${t.nombre} — ${t.exp}</div>
                    <div><button class="btn-rojo" onclick="eliminarTarjeta(${i})">Eliminar</button></div>`;
    cont.appendChild(div);
  });
}
function validarTarjetaFormato(numero, exp, nombre) {
  const n = numero.replace(/\s+/g,'');
  if (!/^\d{16}$/.test(n)) return "El número de tarjeta debe tener 16 dígitos numéricos.";
  if (!/^\d{2}\/\d{2}$/.test(exp)) return "La fecha debe tener formato MM/AA";
  const [mm,yy] = exp.split("/").map(s=>parseInt(s,10));
  if (mm<1||mm>12) return "Mes inválido en fecha (MM).";
  const now = new Date();
  const year = now.getFullYear()%100;
  if (yy < year) return "La tarjeta está vencida.";
  if (!nombre || nombre.trim().length < 3) return "Nombre en tarjeta inválido.";
  return null;
}
function agregarTarjeta() {
  const num = (document.getElementById("tarjeta-num")||{}).value.trim();
  const nom = (document.getElementById("tarjeta-nombre")||{}).value.trim();
  const exp = (document.getElementById("tarjeta-exp")||{}).value.trim();
  const err = validarTarjetaFormato(num, exp, nom);
  if (err) { mostrarMensaje(err, "error"); return; }
  tarjetas.push({ numero: num, nombre: nom, exp: exp });
  persistirTarjetas();
  document.getElementById("tarjeta-num").value="";
  document.getElementById("tarjeta-nombre").value="";
  document.getElementById("tarjeta-exp").value="";
  mostrarTarjetas();
  mostrarMensaje("Tarjeta agregada", "success");
}
function eliminarTarjeta(i) {
  tarjetas.splice(i,1);
  persistirTarjetas();
  mostrarTarjetas();
  mostrarMensaje("Tarjeta eliminada", "success");
}

/* -------------------------
   HISTORIAL DE COMPRAS
   ------------------------- */
function guardarHistorial(order) {
  const arr = JSON.parse(localStorage.getItem("history")||"[]");
  arr.unshift(order);
  localStorage.setItem("history", JSON.stringify(arr));
}
function mostrarHistorial() {
  const cont = document.getElementById("historial-compra");
  if (!cont) return;
  const arr = JSON.parse(localStorage.getItem("history")||"[]");
  cont.innerHTML = "";
  if (arr.length === 0) { cont.innerHTML = "<p>No hay compras registradas.</p>"; return; }
  arr.forEach(o=>{
    const d = document.createElement("div");
    d.className = "hist-item";
    d.innerHTML = `<strong>Orden: ${o.id}</strong><br>${o.date}<br>Total: $${o.total}<br>Items: ${o.items.map(i=>i.nombre).join(", ")}`;
    cont.appendChild(d);
  });
}

/* -------------------------
   CARRITO
   ------------------------- */
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
function guardarCarrito() { localStorage.setItem("carrito", JSON.stringify(carrito)); }
function cargarCarrito() { carrito = JSON.parse(localStorage.getItem("carrito")||"[]"); }
function agregarCarrito(nombre, precio, imagen) {
  cargarCarrito();
  const existe = carrito.find(it=>it.nombre===nombre);
  if (existe) existe.cantidad++;
  else carrito.push({ nombre, precio, imagen, cantidad:1 });
  guardarCarrito();
  mostrarMensaje(`${nombre} agregado correctamente al carrito`, "success");
  if (window.location.pathname.includes("carrito.html")) mostrarCarrito();
}
function mostrarCarrito() {
  cargarCarrito();
  const cont = document.getElementById("lista-carrito");
  const totalTexto = document.getElementById("total");
  if (!cont) return;
  cont.innerHTML = "";
  let total = 0;
  if (carrito.length === 0) { cont.innerHTML = "<p>Tu carrito está vacío.</p>"; if (totalTexto) totalTexto.textContent=""; return; }
  carrito.forEach((item, idx)=>{
    total += item.precio * item.cantidad;
    const div = document.createElement("div");
    div.className = "item-carrito";
    div.innerHTML = `<img src="${item.imagen}" class="img-carrito" onerror="this.src='img/user-icon.png'">
      <div style="flex:1;">
        <h3>${item.nombre}</h3>
        <p>Precio: $${item.precio}</p>
        <div style="display:flex; gap:8px; align-items:center; margin-top:6px;">
          <button onclick="cambiarCantidad(${idx}, -1)">-</button>
          <span style="min-width:28px; text-align:center;">${item.cantidad}</span>
          <button onclick="cambiarCantidad(${idx}, 1)">+</button>
          <button style="margin-left:10px;" onclick="eliminarProducto(${idx})">Eliminar</button>
        </div>
      </div>`;
    cont.appendChild(div);
  });
  if (totalTexto) totalTexto.textContent = "Total: $" + total;
}
function cambiarCantidad(idx, delta) { cargarCarrito(); if (!carrito[idx]) return; carrito[idx].cantidad+=delta; if (carrito[idx].cantidad<1) carrito[idx].cantidad=1; guardarCarrito(); mostrarCarrito(); }
function eliminarProducto(idx){ cargarCarrito(); carrito.splice(idx,1); guardarCarrito(); mostrarCarrito(); mostrarMensaje("Producto eliminado","success"); }
function vaciarCarrito(){ carrito = []; guardarCarrito(); mostrarCarrito(); mostrarMensaje("Carrito vaciado","success"); }

/* -------------------------
   PAGO (flujo): pago.html -> webpay.html -> pago_exitoso.html
   ------------------------- */
function irAPago(){ cargarCarrito(); if (carrito.length===0){ mostrarMensaje("Tu carrito está vacío","error"); return; } window.location.href="pago.html"; }
function goToWebpay(){
  cargarCarrito(); if (carrito.length===0){ mostrarMensaje("Tu carrito está vacío","error"); return; }
  // guardamos resumen temporal
  localStorage.setItem("webpay_resumen", JSON.stringify(carrito));
  // guardamos tarjetas temporales actuales (fusionaremos)
  localStorage.setItem("webpay_temp_cards", JSON.stringify(tarjetas));
  window.location.href = "webpay.html";
}
/* Populate pago.html resumen & tarjetas */
function cargarPago() {
    if (!window.location.pathname.includes("pago.html")) return;

    cargarCarrito();

    const resumen = document.getElementById("resumen-compra");
    const pagoTotal = document.getElementById("pago-total");
    const contTarjetas = document.getElementById("pago-tarjetas");
    if (!resumen || !pagoTotal || !contTarjetas) return;

    resumen.innerHTML = "";
    contTarjetas.innerHTML = "";

    let total = 0;

    // 🟦 Mostrar productos igual que antes
    carrito.forEach(it => {
        const subtotal = it.precio * it.cantidad;
        total += subtotal;

        const d = document.createElement("div");
        d.className = "item-carrito";
        d.innerHTML = `
            <img src="${it.imagen}" class="img-carrito">
            <div style="flex:1;">
                <strong>${it.nombre}</strong><br>
                Cantidad: ${it.cantidad} — Subtotal: $${subtotal}
            </div>`;
        resumen.appendChild(d);
    });

    /* 🟩 ENVÍO GRATIS SI ES PRIMER PEDIDO */
    const historial = JSON.parse(localStorage.getItem("history") || "[]");
    let envio = 2990;

    if (historial.length === 0) {
        envio = 0; // primer pedido gratis
    }

    // insertar el envío como un ITEM visual igual al resto
    const envioItem = document.createElement("div");
envioItem.className = "item-carrito";
envioItem.innerHTML = `
    <img src="img/envio.png" class="img-carrito">
    <div style="flex:1;">
        <strong>Envío</strong><br>
        $${envio} ${envio === 0 ? "(primer pedido • envío gratis)" : ""}
    </div>`;
resumen.appendChild(envioItem);


    // sumar al total
    total += envio;

    pagoTotal.textContent = "$" + total;

    // 🟦 tarjetas guardadas
    const arr = JSON.parse(localStorage.getItem("tarjetas") || "[]");
    if (arr.length === 0) {
        contTarjetas.innerHTML = "<p>No tienes tarjetas guardadas.</p>";
    } else {
        arr.forEach((t, i) => {
            contTarjetas.innerHTML += `
                <div class="item-carrito">
                    <div style="flex:1;">
                        <strong>${t.numero}</strong> — ${t.nombre} (${t.exp})
                    </div>
                    <div><input type="radio" name="tarjeta" value="${i}"></div>
                </div>`;
        });
    }
}


/* Popula webpay.html con resumen y tarjetas */
function populateWebpay(){
  if (!window.location.pathname.includes("webpay.html")) return;
  const resumenDiv = document.getElementById("webpay-resumen");
  const tarjetasDiv = document.getElementById("webpay-tarjetas");
  resumenDiv.innerHTML=""; tarjetasDiv.innerHTML="";
  const resumen = JSON.parse(localStorage.getItem("webpay_resumen")||"[]");
  let total=0;
  resumen.forEach(it=>{
    const subtotal = it.precio * it.cantidad; total+=subtotal;
    const d = document.createElement("div"); d.className="item-carrito";
    d.innerHTML = `<img src="${it.imagen}" class="img-carrito" onerror="this.src='img/user-icon.png'">
      <div style="flex:1;"><strong>${it.nombre}</strong><br>Cantidad: ${it.cantidad} — Subtotal: $${subtotal}</div>`;
    resumenDiv.appendChild(d);
  });
  const pagoTotal = document.createElement("p"); pagoTotal.style.fontWeight="700"; pagoTotal.textContent="Total: $"+total;
  resumenDiv.appendChild(pagoTotal);

  // tarjetas (fusionadas: perfil + temporales)
  const arr = JSON.parse(localStorage.getItem("tarjetas")||"[]");
  if (arr.length===0) tarjetasDiv.innerHTML="<p>No tienes tarjetas guardadas. Agrega una rápida o ve a Perfil.</p>";
  else {
    arr.forEach((t,i)=>{
      const r = document.createElement("div"); r.className="item-carrito";
      r.innerHTML = `<div style="flex:1;"><strong>${t.numero}</strong> — ${t.nombre} (${t.exp})</div>
        <div><input type="radio" name="wp-tarjeta" value="${i}" ${i===0 ? 'checked':''}></div>`;
      tarjetasDiv.appendChild(r);
    });
  }
}

/* PROCESS PAYMENT */
function processPayment(){
  if (!window.location.pathname.includes("webpay.html")) return;
  const seleccionado = document.querySelector('input[name="wp-tarjeta"]:checked');
  if (!seleccionado) { mostrarMensajeCentro("Selecciona una tarjeta para pagar ❌"); return; }
  const proc = document.getElementById("wp-processing"); if (proc) proc.style.display="block";
  setTimeout(()=>{
    // pago aprobado simulado
    // borrar tarjetas temporales guardadas solo si marcadas como temporales
    // generate order
    const orderId = generateOrderId();
    // calcular total y guardar order en historial
    const resumen = JSON.parse(localStorage.getItem("webpay_resumen")||"[]");
    let total = 0; resumen.forEach(i=> total += i.precio * i.cantidad);
    const order = { id: orderId, date: new Date().toLocaleString(), total: total, items: resumen };
    guardarHistorial(order);
    // limpiar carrito y webpay_resumen
    carrito = []; guardarCarrito(); localStorage.removeItem("webpay_resumen");
    // eliminar tarjetas temporales (si alguna fue marcada temporal)
    // mantendremos en localStorage sólo tarjetas con flag saved:true
    // our stored tarjetas array contains only saved cards; temporary cards were not persisted unless user chose
    // redirect to success
    localStorage.setItem("last_order_id", orderId);
    window.location.href = "pago_exitoso.html";
  }, 1600);
}
function generateOrderId(){
  const now = Date.now().toString(36).toUpperCase();
  const rnd = Math.floor(Math.random()*9000)+1000;
  return `US-${now}-${rnd}`;
}

/* -------------------------
   TARJETA RÁPIDA (pago.html)
   ------------------------- */
function toggleFastBox(){
  const b = document.getElementById("fast-box");
  if (!b) return;
  b.style.display = (b.style.display === "none" || b.style.display==="") ? "block" : "none";
}
function toggleFastBoxWebpay(){
  const b = document.getElementById("wp-fast-box");
  if (!b) return;
  b.style.display = (b.style.display === "none" || b.style.display==="") ? "block" : "none";
}
function agregarTarjetaRapida(){
  const num = (document.getElementById("fast-num")||{}).value.trim();
  const nom = (document.getElementById("fast-nombre")||{}).value.trim();
  const exp = (document.getElementById("fast-exp")||{}).value.trim();
  const guardar = (document.getElementById("fast-guardar")||{}).checked;
  const err = validarTarjetaFormato(num,exp,nom);
  if (err) { mostrarMensaje(err,"error"); return; }
  const tarjeta = { numero: num, nombre: nom, exp: exp };
  if (guardar) {
    tarjetas.push(tarjeta); persistirTarjetas();
  } else {
    // if not saved, we do not persist; but we push to in-memory to show in selection temporarily
    tarjetas.unshift(tarjeta);
    // remove it later after payment (we will not persist it)
  }
  mostrarTarjetas(); cargarPago();
  mostrarMensaje("Tarjeta agregada correctamente", "success");
  // clear inputs
  document.getElementById("fast-num").value=""; document.getElementById("fast-nombre").value=""; document.getElementById("fast-exp").value=""; document.getElementById("fast-guardar").checked=false;
}
function agregarTarjetaRapidaWebpay(){
  const num = (document.getElementById("wp-fast-num")||{}).value.trim();
  const nom = (document.getElementById("wp-fast-nombre")||{}).value.trim();
  const exp = (document.getElementById("wp-fast-exp")||{}).value.trim();
  const guardar = (document.getElementById("wp-fast-guardar")||{}).checked;
  const err = validarTarjetaFormato(num,exp,nom);
  if (err) { mostrarMensaje(err,"error"); return; }
  const tarjeta = { numero: num, nombre: nom, exp: exp };
  if (guardar) { tarjetas.push(tarjeta); persistirTarjetas(); }
  else { tarjetas.unshift(tarjeta); }
  populateWebpay(); mostrarMensaje("Tarjeta agregada correctamente","success");
  document.getElementById("wp-fast-num").value=""; document.getElementById("wp-fast-nombre").value=""; document.getElementById("wp-fast-exp").value=""; document.getElementById("wp-fast-guardar").checked=false;
}

/* -------------------------
   INICIALIZACIÓN
   ------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  mostrarUsuarioHeader();
  cargarPerfil();
  mostrarTarjetas();
  mostrarCarrito();
  cargarPago();
  populateWebpay();
  const path = window.location.pathname;
  if (path.includes("pago_exitoso.html")) {
    const id = localStorage.getItem("last_order_id") || "N/A";
    const el = document.getElementById("exito-orden"); if (el) el.textContent = "Número de orden: " + id;
  }
});

// ---------------------------------------------------------
// BUSCADOR DE PRODUCTOS
// ---------------------------------------------------------
function filtrarProductos() {
    const texto = document.getElementById("buscador").value.toLowerCase();
    const productos = document.querySelectorAll(".producto");

    productos.forEach(producto => {
        const nombre = producto.getAttribute("data-nombre");

        if (nombre.includes(texto)) {
            producto.style.display = "block";
        } else {
            producto.style.display = "none";
        }
    });
}
// ---------------------------------------------------------
// Catálogo dinámico, buscador + filtros (estilo MercadoLibre)
// ---------------------------------------------------------

// LISTA DE PRODUCTOS (añade/edita productos aquí)
const PRODUCTS = [
  { id: 1, nombre: "Gorro Básico", precio: 10000, imagen: "img/gorro-basico.webp", categoria: "Gorros" },
  { id: 2, nombre: "Polera de Piqué", precio: 15000, imagen: "img/polera-pique.webp", categoria: "Poleras" },
  { id: 3, nombre: "Polerón Polar", precio: 20000, imagen: "img/poleron-polar.webp", categoria: "Polerones" },

  // nuevos que enviaste
  { id: 4, nombre: "Gorro Lana", precio: 8000, imagen: "img/gorro-lana.jpg", categoria: "Gorros" },
  { id: 5, nombre: "Polera Oversize Negra", precio: 10000, imagen: "img/polera-oversize.jpg", categoria: "Poleras" },
  { id: 6, nombre: "Polera Oversize Blanca", precio: 10000, imagen: "img/polera-oversize2.jpg", categoria: "Poleras" },
  { id: 7, nombre: "Pantalón Cargo", precio: 15000, imagen: "img/pantalon-cargo.jpg", categoria: "Pantalones" },
  { id: 8, nombre: "Jean Tiro Alto", precio: 20000, imagen: "img/jeans-basico.webp", categoria: "Pantalones" }
];

// estado actual de filtros
let currentCategory = "Todas";
let currentSearch = "";
let precioFilter = null; // {min, max}
let currentSort = "default";

// renderiza lista de categorías (extrae de PRODUCTS)
function renderCategorias() {
  const set = new Set(PRODUCTS.map(p => p.categoria));
  const categorias = ["Todas", ...Array.from(set).sort()];
  const ul = document.getElementById("lista-categorias");
  if (!ul) return;
  ul.innerHTML = "";
  categorias.forEach(cat => {
    const li = document.createElement("li");
    li.innerHTML = `<button class="cat-btn ${cat===currentCategory ? 'active' : ''}" onclick="seleccionarCategoria('${cat}')">${cat}</button>`;
    ul.appendChild(li);
  });
}

// renderiza productos según filtros actuales
function renderProductos() {
  const cont = document.getElementById("lista-productos");
  const count = document.getElementById("result-count");
  if (!cont) return;
  // filtrar
  let res = PRODUCTS.filter(p => {
    // categoria
    if (currentCategory !== "Todas" && p.categoria !== currentCategory) return false;
    // search
    const text = currentSearch.trim().toLowerCase();
    if (text) {
      const hay = (p.nombre + " " + p.categoria).toLowerCase();
      if (!hay.includes(text)) return false;
    }
    // precio
    if (precioFilter) {
      if (p.precio < precioFilter.min || p.precio > precioFilter.max) return false;
    }
    return true;
  });

  // ordenar
  if (currentSort === "price-asc") res.sort((a,b)=>a.precio-b.precio);
  if (currentSort === "price-desc") res.sort((a,b)=>b.precio-a.precio);
  if (currentSort === "name-asc") res.sort((a,b)=>a.nombre.localeCompare(b.nombre));

  // render
  cont.innerHTML = "";
  if (res.length === 0) {
    cont.innerHTML = "<p style='padding:10px'>No se encontraron productos.</p>";
  } else {
    res.forEach(p => {
      const div = document.createElement("div");
      div.className = "producto";
      div.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <p class="precio">$${p.precio.toLocaleString('es-CL')}</p>
        <div style="display:flex; gap:8px;">
          <button onclick="agregarCarrito('${p.nombre}', ${p.precio}, '${p.imagen}')">Agregar</button>
          <button onclick="verProducto(${p.id})" class="btn-volver">Ver</button>
        </div>
      `;
      cont.appendChild(div);
    });
  }

  if (count) count.textContent = `${res.length} producto(s)`;
}

// funciones UI
function seleccionarCategoria(cat) {
  currentCategory = cat;
  document.getElementById("buscador").value = "";
  currentSearch = "";
  renderCategorias();
  renderProductos();
}

function filtrarProductos() {
  const q = document.getElementById("buscador").value || "";
  currentSearch = q;
  renderProductos();
}

function aplicarFiltroPrecio(min,max) {
  precioFilter = { min, max };
  renderProductos();
}
function limpiarFiltroPrecio() {
  precioFilter = null;
  renderProductos();
}

function ordenarProductos() {
  const sel = document.getElementById("orden");
  if (!sel) return;
  currentSort = sel.value;
  renderProductos();
}

// (opcional) verProducto abre modal o página (ahora simple alert)
// =============================
// VER PRODUCTO (abre modal)
// =============================
function verProducto(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;

    // Rellenar modal
    document.getElementById("modal-img").src = p.imagen;
    document.getElementById("modal-nombre").textContent = p.nombre;
    document.getElementById("modal-precio").textContent = 
        "$" + p.precio.toLocaleString("es-CL");

    // Botón agregar
    document.getElementById("modal-agregar").onclick = () => {
        agregarCarrito(p.nombre, p.precio, p.imagen);
        cerrarModal();
    };

    // Mostrar modal
    document.getElementById("producto-modal").style.display = "flex";
}

// cerrar modal
function cerrarModal() {
    document.getElementById("producto-modal").style.display = "none";
}


// inicialización catálogo (llamar al cargar)
function initCatalogo() {
  renderCategorias();
  renderProductos();
  // si existe el select de orden, setear evento
  const orden = document.getElementById("orden");
  if (orden) orden.addEventListener("change", ordenarProductos);
}

// Ejecutar init si estamos en catalogo.html
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("catalogo.html") || window.location.pathname.endsWith("/")) {
    initCatalogo();
  }
});

function verProducto(id){
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;

    document.getElementById("m-img").src = p.imagen;
    document.getElementById("m-nombre").textContent = p.nombre;
    document.getElementById("m-precio").textContent = "$" + p.precio.toLocaleString("es-CL");

    document.getElementById("m-agregar").onclick = function(){
        agregarCarrito(p.nombre, p.precio, p.imagen);
        cerrarModal();
    };

    document.getElementById("producto-modal").style.display = "flex";
}

function cerrarModal(){
    document.getElementById("producto-modal").style.display = "none";
}
function aplicarFiltroPrecio(min, max) {
    precioFilter = { min, max };

    // marcar botón activo
    document.querySelectorAll(".filtros button").forEach(b => b.classList.remove("active-price"));
    event.target.classList.add("active-price");

    renderProductos();
}

function limpiarFiltroPrecio() {
    precioFilter = null;

    // quitar selecciones
    document.querySelectorAll(".filtros button").forEach(b => b.classList.remove("active-price"));

    renderProductos();
}

/* End of file */
