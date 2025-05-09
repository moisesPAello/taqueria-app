const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const { User } = require('../../models/User');
const { validateUser } = require('../../validators/userValidator');

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'activo', 'ultimo_acceso']
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Create new user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { nombre, email, password, rol } = req.body;
    const newUser = await User.create({
      nombre,
      email,
      password,
      rol,
      activo: true
    });

    res.status(201).json({
      id: newUser.id,
      nombre: newUser.nombre,
      email: newUser.email,
      rol: newUser.rol,
      activo: newUser.activo
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = validateUser(req.body, true);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { nombre, email, password, rol } = req.body;
    const updateData = { nombre, email, rol };
    if (password) {
      updateData.password = password;
    }

    const [updated] = await User.update(updateData, {
      where: { id: req.params.id }
    });

    if (updated) {
      const updatedUser = await User.findByPk(req.params.id, {
        attributes: ['id', 'nombre', 'email', 'rol', 'activo']
      });
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Toggle user active status
router.put('/:id/toggle-active', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.activo = !user.activo;
    await user.save();

    res.json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      activo: user.activo
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
