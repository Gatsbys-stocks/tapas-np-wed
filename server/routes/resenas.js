const express = require('express');
const { randomUUID } = require('crypto');
const db = require('../db');

const router = express.Router();

function validarResena(body) {
  const errores = [];
  const { nombre, valoracion, comentario } = body;

  if (!nombre || nombre.trim().length < 2) errores.push('El nombre es obligatorio.');
  if (!comentario || comentario.trim().length < 3) errores.push('El comentario es obligatorio.');
  if (!Number.isInteger(valoracion) || valoracion < 1 || valoracion > 5) {
    errores.push('La valoración debe ser un número entre 1 y 5.');
  }

  return errores;
}

// GET /api/resenas -> lista pública de opiniones publicadas
router.get('/', (req, res) => {
  const resenas = db.leer('resenas').filter(r => r.publicada !== false);
  res.json(resenas);
});

// POST /api/resenas -> crea una nueva opinión
router.post('/', (req, res) => {
  const cuerpo = req.body || {};
  cuerpo.valoracion = Number(cuerpo.valoracion);

  const errores = validarResena(cuerpo);
  if (errores.length > 0) {
    return res.status(400).json({ error: errores.join(' ') });
  }

  const resena = {
    id: randomUUID(),
    nombre: cuerpo.nombre.trim().slice(0, 60),
    valoracion: cuerpo.valoracion,
    comentario: cuerpo.comentario.trim().slice(0, 500),
    fecha: new Date().toISOString(),
    publicada: true, // cambiar a false aquí si en el futuro se quiere moderar antes de publicar
  };

  db.agregar('resenas', resena);
  res.status(201).json(resena);
});

module.exports = router;
