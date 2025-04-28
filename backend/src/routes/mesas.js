const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// Obtener todas las mesas
router.get('/', (req, res) => {
    db.all('SELECT * FROM mesas', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Actualizar estado de mesa
router.put('/:id/estado', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    
    db.run(
        'UPDATE mesas SET estado = ? WHERE id = ?',
        [estado, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Estado de mesa actualizado' });
        }
    );
});

module.exports = router;