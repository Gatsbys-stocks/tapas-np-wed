const express = require('express');
const { randomUUID } = require('crypto');
const db = require('../db');
const { enviarAvisoNuevaReserva } = require('../mailer');

const router = express.Router();

const TELEFONO_REGEX = /^[0-9+\s]{9,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarReserva(body) {
  const errores = [];
  const { fecha, hora, personas, nombre, telefono, email } = body;

  if (!fecha) errores.push('La fecha es obligatoria.');
  if (!hora) errores.push('La hora es obligatoria.');
  if (!personas) errores.push('El número de personas es obligatorio.');
  if (!nombre || nombre.trim().length < 2) errores.push('El nombre es obligatorio.');
  if (!telefono || !TELEFONO_REGEX.test(telefono.trim())) {
    errores.push('El teléfono no parece válido.');
  }
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errores.push('El email no parece válido.');
  }

  // No permitir reservas con fecha pasada
  if (fecha) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaReserva = new Date(fecha);
    if (fechaReserva < hoy) errores.push('La fecha no puede ser anterior a hoy.');
  }

  return errores;
}

// GET /api/reservas -> lista todas las reservas (uso interno/administración)
router.get('/', (req, res) => {
  const reservas = db.leer('reservas');
  res.json(reservas);
});

// POST /api/reservas -> crea una nueva solicitud de reserva
router.post('/', (req, res) => {
  const errores = validarReserva(req.body || {});
  if (errores.length > 0) {
    return res.status(400).json({ error: errores.join(' ') });
  }

  const { fecha, hora, personas, nombre, telefono, email, comentarios } = req.body;

  const reserva = {
    id: randomUUID(),
    fecha,
    hora,
    personas,
    nombre: nombre.trim(),
    telefono: telefono.trim(),
    email: email.trim(),
    comentarios: (comentarios || '').trim().slice(0, 500),
    estado: 'pendiente', // pendiente | confirmada | cancelada
    creadaEn: new Date().toISOString(),
  };

  db.agregar('reservas', reserva);
  res.status(201).json(reserva);

  // Aviso por email a la empresa; no bloquea la respuesta al cliente.
  enviarAvisoNuevaReserva(reserva);
});

// PATCH /api/reservas/:id -> cambia el estado de una reserva (confirmar/cancelar)
router.patch('/:id', (req, res) => {
  const { estado } = req.body || {};
  if (!['pendiente', 'confirmada', 'cancelada'].includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido.' });
  }

  const reservas = db.leer('reservas');
  const indice = reservas.findIndex(r => r.id === req.params.id);
  if (indice === -1) {
    return res.status(404).json({ error: 'Reserva no encontrada.' });
  }

  reservas[indice].estado = estado;
  db.escribir('reservas', reservas);
  res.json(reservas[indice]);
});

module.exports = router;
