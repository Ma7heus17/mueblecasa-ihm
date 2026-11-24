// MuebleCasa — Prototipo funcional de alta fidelidad (simulación académica sin backend ni cobro real)
const STORAGE_VENTAS = DATA.slug + '_ventas';
const STORAGE_SESION = DATA.slug + '_sesion_simulada';
const STORAGE_USUARIOS = DATA.slug + '_usuarios_simulados';
const STORAGE_ACC = DATA.slug + '_accesibilidad';

let registro = JSON.parse(localStorage.getItem(STORAGE_VENTAS) || '[]');
let sesionSimulada = JSON.parse(localStorage.getItem(STORAGE_SESION) || 'null');
let usuariosSimulados = JSON.parse(localStorage.getItem(STORAGE_USUARIOS) || '[]');
let configAcc = JSON.parse(localStorage.getItem(STORAGE_ACC) || '{"escala":100,"tema":"claro","iconosGrandes":false}');

let carrito = [];
let productoDetalleActual = DATA.productos[0];
let procesandoVenta = false;
let deferredPrompt = null;

// --- PANEL DE ACCESIBILIDAD ---
function aplicarAccesibilidad() {
  const escala = Math.min(150, Math.max(100, Number(configAcc.escala) || 100));
  configAcc.escala = escala;
  document.documentElement.style.fontSize = `${(16 * escala) / 100}px`;

  const lblEscala = document.getElementById('valorEscalaTexto');
  if (lblEscala) lblEscala.textContent = `${escala} %`;

  const btnMenos = document.getElementById('btnTextoMenos');
  const btnMas = document.getElementById('btnTextoMas');
  if (btnMenos) btnMenos.disabled = escala <= 100;
  if (btnMas) btnMas.disabled = escala >= 150;

  const esOscuro = configAcc.tema === 'oscuro';
  document.body.classList.toggle('mc-dark', esOscuro);

  const btnClaro = document.getElementById('btnModoClaro');
  const btnOscuro = document.getElementById('btnModoOscuro');
  if (btnClaro) btnClaro.classList.toggle('active', !esOscuro);
  if (btnOscuro) btnOscuro.classList.toggle('active', esOscuro);

  const iconosGrandes = Boolean(configAcc.iconosGrandes);
  document.body.classList.toggle('mc-large-icons', iconosGrandes);
  const btnIconos = document.getElementById('btnIconosGrandes');
  if (btnIconos) {
    btnIconos.classList.toggle('active', iconosGrandes);
    btnIconos.setAttribute('aria-pressed', String(iconosGrandes));
  }

  localStorage.setItem(STORAGE_ACC, JSON.stringify(configAcc));
}

function cambiarTamanoTexto(delta) {
  configAcc.escala = Math.min(150, Math.max(100, (configAcc.escala || 100) + delta));
  aplicarAccesibilidad();
}

function restablecerTamanoTexto() {
  configAcc.escala = 100;
  aplicarAccesibilidad();
}

function alternarIconosGrandes() {
  configAcc.iconosGrandes = !Boolean(configAcc.iconosGrandes);
  aplicarAccesibilidad();
}

function establecerTema(tema) {
  configAcc.tema = tema === 'oscuro' ? 'oscuro' : 'claro';
  aplicarAccesibilidad();
}

// --- ALERTAS E INDICADORES GLOBALES ---
function mostrarAlerta(mensaje, tipo = 'success') {
  const el = document.getElementById('alertaGlobal');
  el.className = `alert alert-${tipo} alert-dismissible fade show`;
  el.innerHTML = `${mensaje} <button type="button" class="btn-close" aria-label="Cerrar aviso" onclick="ocultarAlerta()"></button>`;
  el.classList.remove('d-none');
}

function ocultarAlerta() {
  const el = document.getElementById('alertaGlobal');
  if (el) el.classList.add('d-none');
}

function actualizarIndicadoresGlobales() {
  const totalUnidades = carrito.reduce((s, p) => s + p.cantidad, 0);
  const badgeCarrito = document.getElementById('badgeCarrito');
  const conteoCat = document.getElementById('conteoCatalogoCarrito');

  if (badgeCarrito) badgeCarrito.textContent = totalUnidades;
  if (conteoCat) conteoCat.textContent = totalUnidades;

  // Usuario visible solo en Inicio y Acceso
  const resSesion = document.getElementById('resumenInicioSesion');
  const resCarrito = document.getElementById('resumenInicioCarrito');
  const resVentas = document.getElementById('resumenInicioVentas');
  if (resSesion) {
    resSesion.textContent = sesionSimulada
      ? `Usuario activo: ${sesionSimulada.nombre} (${sesionSimulada.correo})`
      : 'Usuario activo: Invitado (simulado)';
  }
  if (resCarrito) resCarrito.textContent = `${totalUnidades} artículo(s) en pedido`;
  if (resVentas) resVentas.textContent = `${registro.length} operación(es) registrada(s)`;

  actualizarVistaAcceso();
}

function actualizarVistaAcceso() {
  const cardPerfil = document.getElementById('perfilActivoCard');
  const formsAcceso = document.getElementById('formulariosAcceso');
  if (!cardPerfil || !formsAcceso) return;

  if (sesionSimulada) {
    cardPerfil.classList.remove('d-none');
    formsAcceso.classList.add('d-none');
    document.getElementById('perfilNombre').textContent = sesionSimulada.nombre;
    document.getElementById('perfilCorreo').textContent = sesionSimulada.correo;
  } else {
    cardPerfil.classList.add('d-none');
    formsAcceso.classList.remove('d-none');
  }
}

function ver(id) {
  document.querySelectorAll('.vista').forEach(x => x.classList.remove('activa'));
  const s = document.getElementById(id);
  if (s) s.classList.add('activa');

  document.querySelectorAll('#navPrincipal .nav-link').forEach(link => {
    const vistaLink = link.getAttribute('data-vista');
    const esActiva = vistaLink === id || (id === 'detalle' && vistaLink === 'productos');
    link.classList.toggle('active', esActiva);
    if (esActiva) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  if (id === 'productos') dibujarCatalogo();
  if (id === 'detalle') dibujarDetalle();
  if (id === 'venta') dibujarCarrito();
  if (id === 'historial') dibujarHistorial();
  actualizarIndicadoresGlobales();
  location.hash = id;
}

// --- LOGIN Y REGISTRO CON VALIDACIÓN AL SALIR (BLUR / TAB) Y ENVÍO ---
function alternarRegistro() {
  const loginPanel = document.getElementById('login');
  const regPanel = document.getElementById('registro');
  loginPanel.hidden = !loginPanel.hidden;
  regPanel.hidden = !regPanel.hidden;
  ocultarAlerta();
}

function validarEmail(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());
}

function validarCampoIndividual(campo) {
  if (!campo) return true;
  const val = campo.value.trim();
  let valido = true;

  if (campo.id === 'correo' || campo.id === 'regCorreo') {
    valido = val.length > 0 && validarEmail(val);
  } else if (campo.id === 'clave' || campo.id === 'regClave') {
    valido = val.length >= 4;
  } else if (campo.id === 'regClave2') {
    const claveOrig = document.getElementById('regClave')?.value.trim() || '';
    valido = val.length >= 4 && val === claveOrig;
  } else if (campo.id === 'regNombre') {
    valido = val.length >= 2;
  }

  campo.classList.toggle('is-invalid', !valido);
  return valido;
}

function configurarValidacionEnSalida() {
  const campos = ['correo', 'clave', 'regNombre', 'regCorreo', 'regClave', 'regClave2'];
  campos.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => validarCampoIndividual(el));
    el.addEventListener('input', () => {
      if (el.classList.contains('is-invalid')) {
        validarCampoIndividual(el);
      }
    });
  });
}

function ingresar(event) {
  if (event) event.preventDefault();
  const correoInput = document.getElementById('correo');
  const claveInput = document.getElementById('clave');

  const correoOk = validarCampoIndividual(correoInput);
  const claveOk = validarCampoIndividual(claveInput);

  if (!correoOk || !claveOk) {
    mostrarAlerta('Revisa los campos marcados en rojo. Ejemplo de correo: <code>user@correo.com</code>.', 'danger');
    return;
  }

  const correo = correoInput.value.trim().toLowerCase();
  const clave = claveInput.value.trim();

  const usuarioRegistrado = usuariosSimulados.find(u => u.correo.toLowerCase() === correo);
  if (usuarioRegistrado && usuarioRegistrado.clave !== clave) {
    claveInput.classList.add('is-invalid');
    mostrarAlerta('La clave no coincide con la cuenta simulada registrada para ese correo.', 'danger');
    return;
  }

  const nombreFinal = usuarioRegistrado ? usuarioRegistrado.nombre : correo.split('@')[0];
  sesionSimulada = { nombre: nombreFinal, correo };
  localStorage.setItem(STORAGE_SESION, JSON.stringify(sesionSimulada));
  mostrarAlerta(`Bienvenido, <strong>${sesionSimulada.nombre}</strong>. Sesión simulada activa.`, 'success');
  actualizarIndicadoresGlobales();
}

function ingresarDemoRapido() {
  sesionSimulada = { nombre: 'Valeria Andrade', correo: 'user@correo.com' };
  localStorage.setItem(STORAGE_SESION, JSON.stringify(sesionSimulada));
  mostrarAlerta('Acceso rápido iniciado con el perfil de prueba <strong>Valeria Andrade</strong> (<code>user@correo.com</code>).', 'success');
  actualizarIndicadoresGlobales();
}

function guardarRegistro(event) {
  if (event) event.preventDefault();
  const nombreInput = document.getElementById('regNombre');
  const correoInput = document.getElementById('regCorreo');
  const claveInput = document.getElementById('regClave');
  const clave2Input = document.getElementById('regClave2');

  const nombreOk = validarCampoIndividual(nombreInput);
  const correoOk = validarCampoIndividual(correoInput);
  const claveOk = validarCampoIndividual(claveInput);
  const clave2Ok = validarCampoIndividual(clave2Input);

  if (!nombreOk || !correoOk || !claveOk || !clave2Ok) {
    mostrarAlerta('Completa los campos obligatorios marcados en rojo (ejemplo de correo: <code>user@correo.com</code>).', 'danger');
    return;
  }

  const nombre = nombreInput.value.trim();
  const correo = correoInput.value.trim().toLowerCase();
  const clave = claveInput.value.trim();

  const idx = usuariosSimulados.findIndex(u => u.correo.toLowerCase() === correo);
  const nuevoUsuario = { nombre, correo, clave };
  if (idx >= 0) {
    usuariosSimulados[idx] = nuevoUsuario;
  } else {
    usuariosSimulados.push(nuevoUsuario);
  }
  localStorage.setItem(STORAGE_USUARIOS, JSON.stringify(usuariosSimulados));

  sesionSimulada = { nombre, correo };
  localStorage.setItem(STORAGE_SESION, JSON.stringify(sesionSimulada));
  mostrarAlerta(`Registro simulado completado para <strong>${nombre}</strong>.`, 'success');
  actualizarIndicadoresGlobales();
}

function cerrarSesion() {
  sesionSimulada = null;
  localStorage.removeItem(STORAGE_SESION);
  mostrarAlerta('Has cerrado la sesión simulada.', 'info');
  actualizarIndicadoresGlobales();
}

// --- CATÁLOGO Y DETALLE ---
function inicializarFiltros() {
  const selMaterial = document.getElementById('filtroMaterial');
  const selAcabado = document.getElementById('filtroAcabado');
  if (!selMaterial || !selAcabado) return;

  const materiales = [...new Set(DATA.productos.map(p => p.material))];
  const acabados = [...new Set(DATA.productos.map(p => p.acabado))];

  materiales.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    selMaterial.appendChild(opt);
  });

  acabados.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    selAcabado.appendChild(opt);
  });
}

function limpiarFiltros() {
  document.getElementById('filtroBusqueda').value = '';
  document.getElementById('filtroMaterial').value = '';
  document.getElementById('filtroAcabado').value = '';
  dibujarCatalogo();
}

function dibujarCatalogo() {
  const texto = (document.getElementById('filtroBusqueda')?.value || '').toLowerCase().trim();
  const mat = document.getElementById('filtroMaterial')?.value || '';
  const acab = document.getElementById('filtroAcabado')?.value || '';

  const filtrados = DATA.productos.filter(p => {
    const coincideTexto = !texto || p.nombre.toLowerCase().includes(texto) || p.categoria.toLowerCase().includes(texto);
    const coincideMat = !mat || p.material === mat;
    const coincideAcab = !acab || p.acabado === acab;
    return coincideTexto && coincideMat && coincideAcab;
  });

  const infoCat = document.getElementById('resumenCatalogoInfo');
  if (infoCat) infoCat.textContent = `${filtrados.length} muebles · dimensiones y acabados verificables`;

  const sinRes = document.getElementById('estadoSinResultados');
  sinRes.classList.toggle('d-none', filtrados.length > 0);

  document.getElementById('lista').innerHTML = filtrados.map(p => {
    const enCarrito = carrito.find(item => item.id === p.id);
    const cantActual = enCarrito ? enCarrito.cantidad : 0;
    return `
      <div class="col-12 col-md-6 col-lg-4">
        <article class="card h-100 shadow-sm mc-card">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-start gap-3 mb-3">
              <div class="mc-thumb-box">${p.svg || ''}</div>
              <div class="flex-grow-1">
                <h3 class="h5 fw-bold mb-0">${p.nombre}</h3>
                <div class="small text-secondary mb-1">Ref. ${p.id} · ${p.categoria}</div>
                <span class="badge rounded-pill mc-pill-spec">${p.dimensiones}</span>
              </div>
            </div>

            <div class="spec-box mb-3">
              <div><strong>Material:</strong> ${p.material}</div>
              <div><strong>Acabado:</strong> ${p.acabado}</div>
            </div>

            <div class="mt-auto pt-2 border-top d-flex align-items-center justify-content-between gap-2">
              <span class="h4 fw-bold mb-0">$${p.precio.toFixed(2)}</span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="abrirDetalle('${p.id}')">Medidas</button>
                <button type="button" id="btnElegir-${p.id}" class="btn btn-sm mc-btn-choose px-3" onclick="agregar('${p.id}', this)">
                  ${cantActual > 0 ? `Elegir (${cantActual})` : 'Elegir'}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    `;
  }).join('');
}

function abrirDetalle(idProducto) {
  const prod = DATA.productos.find(p => p.id === idProducto);
  if (!prod) return;
  productoDetalleActual = prod;
  ver('detalle');
}

function dibujarDetalle() {
  const p = productoDetalleActual;
  if (!p) return;
  const enCarrito = carrito.find(item => item.id === p.id);
  const cantActual = enCarrito ? enCarrito.cantidad : 0;

  document.getElementById('contenedorDetalle').innerHTML = `
    <div class="card-body p-4">
      <div class="d-flex flex-wrap align-items-center gap-3 mb-4">
        <div class="mc-thumb-box" style="width:92px;height:92px;">${p.svg || ''}</div>
        <div class="flex-grow-1">
          <span class="badge mc-pill-spec mb-1">${p.categoria} · Código ${p.id}</span>
          <h2 class="h3 fw-bold mb-0">${p.nombre}</h2>
        </div>
        <div class="text-md-end">
          <span class="small text-secondary d-block">Precio ilustrativo</span>
          <span class="h3 fw-bold">$${p.precio.toFixed(2)}</span>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
          <div class="spec-box h-100">
            <div class="small text-secondary">Dimensiones (An × Prof × Al)</div>
            <div class="fw-bold mt-1">${p.dimensiones}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="spec-box h-100">
            <div class="small text-secondary">Material principal</div>
            <div class="fw-bold mt-1">${p.material}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="spec-box h-100">
            <div class="small text-secondary">Acabado superficial</div>
            <div class="fw-bold mt-1">${p.acabado}</div>
          </div>
        </div>
      </div>

      <div class="spec-box mb-4">
        <strong>Guía de espacio en el hogar:</strong> ${p.espacioRecomendado}
      </div>

      <div id="feedbackDetalle" class="alert alert-success py-2 px-3 d-none mb-3" role="status"></div>

      <div class="d-flex flex-wrap gap-2">
        <button type="button" id="btnDetalleAgregar" class="btn mc-btn-primary" onclick="agregar('${p.id}', this)">
          ${cantActual > 0 ? `Agregar al pedido (${cantActual} en carrito)` : 'Agregar al pedido'}
        </button>
        <button type="button" class="btn btn-outline-secondary" onclick="ver('venta')">Ir a venta</button>
        <button type="button" class="btn btn-outline-secondary" onclick="ver('productos')">Seguir explorando</button>
      </div>
    </div>
  `;
}

// --- CARRITO Y VENTA SIMULADA ---
function agregar(idProducto, btnEl = null) {
  const prod = DATA.productos.find(p => p.id === idProducto);
  if (!prod) return;

  const existente = carrito.find(item => item.id === prod.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...prod, cantidad: 1 });
  }

  const cantidadEnPedido = carrito.find(item => item.id === prod.id)?.cantidad || 1;
  actualizarIndicadoresGlobales();

  // Señal visual en el botón pulsado
  const botonObjetivo = btnEl || document.getElementById(`btnElegir-${prod.id}`);
  if (botonObjetivo) {
    const textoPrevio = botonObjetivo.textContent;
    botonObjetivo.classList.add('mc-btn-added');
    botonObjetivo.textContent = `✓ Agregado (${cantidadEnPedido})`;
    setTimeout(() => {
      botonObjetivo.classList.remove('mc-btn-added');
      botonObjetivo.textContent = botonObjetivo.id === 'btnDetalleAgregar'
        ? `Agregar al pedido (${cantidadEnPedido} en carrito)`
        : `Elegir (${cantidadEnPedido})`;
    }, 1200);
  }

  // Señal visual dentro de la vista Detalle si está abierta
  const fbDetalle = document.getElementById('feedbackDetalle');
  if (fbDetalle && document.getElementById('detalle')?.classList.contains('activa')) {
    fbDetalle.innerHTML = `<strong>✓ Agregado al pedido:</strong> ${prod.nombre} (${cantidadEnPedido} unidad(es) en carrito).`;
    fbDetalle.classList.remove('d-none');
  }

  mostrarAlerta(
    `<strong>✓ Agregado al carrito:</strong> ${prod.nombre} (${prod.dimensiones}) · Total en pedido: <strong>${carrito.reduce((s, x) => s + x.cantidad, 0)}</strong>. <button type="button" class="btn btn-sm btn-dark ms-2" onclick="ver('venta')">Ir a venta</button>`,
    'success'
  );
}

function cambiarCantidad(index, valorRaw) {
  const errBox = document.getElementById('errorVenta');
  const numero = Number(valorRaw);

  if (!Number.isInteger(numero) || numero < 1) {
    errBox.textContent = 'La cantidad debe ser un número entero mayor o igual a 1.';
    errBox.classList.remove('d-none');
    carrito[index].cantidad = 1;
    dibujarCarrito();
    return;
  }

  errBox.classList.add('d-none');
  carrito[index].cantidad = numero;
  dibujarCarrito();
  actualizarIndicadoresGlobales();
}

function quitarArticulo(index) {
  carrito.splice(index, 1);
  dibujarCarrito();
  actualizarIndicadoresGlobales();
}

function vaciarCarrito() {
  carrito = [];
  document.getElementById('errorVenta').classList.add('d-none');
  dibujarCarrito();
  actualizarIndicadoresGlobales();
}

function dibujarCarrito() {
  const vacia = document.getElementById('ventaVacia');
  const activa = document.getElementById('ventaActiva');

  if (carrito.length === 0) {
    vacia.classList.remove('d-none');
    activa.classList.add('d-none');
    return;
  }

  vacia.classList.add('d-none');
  activa.classList.remove('d-none');

  document.getElementById('carrito').innerHTML = carrito.map((p, i) => `
    <tr>
      <td>
        <div class="fw-bold">${p.nombre}</div>
        <div class="small text-secondary">${p.dimensiones} · ${p.material} · ${p.acabado}</div>
      </td>
      <td>$${p.precio.toFixed(2)}</td>
      <td>
        <div class="input-group input-group-sm" style="max-width: 135px;">
          <button type="button" class="btn btn-outline-secondary" aria-label="Disminuir cantidad" onclick="cambiarCantidad(${i}, ${p.cantidad - 1})">-</button>
          <input type="number" class="form-control text-center" min="1" step="1" aria-label="Cantidad de ${p.nombre}" value="${p.cantidad}" onchange="cambiarCantidad(${i}, this.value)">
          <button type="button" class="btn btn-outline-secondary" aria-label="Aumentar cantidad" onclick="cambiarCantidad(${i}, ${p.cantidad + 1})">+</button>
        </div>
      </td>
      <td class="fw-semibold">$${(p.precio * p.cantidad).toFixed(2)}</td>
      <td class="text-end">
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="quitarArticulo(${i})">Quitar</button>
      </td>
    </tr>
  `).join('');

  const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);
  document.getElementById('total').textContent = '$' + total.toFixed(2);
}

function vender() {
  const errBox = document.getElementById('errorVenta');
  const btn = document.getElementById('btnConfirmarVenta');

  if (procesandoVenta) return;

  if (carrito.length === 0) {
    errBox.textContent = 'No puedes confirmar una venta vacía. Agrega al menos un mueble.';
    errBox.classList.remove('d-none');
    return;
  }

  const cantidadesValidas = carrito.every(item => Number.isInteger(item.cantidad) && item.cantidad >= 1);
  if (!cantidadesValidas) {
    errBox.textContent = 'Todos los artículos deben tener una cantidad entera positiva.';
    errBox.classList.remove('d-none');
    return;
  }

  procesandoVenta = true;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Registrando...';
  }
  errBox.classList.add('d-none');

  const venta = {
    id: registro.length + 1,
    fecha: new Date().toLocaleString('es-EC'),
    articulos: carrito.map(x => ({
      nombre: x.nombre,
      cantidad: x.cantidad,
      precio: x.precio,
      dimensiones: x.dimensiones,
      material: x.material,
      acabado: x.acabado
    })),
    total: carrito.reduce((s, p) => s + p.precio * p.cantidad, 0)
  };

  registro.push(venta);
  localStorage.setItem(STORAGE_VENTAS, JSON.stringify(registro));
  carrito = [];

  setTimeout(() => {
    procesandoVenta = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Confirmar venta simulada';
    }
    mostrarAlerta(`Venta simulada #${venta.id} registrada correctamente por <strong>$${venta.total.toFixed(2)}</strong>.`, 'success');
    ver('historial');
  }, 250);
}

// --- HISTORIAL ---
function dibujarHistorial() {
  const vacio = document.getElementById('historialVacio');
  const cont = document.getElementById('historialContenedor');

  if (registro.length === 0) {
    vacio.classList.remove('d-none');
    cont.classList.add('d-none');
    return;
  }

  vacio.classList.add('d-none');
  cont.classList.remove('d-none');

  document.getElementById('historialTabla').innerHTML = registro.map((v, i) => {
    const detalleArticulos = v.articulos.map(a => {
      const cant = a.cantidad || 1;
      const esp = a.dimensiones ? ` (${a.dimensiones}, ${a.acabado || a.material || ''})` : '';
      return `<div><strong>${cant}×</strong> ${a.nombre}<span class="text-secondary small">${esp}</span></div>`;
    }).join('');

    return `
      <tr>
        <td>#${v.id || i + 1}</td>
        <td>${v.fecha}</td>
        <td>${detalleArticulos}</td>
        <td class="fw-bold">$${Number(v.total).toFixed(2)}</td>
      </tr>
    `;
  }).join('');
}

function limpiarHistorial() {
  registro = [];
  localStorage.removeItem(STORAGE_VENTAS);
  dibujarHistorial();
  actualizarIndicadoresGlobales();
  mostrarAlerta('Historial de pruebas limpiado correctamente.', 'info');
}

// --- SOPORTE PWA E INICIALIZACIÓN ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btnInstalar = document.getElementById('btnInstalarPWA');
  if (btnInstalar) {
    btnInstalar.classList.remove('d-none');
    btnInstalar.onclick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      btnInstalar.classList.add('d-none');
    };
  }
});

window.addEventListener('hashchange', () => {
  const h = location.hash.replace('#', '');
  if (h && document.getElementById(h)) {
    ver(h);
  }
});

configurarValidacionEnSalida();
aplicarAccesibilidad();
inicializarFiltros();
ver(location.hash.replace('#', '') || 'inicio');') || 'inicio');
