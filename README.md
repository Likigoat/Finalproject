
# Liki Distribuciones – Backend Starter (Express + MySQL + JWT)

API base con autenticación JWT, roles (admin/cliente), CRUD de productos y órdenes.

## Requisitos
- Node.js 18+
- MySQL 8 (local o vía Docker)

## Configuración rápida
```bash
cp .env.example .env
npm install
npm run dev
```

## Scripts
- `npm run dev`  – desarrollo con nodemon
- `npm start`    – producción simple

## Endpoints principales
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/products`
- `POST /api/products` (admin)
- `PUT  /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `POST /api/orders` (cliente autenticado)

## MySQL – Esquema
Ver `schema.sql`.

## Docker (opcional)
`docker compose up -d`

## Licencia
MIT
