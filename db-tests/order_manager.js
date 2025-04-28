const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear conexión a la base de datos
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

// Función para crear una nueva orden
function createOrder(mesa_id, usuario_id, callback) {
  db.run(`
    INSERT INTO ordenes (mesa_id, usuario_id, estado, total)
    VALUES (?, ?, 'activa', 0)
  `, [mesa_id, usuario_id], function(err) {
    if (err) {
      callback(err, null);
    } else {
      const ordenId = this.lastID;
      callback(null, ordenId);
    }
  });
}

// Función para agregar un producto a una orden
function addProductToOrder(orden_id, producto_id, cantidad, callback) {
  // Primero obtener el precio del producto
  db.get('SELECT precio FROM productos WHERE id = ?', [producto_id], (err, producto) => {
    if (err) {
      callback(err);
      return;
    }

    if (!producto) {
      callback(new Error('Producto no encontrado'));
      return;
    }

    const precio_unitario = producto.precio;
    const subtotal = precio_unitario * cantidad;

    // Insertar el detalle de la orden
    db.run(`
      INSERT INTO detalles_orden (orden_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `, [orden_id, producto_id, cantidad, precio_unitario, subtotal], function(err) {
      if (err) {
        callback(err);
        return;
      }

      // Actualizar el total de la orden
      db.run(`
        UPDATE ordenes 
        SET total = (
          SELECT SUM(subtotal) 
          FROM detalles_orden 
          WHERE orden_id = ?
        )
        WHERE id = ?
      `, [orden_id, orden_id], (err) => {
        callback(err);
      });
    });
  });
}

// Función para obtener los detalles de una orden
function getOrderDetails(orden_id, callback) {
  db.all(`
    SELECT 
      o.id as orden_id,
      o.total,
      o.estado,
      m.numero as mesa_numero,
      u.nombre as mesero_nombre,
      p.nombre as producto,
      d.cantidad,
      d.precio_unitario,
      d.subtotal
    FROM ordenes o
    JOIN mesas m ON o.mesa_id = m.id
    JOIN usuarios u ON o.usuario_id = u.id
    JOIN detalles_orden d ON o.id = d.orden_id
    JOIN productos p ON d.producto_id = p.id
    WHERE o.id = ?
    ORDER BY p.nombre
  `, [orden_id], callback);
}

// Función para obtener todas las órdenes activas
function getActiveOrders(callback) {
  db.all(`
    SELECT 
      o.id,
      o.total,
      o.estado,
      m.numero as mesa_numero,
      u.nombre as mesero_nombre,
      COUNT(d.id) as total_productos
    FROM ordenes o
    JOIN mesas m ON o.mesa_id = m.id
    JOIN usuarios u ON o.usuario_id = u.id
    LEFT JOIN detalles_orden d ON o.id = d.orden_id
    WHERE o.estado = 'activa'
    GROUP BY o.id
  `, callback);
}

module.exports = {
  createOrder,
  addProductToOrder,
  getOrderDetails,
  getActiveOrders
}; 