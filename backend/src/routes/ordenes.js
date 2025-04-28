const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// Obtener órdenes activas
router.get('/', (req, res) => {
    db.all('SELECT * FROM ordenes WHERE estado = "activa"', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Crear nueva orden
router.post('/', (req, res) => {
    const { mesa_id, productos } = req.body;
    
    db.run(
        'INSERT INTO ordenes (mesa_id, estado) VALUES (?, "activa")',
        [mesa_id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                message: 'Orden creada',
                orden_id: this.lastID 
            });
        }
    );
});

module.exports = router;