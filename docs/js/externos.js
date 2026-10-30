// Cookies y contenidos de terceros (Google Maps y reseñas de Elfsight).
//
// Al abrir la web sale un aviso de cookies con «Aceptar todo» y «Rechazar».
// - Si se acepta, el mapa y las reseñas se cargan solos y la elección se
//   recuerda 12 meses en este navegador.
// - Si se rechaza, no se carga nada de terceros; cada bloque tiene su botón
//   por si el visitante quiere verlo igualmente.
// - El enlace «Configurar cookies» del pie vuelve a mostrar el aviso.
(function () {
  const CLAVE = 'katmandu_cookies';
  const DURACION_MS = 365 * 24 * 60 * 60 * 1000;

  function leerEleccion() {
    try {
      const d = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (!d || !d.fecha || Date.now() - d.fecha > DURACION_MS) return null;
      return d.valor; // 'todas' o 'ninguna'
    } catch (e) { return null; }
  }
  function guardarEleccion(valor) {
    try { localStorage.setItem(CLAVE, JSON.stringify({ valor, fecha: Date.now() })); } catch (e) { /* sin almacenamiento */ }
  }

  function cargarMapa() {
    document.querySelectorAll('.mapa-real.bloqueado').forEach((caja) => {
      const iframe = document.createElement('iframe');
      iframe.src = caja.dataset.mapa;
      iframe.title = "Mapa de Bar Katmandu en Carrer del Torrent de l'Olla, 148, Barcelona";
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      caja.classList.remove('bloqueado');
      caja.replaceChildren(iframe);
    });
  }

  function cargarResenas() {
    document.querySelectorAll('.resenas-externas').forEach((caja) => {
      const widget = caja.querySelector('[class^="elfsight-app-"]');
      if (widget) widget.hidden = false;
      caja.querySelectorAll('[data-cargar="resenas"], .aviso-externo').forEach((el) => el.remove());
    });
    if (document.querySelector('.resenas-externas') && !document.querySelector('script[src*="elfsightcdn.com/platform.js"]')) {
      const s = document.createElement('script');
      s.src = 'https://elfsightcdn.com/platform.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }

  function cargarTodo() { cargarMapa(); cargarResenas(); }

  function cerrarAviso() {
    const a = document.getElementById('aviso-cookies');
    if (a) a.remove();
  }

  function mostrarAviso() {
    if (document.getElementById('aviso-cookies')) return;
    const aviso = document.createElement('div');
    aviso.id = 'aviso-cookies';
    aviso.setAttribute('role', 'dialog');
    aviso.setAttribute('aria-live', 'polite');
    aviso.setAttribute('aria-label', 'Aviso de cookies');
    aviso.innerHTML = `
      <div class="aviso-cookies-texto">
        <b>Usamos cookies</b>
        <p>Esta web muestra el mapa de Google Maps y las reseñas de Google a través de servicios externos que usan cookies.
        Puedes aceptarlas o rechazarlas; si las rechazas, la web funciona igual.
        <a href="cookies.html">Más información</a>.</p>
      </div>
      <div class="aviso-cookies-botones">
        <button type="button" class="btn btn-secundario" data-cookies="ninguna">Rechazar</button>
        <button type="button" class="btn btn-primario" data-cookies="todas">Aceptar todo</button>
      </div>`;
    aviso.querySelectorAll('[data-cookies]').forEach((b) => b.addEventListener('click', () => {
      const valor = b.dataset.cookies;
      guardarEleccion(valor);
      cerrarAviso();
      if (valor === 'todas') cargarTodo();
    }));
    document.body.appendChild(aviso);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Botones de cada bloque: consentimiento solo para ese contenido
    document.querySelectorAll('[data-cargar="mapa"]').forEach((b) => b.addEventListener('click', cargarMapa));
    document.querySelectorAll('[data-cargar="resenas"]').forEach((b) => b.addEventListener('click', cargarResenas));
    // Enlace «Configurar cookies»
    document.querySelectorAll('[data-configurar-cookies]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      mostrarAviso();
    }));

    const eleccion = leerEleccion();
    if (eleccion === 'todas') cargarTodo();
    else if (eleccion === null) mostrarAviso();
  });
})();
