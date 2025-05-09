const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const { Order, Mesa, Product, User } = require('../../models');
const { sequelize } = require('../../config/database');

// Get all orders with filtering
// Get all orders with filtering
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { search, estado, fechaDesde, fechaHasta } = req.query;
    const where = {};
    const { Op } = require('sequelize');

    if (estado) where.estado = estado;
    if (fechaDesde) where.createdAt = { [Op.gte]: new Date(fechaDesde) };
    if (fechaHasta) where.createdAt = { [Op.lte]: new Date(fechaHasta) };
    if (search) {
      where[Op.or] = [
        { id: { [Op.like]: `%${search}%` } },
        { '$mesa.numero$': { [Op.like]: `%${search}%` } },
        { '$mesero.nombre$': { [Op.like]: `%${search}%` } }
      ];
    }

    console.log('Query params:', { search, estado, fechaDesde, fechaHasta });
    console.log('Where clause:', where);    const orders = await Order.findAll({
      where,
      include: [
        {
          model: Mesa,
          as: 'mesa',
          attributes: ['id', 'numero']
        },
        {
          model: User,
          as: 'mesero',
          attributes: ['id', 'nombre'],
          required: false
        },
        {
          model: User,
          as: 'mesero',
          attributes: ['id', 'nombre']
        },
        {
          model: Product,
          as: 'productos',
          through: {
            attributes: ['cantidad', 'notas', 'precio']
          }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Split orders into active and historical
    const activas = orders.filter(order => 
      ['pendiente', 'en_proceso', 'lista'].includes(order.estado)
    );
    const historial = orders.filter(order => 
      ['entregada', 'cancelada'].includes(order.estado)
    );

    res.json({ activas, historial });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Get order details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: Mesa,
          as: 'mesa'
        },
        {
          model: User,
          as: 'mesero',
          attributes: ['id', 'nombre']
        },
        {
          model: Product,
          as: 'productos',
          through: {
            attributes: ['cantidad', 'notas', 'precio']
          }
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Process payment
router.post('/:id/pagar', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { metodo_pago, pagos_divididos, notas } = req.body;
    const order = await Order.findByPk(req.params.id, { transaction: t });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    if (order.estado === 'pagada' || order.estado === 'cancelada') {
      await t.rollback();
      return res.status(400).json({ message: 'La orden ya está pagada o cancelada' });
    }

    // Update order with payment information
    await order.update({
      estado: 'pagada',
      fecha_cierre: new Date(),
      metodo_pago: pagos_divididos ? undefined : metodo_pago,
      pagos_divididos,
      notas: notas || order.notas
    }, { transaction: t });

    await t.commit();
    res.json(order);
  } catch (error) {
    await t.rollback();
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error al procesar el pago' });
  }
});

// Cancel order
router.post('/:id/cancelar', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { notas } = req.body;
    const order = await Order.findByPk(req.params.id, { transaction: t });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    if (order.estado === 'cancelada' || order.estado === 'pagada') {
      await t.rollback();
      return res.status(400).json({ message: 'La orden ya está cancelada o pagada' });
    }

    // Return products to inventory if applicable
    if (order.productos && order.productos.length > 0) {
      for (const producto of order.productos) {
        await producto.increment('stock', { 
          by: producto.OrderProduct.cantidad,
          transaction: t
        });
      }
    }

    await order.update({
      estado: 'cancelada',
      fecha_cierre: new Date(),
      notas: notas ? `${order.notas ? order.notas + '\n' : ''}Cancelación: ${notas}` : order.notas
    }, { transaction: t });

    await t.commit();
    res.json(order);
  } catch (error) {
    await t.rollback();
    console.error('Error canceling order:', error);
    res.status(500).json({ message: 'Error al cancelar la orden' });
  }
});

module.exports = router;
