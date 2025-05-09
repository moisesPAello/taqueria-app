const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const initializeData = require('./seeds/init-data');

// Importar rutas
const mesasRoutes = require('./src/api/v1/mesas');
const productosRoutes = require('./src/api/v1/productos');
const ordenesRoutes = require('./src/api/v1/ordenes');
const authRoutes = require('./src/api/v1/auth');
const usuariosRoutes = require('./src/api/v1/usuarios');
const dashboardRoutes = require('./src/api/v1/dashboard_feature');

const app = express();
const PORT = 3000;

// Global error handler para promesas no manejadas
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Configuración de CORS
app.use(cors({
    origin: 'http://localhost:5173', // Frontend Vite default port
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para manejar errores de JSON parsing
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    next();
});

// Simulación básica de autenticación para desarrollo
app.use((req, res, next) => {
    req.user = { id: 1, rol: 'admin' }; // Usuario simulado para desarrollo
    next();
});

// Usar las rutas
app.use('/api/mesas', mesasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente' });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Initialize sample data after database is ready
setTimeout(() => {
    initializeData();
}, 1000);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});