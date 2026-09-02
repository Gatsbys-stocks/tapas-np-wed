// Panel "Caja de reservas": botón para abrir + listado de reservas con
// filtros y acciones de confirmar/cancelar. Pensado para usarse en el
// ordenador/tablet junto al TPV del local.
document.addEventListener('DOMContentLoaded', () => {
  const btnAbrir = document.getElementById('btn-abrir-caja');
  const contenedor = document.getElementById('contenedor-caja');
  const lista = document.getElementById('lista-reservas');
  const estado = document.getElementById('estado-caja');
  const botonesFiltro = document.querySelectorAll('.filtros button');

  let reservas = [];
  let filtroActual = 'pendiente';
  let abierta = false;

  function mostrarEstado(mensaje) {
    estado.textContent = mensaje || '';
  }

  function formatearFecha(fecha) {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  function render() {
    const filtradas =
      filtroActual === 'todas' ? reservas : reservas.filter(r => r.estado === filtroActual);

    if (filtradas.length === 0) {
      lista.innerHTML = '<p class="vacio">No hay reservas en esta categoría.</p>';
      return;
    }

    // Más recientes primero.
    const ordenadas = [...filtradas].sort((a, b) => new Date(b.creadaEn) - new Date(a.creadaEn));

    lista.innerHTML = ordenadas
      .map(
        r => `
      <div class="tarjeta-reserva-item" data-id="${r.id}">
        <div class="fila-titulo">
          <h3>${r.nombre} · ${r.personas} pers.</h3>
          <span class="etiqueta-estado ${r.estado}">${r.estado}</span>
        </div>
        <div class="detalle">
          ${formatearFecha(r.fecha)} a las ${r.hora}<br>
          Tel: ${r.telefono} · Email: ${r.email || '—'}
          ${r.comentarios ? `<br>Comentarios: ${r.comentarios}` : ''}
        </div>
        ${
          r.estado === 'pendiente'
            ? `<div class="acciones">
                <button class="btn-confirmar" data-accion="confirmada">Confirmar</button>
                <button class="btn-cancelar" data-accion="cancelada">Cancelar</button>
              </div>`
            : ''
        }
      </div>`
      )
      .join('');
  }

  async function cargarReservas() {
    mostrarEstado('Cargando reservas…');
    try {
      const respuesta = await fetch(`${API_BASE}/api/reservas`);
      if (!respuesta.ok) throw new Error('Respuesta no válida del servidor');
      reservas = await respuesta.json();
      mostrarEstado('');
      render();
    } catch (error) {
      console.error(error);
      mostrarEstado('No se han podido cargar las reservas.');
    }
  }

  async function cambiarEstado(id, nuevoEstado) {
    try {
      const respuesta = await fetch(`${API_BASE}/api/reservas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!respuesta.ok) throw new Error('No se pudo actualizar la reserva');
      await cargarReservas();
    } catch (error) {
      console.error(error);
      mostrarEstado('No se ha podido actualizar esa reserva.');
    }
  }

  btnAbrir.addEventListener('click', () => {
    abierta = !abierta;
    contenedor.classList.toggle('abierta', abierta);
    btnAbrir.textContent = abierta ? 'Cerrar caja de reservas' : 'Abrir caja de reservas';
    if (abierta) cargarReservas();
  });

  botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
      botonesFiltro.forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');
      filtroActual = boton.dataset.filtro;
      render();
    });
  });

  lista.addEventListener('click', evento => {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;
    const tarjeta = evento.target.closest('.tarjeta-reserva-item');
    cambiarEstado(tarjeta.dataset.id, boton.dataset.accion);
  });
});
