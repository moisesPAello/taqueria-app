const express = require('express');
const router = express.Router();

router.use('/mesas', require('./mesas'));
router.use('/ordenes', require('./ordenes'));
router.use('/productos', require('./productos'));
router.use('/usuarios', require('./usuarios'));
router.use('/auth', require('./auth'));
router.use('/dashboard', require('./dashboard'));

module.exports = router;