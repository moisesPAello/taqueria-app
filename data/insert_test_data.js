const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta al archivo de la base de datos
const dbPath = path.join(__dirname, 'database.db');

// Crear una nueva instancia de la base de datos
const db = new sqlite3.Database(dbPath);

// Función para insertar datos de prueba
function insertTestData() {
    db.serialize(() => {
        // Insertar usuarios
        const usuarios = [
            ['Admin', 'admin@taqueria.com', 'admin123', 'admin'],
            ['Juan Pérez', 'juan@taqueria.com', 'mesero123', 'mesero'],
            ['María García', 'maria@taqueria.com', 'cocinero123', 'cocinero'],
            ['Carlos López', 'carlos@taqueria.com', 'cajero123', 'cajero']
        ];

        usuarios.forEach(usuario => {
            db.run(
                `INSERT INTO usuarios (nombre, email, password, rol)
                 VALUES (?, ?, ?, ?)`,
                usuario
            );
        });
        console.log('Usuarios insertados');

        // Insertar mesas
        const mesas = [
            [1, 4, 'libre'],
            [2, 6, 'libre'],
            [3, 2, 'libre'],
            [4, 8, 'libre'],
            [5, 4, 'libre']
        ];

        mesas.forEach(mesa => {
            db.run(
                `INSERT INTO mesas (numero, capacidad, estado)
                 VALUES (?, ?, ?)`,
                mesa
            );
        });
        console.log('Mesas insertadas');

        // Insertar productos
        const productos = [
            ['Taco al Pastor', 'Taco de carne al pastor con piña', 25.00, 'Tacos', 50],
            ['Taco de Suadero', 'Taco de suadero con cebolla y cilantro', 22.00, 'Tacos', 50],
            ['Taco de Bistec', 'Taco de bistec con cebolla y cilantro', 23.00, 'Tacos', 50],
            ['Coca Cola', 'Refresco de cola 600ml', 25.00, 'Bebidas', 100],
            ['Jarra de Agua', 'Jarra de agua de sabor 1L', 35.00, 'Bebidas', 100],
            ['Orden de Quesadillas', '3 quesadillas de maíz con queso', 45.00, 'Entradas', 30],
            ['Orden de Flautas', '4 flautas de pollo con crema', 55.00, 'Entradas', 30],
            ['Flan', 'Flan casero con caramelo', 30.00, 'Postres', 20],
            ['Pastel de Chocolate', 'Rebanada de pastel de chocolate', 35.00, 'Postres', 20]
        ];

        productos.forEach(producto => {
            db.run(
                `INSERT INTO productos (nombre, descripcion, precio, categoria, stock)
                 VALUES (?, ?, ?, ?, ?)`,
                producto
            );
        });
        console.log('Productos insertados');

        // Insertar órdenes
        const ordenes = [
            [1, 2, 'activa', 0],
            [2, 2, 'activa', 0],
            [3, 1, 'activa', 0]
        ];

        ordenes.forEach(orden => {
            db.run(
                `INSERT INTO ordenes (mesa_id, usuario_id, estado, total)
                 VALUES (?, ?, ?, ?)`,
                orden
            );
        });
        console.log('Órdenes insertadas');

        // Insertar detalles de orden
        const detalles = [
            [1, 1, 2, 25.00, 50.00],
            [1, 4, 1, 25.00, 25.00],
            [2, 2, 3, 22.00, 66.00],
            [2, 5, 1, 35.00, 35.00],
            [3, 3, 2, 23.00, 46.00],
            [3, 6, 1, 45.00, 45.00]
        ];

        detalles.forEach(detalle => {
            db.run(
                `INSERT INTO detalles_orden (orden_id, producto_id, cantidad, precio_unitario, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
                detalle
            );
        });
        console.log('Detalles de orden insertados');

        // Actualizar totales de órdenes
        db.run(`
            UPDATE ordenes
            SET total = (
                SELECT SUM(cantidad * precio_unitario)
                FROM detalles_orden
                WHERE orden_id = ordenes.id
            )
        `);
        console.log('Totales de órdenes actualizados');

        console.log('Datos de prueba insertados exitosamente');
        db.close();
    });
}

// Ejecutar la inserción de datos
insertTestData(); 