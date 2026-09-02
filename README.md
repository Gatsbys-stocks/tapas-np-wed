# Bar Katmandu — Web, Reservas y Opiniones

Proyecto full-stack para **Bar Katmandu**, terraza y cocina nepalí en el barrio de Gràcia (Barcelona): web pública, sistema de reservas de mesa y sección de opiniones de clientes, con backend propio en Node.js/Express.

## Resumen del proyecto

El bar ya tenía una web de una sola página, pensada solo como escaparate (carta, fotos, ubicación, teléfono). El encargo era convertirla en un sitio con dos funcionalidades reales que antes no existían:

1. **Reservas de mesa** gestionadas desde la propia web, en lugar de depender solo del teléfono.
2. **Opiniones de clientes** publicadas en la página, sin depender únicamente de Google Maps.

Para eso separé el proyecto en frontend y backend, y construí una API propia que valida, guarda y sirve tanto las reservas como las opiniones.

## Qué incluye

- **Frontend**: HTML, CSS y JavaScript separados en sus propios archivos (antes todo estaba en un único `index.html`).
- **Backend**: servidor Node.js/Express con su propia API REST.
- **Reservas**: formulario con validación en el cliente y en el servidor. Cada solicitud se guarda con un estado (`pendiente`, `confirmada`, `cancelada`) que se puede actualizar vía la API.
- **Opiniones**: los visitantes valoran de 1 a 5 estrellas y dejan un comentario; se guarda en el servidor y se muestra en la web junto a las demás opiniones, sin recargar la página.
- **Diseño responsive**: menú de hamburguesa en móvil, rejillas que se adaptan a distintos tamaños de pantalla (heredado y mantenido del diseño original).

## Estructura del proyecto

```
bar-katmandu-web/
├── public/                # Frontend
│   ├── index.html
│   ├── css/
│   │   └── estilos.css
│   ├── js/
│   │   ├── menu.js        # menú de navegación móvil
│   │   ├── reservas.js    # formulario de reservas -> API
│   │   └── opiniones.js   # listado y envío de opiniones -> API
│   └── img/                # imágenes del local y los platos
├── server/                 # Backend
│   ├── index.js            # servidor Express
│   ├── db.js                # acceso a datos
│   └── routes/
│       ├── reservas.js
│       └── resenas.js
├── data/                    # almacenamiento de reservas y opiniones
│   ├── reservas.json
│   └── resenas.json
├── docs/                    # copia estática del frontend para GitHub Pages
├── package.json
└── .gitignore
```

`docs/` es una copia de `public/` pensada solo para publicar la parte visual en GitHub Pages (que no puede ejecutar el backend de Node). Para que las reservas y opiniones funcionen de verdad, el backend (`server/`) se despliega aparte, en un servicio que sí ejecute Node.

## Stack técnico

| Capa      | Tecnología                          |
|-----------|--------------------------------------|
| Frontend  | HTML5, CSS3, JavaScript (sin frameworks) |
| Backend   | Node.js + Express                    |
| Datos     | Ficheros JSON                        |

Decidí no usar ningún framework de frontend porque el sitio es pequeño: mantiene el proyecto ligero y fácil de auditar de arriba a abajo. Para los datos usé ficheros JSON en lugar de una base de datos externa, suficiente para el volumen de un solo local y sin dependencias que instalar aparte de Express.

## La API

### Reservas

| Método | Ruta                | Qué hace                                     |
|--------|----------------------|-----------------------------------------------|
| GET    | `/api/reservas`      | Lista todas las reservas                      |
| POST   | `/api/reservas`      | Crea una solicitud de reserva                 |
| PATCH  | `/api/reservas/:id`  | Cambia el estado a `confirmada` o `cancelada` |

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

| Método | Ruta            | Qué hace                          |
|--------|------------------|-------------------------------------|
| GET    | `/api/resenas`  | Lista las opiniones publicadas      |
| POST   | `/api/resenas`  | Publica una nueva opinión           |

```json
{
  "nombre": "Marc",
  "valoracion": 5,
  "comentario": "Los momos son increíbles, volveremos."
}
```

Ambas rutas validan los datos en el servidor, no solo en el formulario del navegador, para que la API sea segura de usar aunque alguien la llame directamente.

## Decisiones de diseño

- **Separación frontend/backend**: el HTML original mezclaba estructura, estilos y lógica en un solo archivo. Lo dividí en `public/` (estático) y `server/` (API), un patrón estándar que facilita mantener y escalar cada parte por separado.
- **Estado de las reservas**: en vez de solo "recibir" una reserva, cada una queda registrada con un estado que se puede cambiar (`PATCH /api/reservas/:id`), pensando en que en algún momento alguien del bar las revise y confirme.
- **Opiniones con campo `publicada`**: cada opinión guarda un campo booleano que permite decidir si se muestra en la web o no, aunque de momento todas se publican automáticamente.
- **Sin base de datos externa**: usar JSON en disco evita depender de un servicio externo para un proyecto de este tamaño, sin cerrar la puerta a migrar a SQLite/PostgreSQL más adelante sin tocar las rutas de la API.

## Licencia

MIT
