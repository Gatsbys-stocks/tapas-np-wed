// Menú de navegación móvil (hamburguesa)
document.addEventListener('DOMContentLoaded', () => {
  const btnMenu = document.getElementById('btn-menu-movil');
  const nav = document.getElementById('nav-principal');

  if (!btnMenu || !nav) return;

  btnMenu.addEventListener('click', () => {
    const abierto = nav.classList.toggle('abierto');
    btnMenu.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    btnMenu.textContent = abierto ? '✕' : '☰';
  });

  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('abierto');
    btnMenu.setAttribute('aria-expanded', 'false');
    btnMenu.textContent = '☰';
  }));
});
