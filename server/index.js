const express = require('express');
const path = require('path');

const reservasRouter = require('./routes/reservas');
const resenasRouter = require('./routes/resenas');

const app = express();
const PUERTO = process.env.PORT || 3000;
const CARPETA_PUBLICA = path.join(__dirname, '..', 'public');

app.use(express.json());

// API
app.use('/api/reservas', reservasRouter);
app.use('/api/resenas', resenasRouter);

// Sitio estático (frontend)
app.use(express.static(CARPETA_PUBLICA));

// Cualquier otra ruta no-API devuelve el index (útil si se añaden más páginas)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(CARPETA_PUBLICA, 'index.html'));
});

app.listen(PUERTO, () => {
  console.log(`Bar Katmandu escuchando en http://localhost:${PUERTO}`);
});
