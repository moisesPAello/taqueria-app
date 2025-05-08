const express = require('express');
const router = express.Router();
const db = require('../../../../config/database');

// Helper function to convert snake_case to camelCase
const toCamelCase = (str) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

const transformKeys = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(transformKeys);
    }
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            toCamelCase(key),
            transformKeys(value)
        ])
    );
};

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        db.serialize(() => {
            const stats = {};
            let completed = 0;
            const total = 5; // Number of async operations

            // 1. Get today's orders count and revenue
            db.get(`
                SELECT 
                    COUNT(*) as total_ordenes,
                    SUM(CASE WHEN estado = 'activa' THEN 1 ELSE 0 END) as ordenes_activas,
                    SUM(CASE WHEN estado = 'cerrada' THEN 1 ELSE 0 END) as ordenes_cerradas,
                    SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as ordenes_canceladas,
                    COALESCE(SUM(CASE WHEN estado = 'cerrada' THEN total ELSE 0 END), 0) as ventas_hoy
                FROM ordenes 
                WHERE DATE(fecha_creacion) = DATE('now', 'localtime')
            `, [], (err, orderStats) => {
                if (err) {
                    console.error('Error getting order stats:', err);
                    return res.status(500).json({ error: err.message });
                }
                Object.assign(stats, orderStats);
                completed++;
                if (completed === total) sendResponse();
            });

            // 2. Get table status counts
            db.get(`
                SELECT 
                    SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
                    SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as ocupadas,
                    SUM(CASE WHEN estado = 'en_servicio' THEN 1 ELSE 0 END) as en_servicio,
                    SUM(CASE WHEN estado = 'mantenimiento' THEN 1 ELSE 0 END) as mantenimiento
                FROM mesas
            `, [], (err, tableStats) => {
                if (err) {
                    console.error('Error getting table stats:', err);
                    return res.status(500).json({ error: err.message });
                }
                stats.mesasStatus = tableStats;
                completed++;
                if (completed === total) sendResponse();
            });

            // 3. Get top 5 best-selling products
            db.all(`
                SELECT 
                    p.nombre,
                    SUM(d.cantidad) as cantidad,
                    SUM(d.cantidad * d.precio_unitario) as total
                FROM detalles_orden d
                JOIN productos p ON d.producto_id = p.id
                JOIN ordenes o ON d.orden_id = o.id
                WHERE o.estado = 'cerrada'
                AND DATE(o.fecha_creacion) = DATE('now', 'localtime')
                GROUP BY p.id
                ORDER BY cantidad DESC
                LIMIT 5
            `, [], (err, products) => {
                if (err) {
                    console.error('Error getting top products:', err);
                    return res.status(500).json({ error: err.message });
                }
                stats.productosPopulares = products;
                completed++;
                if (completed === total) sendResponse();
            });

            // 4. Get last 7 days revenue
            db.all(`
                SELECT 
                    DATE(fecha_creacion) as fecha,
                    COALESCE(SUM(CASE WHEN estado = 'cerrada' THEN total ELSE 0 END), 0) as total
                FROM ordenes
                WHERE fecha_creacion >= DATE('now', '-6 days')
                GROUP BY DATE(fecha_creacion)
                ORDER BY fecha
            `, [], (err, revenue) => {
                if (err) {
                    console.error('Error getting revenue history:', err);
                    return res.status(500).json({ error: err.message });
                }
                stats.ventasUltimos7Dias = revenue;
                completed++;
                if (completed === total) sendResponse();
            });

            // 5. Get active orders
            db.all(`
                SELECT 
                    o.id,
                    m.numero as mesa,
                    u.nombre as mesero,
                    o.total,
                    COUNT(d.id) as productos,
                    o.fecha_creacion as hora
                FROM ordenes o
                JOIN mesas m ON o.mesa_id = m.id
                JOIN usuarios u ON o.usuario_id = u.id
                LEFT JOIN detalles_orden d ON o.id = d.orden_id
                WHERE o.estado = 'activa'
                GROUP BY o.id
                ORDER BY o.fecha_creacion DESC
            `, [], (err, orders) => {
                if (err) {
                    console.error('Error getting active orders:', err);
                    return res.status(500).json({ error: err.message });
                }
                stats.ordenesActivas = orders.map(order => ({
                    ...order,
                    hora: new Date(order.hora).toISOString()
                }));
                completed++;
                if (completed === total) sendResponse();
            });

            function sendResponse() {
                // Transform all keys to camelCase before sending
                res.json(transformKeys(stats));
            }
        });
    } catch (err) {
        console.error('Error in dashboard stats:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;