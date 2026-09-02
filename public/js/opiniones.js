// Sistema de opiniones de clientes: lista (GET /api/resenas) y envío (POST /api/resenas)
document.addEventListener('DOMContentLoaded', () => {
  const lista = document.getElementById('lista-opiniones');
  const form = document.getElementById('form-opinion');
  const estado = document.getElementById('estado-opinion');
  const btn = document.getElementById('btn-enviar-opinion');
  const selector = document.getElementById('selector-estrellas');
  const inputValoracion = document.getElementById('op-valoracion');

  // --- Selector de estrellas ---
  if (selector) {
    const estrellas = Array.from(selector.querySelectorAll('.estrella'));

    function pintarEstrellas(valor) {
      estrellas.forEach(estrella => {
        const activa = Number(estrella.dataset.valor) <= valor;
        estrella.classList.toggle('activa', activa);
        estrella.setAttribute('aria-checked', activa ? 'true' : 'false');
      });
    }

    pintarEstrellas(Number(inputValoracion.value));

    estrellas.forEach(estrella => {
      estrella.addEventListener('click', () => {
        const valor = Number(estrella.dataset.valor);
        inputValoracion.value = valor;
        pintarEstrellas(valor);
      });
    });
  }

  // --- Cargar opiniones existentes ---
  function formatearFecha(iso) {
    try {
      return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  }

  function crearTarjetaOpinion(opinion) {
    const div = document.createElement('div');
    div.className = 'tarjeta-opinion';
    const estrellasTexto = '★'.repeat(opinion.valoracion) + '☆'.repeat(5 - opinion.valoracion);
    div.innerHTML = `
      <div class="cabecera-opinion">
        <span class="nombre-opinion"></span>
        <span class="fecha-opinion"></span>
      </div>
      <div class="estrellas-opinion">${estrellasTexto}</div>
      <p class="texto-opinion"></p>
    `;
    div.querySelector('.nombre-opinion').textContent = opinion.nombre;
    div.querySelector('.fecha-opinion').textContent = formatearFecha(opinion.fecha);
    div.querySelector('.texto-opinion').textContent = opinion.comentario;
    return div;
  }

  async function cargarOpiniones() {
    try {
      const respuesta = await fetch('/api/resenas');
      if (!respuesta.ok) throw new Error('Error al cargar opiniones');
      const opiniones = await respuesta.json();

      lista.innerHTML = '';

      if (opiniones.length === 0) {
        lista.innerHTML = '<p class="opiniones-vacio">Aún no hay opiniones. ¡Sé el primero en dejar la tuya!</p>';
        return;
      }

      opiniones
        .slice()
        .reverse()
        .forEach(opinion => lista.appendChild(crearTarjetaOpinion(opinion)));
    } catch (error) {
      console.error(error);
      lista.innerHTML = '<p class="opiniones-error">No se han podido cargar las opiniones ahora mismo.</p>';
    }
  }

  cargarOpiniones();

  // --- Enviar nueva opinión ---
  if (!form) return;

  function mostrarEstado(mensaje, tipo) {
    estado.textContent = mensaje;
    estado.className = 'estado-opinion ' + tipo;
  }

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const datos = {
      nombre: form.nombre.value.trim(),
      valoracion: Number(form.valoracion.value),
      comentario: form.comentario.value.trim(),
    };

    if (!datos.nombre || !datos.comentario) {
      mostrarEstado('Por favor, escribe tu nombre y tu comentario.', 'error');
      return;
    }

    btn.disabled = true;
    mostrarEstado('Enviando tu opinión…', '');

    try {
      const respuesta = await fetch('/api/resenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.error || 'No se pudo publicar la opinión.');
      }

      mostrarEstado('¡Gracias por tu opinión!', 'ok');
      form.reset();
      document.getElementById('op-valoracion').value = 5;
      selector.querySelectorAll('.estrella').forEach(estrella => {
        const activa = Number(estrella.dataset.valor) <= 5;
        estrella.classList.toggle('activa', activa);
        estrella.setAttribute('aria-checked', activa ? 'true' : 'false');
      });
      cargarOpiniones();
    } catch (error) {
      console.error(error);
      mostrarEstado('Hubo un problema al enviar tu opinión. Inténtalo de nuevo.', 'error');
    } finally {
      btn.disabled = false;
    }
  });
});
