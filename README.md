# Bar Katmandu — Web + Reservas y Opiniones

Sitio web para **Bar Katmandu**, terraza y cocina nepalí en el barrio de Gràcia (Barcelona). El proyecto incluye la web pública, un sistema de **reservas de mesa** funcional y una sección de **opiniones de clientes** publicadas directamente desde la web, con una pequeña API en Node.js/Express detrás.

## Demo rápida

```bash
npm install
npm start
```

Abre `http://localhost:3000`.

## Características

- Web informativa: carta, galería, ubicación con mapa embebido, datos de contacto.
- **Reservas de mesa**: formulario que valida los datos en el cliente y en el servidor, y guarda cada solicitud con estado `pendiente / confirmada / cancelada`.
- **Opiniones de clientes**: los visitantes pueden dejar una valoración (1–5 estrellas) y un comentario, que se publica en la propia página junto a las demás opiniones.
- Diseño responsive (menú de hamburguesa en móvil, rejillas adaptables).
- Sin dependencias de frontend: HTML, CSS y JavaScript nativos (sin framework), fáciles de mantener.

## Estructura del proyecto

```
bar-katmandu-web/
├── public/                # Frontend (servido de forma estática)
│   ├── index.html
│   ├── css/
│   │   └── estilos.css
│   ├── js/
│   │   ├── menu.js        # menú móvil
│   │   ├── reservas.js    # formulario de reservas -> API
│   │   └── opiniones.js   # listado y envío de opiniones -> API
│   └── img/                # imágenes del local y los platos
├── server/                 # Backend
│   ├── index.js            # servidor Express
│   ├── db.js                # capa de acceso a datos (JSON)
│   └── routes/
│       ├── reservas.js
│       └── resenas.js
├── data/                    # "base de datos" en JSON
│   ├── reservas.json
│   └── resenas.json
├── package.json
└── .gitignore
```

## Stack técnico

| Capa      | Tecnología                          |
|-----------|--------------------------------------|
| Frontend  | HTML5, CSS3, JavaScript (Vanilla)    |
| Backend   | Node.js + Express                    |
| Datos     | Ficheros JSON (ver nota de escalado) |

No se ha usado ningún framework de frontend a propósito: el sitio es pequeño y esto mantiene el proyecto ligero, rápido y fácil de auditar.

## API

### Reservas

| Método | Ruta                | Descripción                                  |
|--------|----------------------|-----------------------------------------------|
| GET    | `/api/reservas`      | Lista todas las reservas (uso interno)        |
| POST   | `/api/reservas`      | Crea una solicitud de reserva                 |
| PATCH  | `/api/reservas/:id`  | Cambia el estado (`confirmada`/`cancelada`)   |

Cuerpo esperado en `POST`:

```json
{
  "fecha": "2026-09-10",
  "hora": "20:30",
  "personas": "4",
  "nombre": "Ana Pérez",
  "telefono": "600111222"
}
```

### Opiniones

| Método | Ruta            | Descripción                          |
|--------|------------------|----------------------------------------|
| GET    | `/api/resenas`  | Lista las opiniones publicadas         |
| POST   | `/api/resenas`  | Publica una nueva opinión              |

Cuerpo esperado en `POST`:

```json
{
  "nombre": "Marc",
  "valoracion": 5,
  "comentario": "Los momos son increíbles, volveremos."
}
```

Ambas rutas validan los datos en el servidor (no solo en el formulario), así que la API es segura de usar aunque alguien la llame directamente sin pasar por la web.

## Cómo funciona el guardado de datos

Por simplicidad y para no depender de un servicio externo, los datos se guardan en `data/reservas.json` y `data/resenas.json`. Es más que suficiente para el volumen de un solo restaurante y facilita revisar/editar los datos a mano si hace falta.

Si el proyecto creciera (varios locales, más tráfico, necesidad de backups automáticos), el único fichero que habría que tocar es `server/db.js`: se sustituiría por una conexión a SQLite o PostgreSQL sin cambiar las rutas de la API.

La gestión del estado de cada reserva (`pendiente` → `confirmada`/`cancelada`) se hace mediante la ruta `PATCH /api/reservas/:id`, y el modelo de opiniones ya incluye un campo `publicada` que permite decidir, por cada una, si se muestra en la web o no.

## Instalación en desarrollo

```bash
git clone <url-del-repositorio>
cd bar-katmandu-web
npm install
npm run dev   # con recarga automática (nodemon)
```

## Despliegue

Al ser una app Node.js estándar (Express sirviendo tanto la API como los archivos estáticos), funciona en cualquier proveedor que soporte Node: Render, Railway, Fly.io, un VPS propio, etc. Solo hace falta:

1. `npm install --production`
2. Definir la variable de entorno `PORT` si el proveedor lo requiere.
3. `npm start`

## Licencia

MIT
