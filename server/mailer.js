// Envío de emails de notificación (nuevas reservas).
//
// Configuración por variables de entorno (ver .env.example):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS -> credenciales del correo
//   RESERVA_EMAIL_TO                            -> email de la empresa que recibe el aviso
//
// Si no están configuradas, no se envía nada y solo se avisa por consola,
// para que la web nunca deje de aceptar reservas por un fallo de email.

const nodemailer = require('nodemailer');

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RESERVA_EMAIL_TO } = process.env;

const configurado = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && RESERVA_EMAIL_TO);

let transportador = null;

if (configurado) {
  transportador = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // true solo si se usa el puerto 465
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
} else {
  console.warn(
    '[mailer] Faltan variables de entorno de email (ver .env.example). ' +
      'Las reservas se guardarán, pero no se enviará ningún aviso por correo.'
  );
}

function formatearReserva(reserva) {
  const partes = [
    `Fecha: ${reserva.fecha}`,
    `Hora: ${reserva.hora}`,
    `Personas: ${reserva.personas}`,
    `Nombre: ${reserva.nombre}`,
    `Teléfono: ${reserva.telefono}`,
    `Email del cliente: ${reserva.email}`,
  ];
  if (reserva.comentarios) partes.push(`Comentarios: ${reserva.comentarios}`);
  return partes.join('\n');
}

// Avisa al email de la empresa de que ha entrado una nueva solicitud de reserva.
async function enviarAvisoNuevaReserva(reserva) {
  if (!configurado) return;

  const texto = formatearReserva(reserva);
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

  try {
    await transportador.sendMail({
      from: `"Reservas web" <${SMTP_USER}>`,
      to: RESERVA_EMAIL_TO,
      replyTo: reserva.email,
      subject: `Nueva reserva: ${reserva.nombre} · ${reserva.fecha} ${reserva.hora}`,
      text: texto,
      html,
    });
  } catch (error) {
    // No dejamos que un fallo de email tumbe la creación de la reserva.
    console.error('[mailer] No se pudo enviar el aviso de nueva reserva:', error.message);
  }
}

module.exports = { enviarAvisoNuevaReserva };
