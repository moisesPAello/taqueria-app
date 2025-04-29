process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

const express = require('express');
const cors = require('cors');
const db = require('./config/database');

// Importar rutas
const mesasRoutes = require('./src/routes/mesas');
const productosRoutes = require('./src/routes/productos');
const ordenesRoutes = require('./src/routes/ordenes');
const authRoutes = require('./src/routes/auth');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Usar las rutas
app.use('/api/mesas', mesasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});