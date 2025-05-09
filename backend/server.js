const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const initializeData = require('./seeds/init-data');

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Importar rutas
const mesasRoutes = require('./src/api/v1/mesas');
const productosRoutes = require('./src/api/v1/productos');
const ordenesRoutes = require('./src/api/v1/ordenes');
const authRoutes = require('./src/api/v1/auth');
const usuariosRoutes = require('./src/api/v1/usuarios');
const dashboardRoutes = require('./src/api/v1/dashboard_feature');

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });
    
    next();
});

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
}));

// Parsers with larger limits for potential file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
    });
});

// API routes
app.use('/api/mesas', mesasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        query: req.query,
        body: req.body,
        headers: req.headers
    });

    // Handle specific error types
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'No autorizado',
            message: 'Su sesión ha expirado o no tiene acceso. Por favor, inicie sesión nuevamente.'
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            message: err.message,
            details: err.errors
        });
    }

    // Generic error response
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        path: req.path,
        timestamp: new Date().toISOString(),
        requestId: req.id
    });
});

// 404 handler - must be last
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `La ruta ${req.url} no existe`,
        timestamp: new Date().toISOString()
    });
});

// Start server with error handling
const server = app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
    console.log('Ambiente:', process.env.NODE_ENV || 'development');
    console.log('CORS habilitado para:', ['http://localhost:5173', 'http://127.0.0.1:5173']);
});

server.on('error', (error) => {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
});