// Capa de datos muy sencilla basada en ficheros JSON.
// Suficiente para el volumen de un solo restaurante; si el proyecto crece,
// esto se puede sustituir por SQLite/PostgreSQL sin tocar las rutas (ver README).

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function rutaArchivo(nombre) {
  return path.join(DATA_DIR, `${nombre}.json`);
}

function leer(nombre) {
  const ruta = rutaArchivo(nombre);
  if (!fs.existsSync(ruta)) return [];
  const contenido = fs.readFileSync(ruta, 'utf-8').trim();
  if (!contenido) return [];
  try {
    return JSON.parse(contenido);
  } catch (error) {
    console.error(`No se pudo leer ${ruta}:`, error.message);
    return [];
  }
}

function escribir(nombre, datos) {
  const ruta = rutaArchivo(nombre);
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), 'utf-8');
}

function agregar(nombre, registro) {
  const datos = leer(nombre);
  datos.push(registro);
  escribir(nombre, datos);
  return registro;
}

module.exports = { leer, escribir, agregar };
