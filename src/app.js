
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const orderRoutes = require('./routes/orders.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../liki-frontend/liki-frontend')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Rutas del frontend (SPA fallback)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../liki-frontend/liki-frontend/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../liki-frontend/liki-frontend/admin.html'));
});

app.get('/cliente', (req, res) => {
  res.sendFile(path.join(__dirname, '../liki-frontend/liki-frontend/cliente.html'));
});

app.get('/overview', (req, res) => {
  res.sendFile(path.join(__dirname, '../liki-frontend/liki-frontend/overview.html'));
});

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API escuchando en puerto ${PORT}`);
});
