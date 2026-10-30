// Contenidos de terceros (Google Maps y reseñas de Elfsight).
// No se cargan al entrar en la web: solo cuando el visitante pulsa el botón.
// Así la web no pone cookies de terceros sin que el visitante lo pida.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-cargar="mapa"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const caja = btn.closest('.mapa-real');
      const iframe = document.createElement('iframe');
      iframe.src = caja.dataset.mapa;
      iframe.title = "Mapa de Bar Katmandu en Carrer del Torrent de l'Olla, 148, Barcelona";
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      caja.classList.remove('bloqueado');
      caja.replaceChildren(iframe);
    });
  });

  document.querySelectorAll('[data-cargar="resenas"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const caja = btn.closest('.resenas-externas');
      const widget = caja.querySelector('[class^="elfsight-app-"]');
      if (widget) widget.hidden = false;
      btn.remove();
      if (!document.querySelector('script[src*="elfsightcdn.com/platform.js"]')) {
        const s = document.createElement('script');
        s.src = 'https://elfsightcdn.com/platform.js';
        s.async = true;
        document.body.appendChild(s);
      }
    });
  });
});
