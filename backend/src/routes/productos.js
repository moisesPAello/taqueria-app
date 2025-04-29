const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// Obtener todos los productos
router.get('/', (req, res) => {
    db.all('SELECT * FROM productos', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

module.exports = router;