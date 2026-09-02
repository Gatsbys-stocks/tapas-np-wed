// Sistema de reservas: envía la solicitud al backend (POST /api/reservas)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-reserva');
  const estado = document.getElementById('estado-reserva');
  const btn = document.getElementById('btn-enviar-reserva');
  const campoFecha = document.getElementById('r-fecha');

  if (!form) return;

  // No permitir reservar en fechas pasadas
  if (campoFecha) {
    const hoy = new Date().toISOString().split('T')[0];
    campoFecha.setAttribute('min', hoy);
  }

  function mostrarEstado(mensaje, tipo) {
    estado.textContent = mensaje;
    estado.className = 'estado-reserva ' + tipo;
  }

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const datos = {
      fecha: form.fecha.value,
      hora: form.hora.value,
      personas: form.personas.value,
      nombre: form.nombre.value.trim(),
      telefono: form.telefono.value.trim(),
    };

    if (!datos.fecha || !datos.hora || !datos.personas || !datos.nombre || !datos.telefono) {
      mostrarEstado('Por favor, rellena todos los campos.', 'error');
      return;
    }

    btn.disabled = true;
    mostrarEstado('Enviando tu solicitud…', '');

    try {
      const respuesta = await fetch(`${API_BASE}/api/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.error || 'No se pudo enviar la reserva.');
      }

      mostrarEstado('¡Solicitud recibida! Te confirmaremos por teléfono en breve.', 'ok');
      form.reset();
    } catch (error) {
      console.error(error);
      mostrarEstado('Hubo un problema al enviar tu reserva. Llámanos al 675 19 25 09 mientras tanto.', 'error');
    } finally {
      btn.disabled = false;
    }
  });
});
