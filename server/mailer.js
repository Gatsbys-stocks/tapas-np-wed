// Envío de emails de notificación (nuevas reservas) usando la API HTTP de Brevo.
//
// Usamos HTTP y no SMTP a propósito: Render bloquea las conexiones salientes
// a los puertos SMTP (25/465/587) en su plan gratuito, así que nodemailer con
// Gmail nunca funcionará ahí. La API de Brevo va por HTTPS (puerto 443), que
// no está bloqueado.
//
// Configuración por variables de entorno (ver .env.example):
//   BREVO_API_KEY       -> API key de tu cuenta de Brevo (gratis)
//   BREVO_SENDER_EMAIL  -> email remitente, verificado en Brevo (Senders)
//   RESERVA_EMAIL_TO    -> email de la empresa que recibe el aviso
//
// Si no están configuradas, no se envía nada y solo se avisa por consola,
// para que la web nunca deje de aceptar reservas por un fallo de email.

const { BREVO_API_KEY, BREVO_SENDER_EMAIL, RESERVA_EMAIL_TO } = process.env;

const configurado = Boolean(BREVO_API_KEY && BREVO_SENDER_EMAIL && RESERVA_EMAIL_TO);

if (!configurado) {
  console.warn(
    '[mailer] Faltan variables de entorno de email (ver .env.example). ' +
      'Las reservas se guardarán, pero no se enviará ningún aviso por correo.'
  );
}

async function enviarEmailBrevo({ destinatario, asunto, html, texto, replyTo }) {
  const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { email: BREVO_SENDER_EMAIL, name: 'Bar Katmandu' },
      to: [{ email: destinatario }],
      subject: asunto,
      htmlContent: html,
      textContent: texto,
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
  });

  if (!respuesta.ok) {
    const cuerpo = await respuesta.text().catch(() => '');
    throw new Error(`Brevo respondió ${respuesta.status}: ${cuerpo}`);
  }
}

// Avisa al email de la empresa de que ha entrado una nueva solicitud de reserva.
async function enviarAvisoNuevaReserva(reserva) {
  if (!configurado) return;

  const html = `
    <h2>Nueva solicitud de reserva</h2>
    <p><strong>Fecha:</strong> ${reserva.fecha}</p>
    <p><strong>Hora:</strong> ${reserva.hora}</p>
    <p><strong>Personas:</strong> ${reserva.personas}</p>
    <p><strong>Nombre:</strong> ${reserva.nombre}</p>
    <p><strong>Teléfono:</strong> ${reserva.telefono}</p>
    <p><strong>Email del cliente:</strong> ${reserva.email}</p>
    ${reserva.comentarios ? `<p><strong>Comentarios:</strong> ${reserva.comentarios}</p>` : ''}
    <hr>
    <p>Puedes confirmar o cancelar esta reserva desde la caja de reservas.</p>
  `;
  const texto =
    `Fecha: ${reserva.fecha}\nHora: ${reserva.hora}\nPersonas: ${reserva.personas}\n` +
    `Nombre: ${reserva.nombre}\nTeléfono: ${reserva.telefono}\nEmail del cliente: ${reserva.email}` +
    (reserva.comentarios ? `\nComentarios: ${reserva.comentarios}` : '');

  try {
    await enviarEmailBrevo({
      destinatario: RESERVA_EMAIL_TO,
      asunto: `Nueva reserva: ${reserva.nombre} · ${reserva.fecha} ${reserva.hora}`,
      html,
      texto,
      replyTo: reserva.email,
    });
  } catch (error) {
    // No dejamos que un fallo de email tumbe la creación de la reserva.
    console.error('[mailer] No se pudo enviar el aviso de nueva reserva:', error.message);
  }
}

// Confirma al propio cliente que su solicitud de reserva se ha recibido.
async function enviarConfirmacionCliente(reserva) {
  if (!configurado || !reserva.email) return;

  const html = `
    <h2>¡Hemos recibido tu solicitud de reserva!</h2>
    <p>Hola ${reserva.nombre}, esto es lo que nos has pedido:</p>
    <p><strong>Fecha:</strong> ${reserva.fecha}</p>
    <p><strong>Hora:</strong> ${reserva.hora}</p>
    <p><strong>Personas:</strong> ${reserva.personas}</p>
    ${reserva.comentarios ? `<p><strong>Comentarios:</strong> ${reserva.comentarios}</p>` : ''}
    <hr>
    <p>Te confirmaremos por teléfono o WhatsApp en breve. Si necesitas cambiar algo, llámanos.</p>
  `;
  const texto =
    `Hola ${reserva.nombre}, hemos recibido tu solicitud de reserva para el ${reserva.fecha} ` +
    `a las ${reserva.hora} (${reserva.personas} personas). Te confirmaremos por teléfono o WhatsApp en breve.`;

  try {
    await enviarEmailBrevo({
      destinatario: reserva.email,
      asunto: `Hemos recibido tu reserva · ${reserva.fecha} ${reserva.hora}`,
      html,
      texto,
    });
  } catch (error) {
    console.error('[mailer] No se pudo enviar la confirmación al cliente:', error.message);
  }
}

module.exports = { enviarAvisoNuevaReserva, enviarConfirmacionCliente };
