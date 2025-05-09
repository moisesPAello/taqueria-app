const db = require('./database');

function initializeData() {
    // Sample users data with more diverse roles and states
    const users = [
        { nombre: 'Administrador Principal', usuario: 'admin@taqueria.com', contrasena: 'admin123', rol: 'admin', estado: 'activo' },
        { nombre: 'Juan Mesero', usuario: 'juan@taqueria.com', contrasena: 'juan123', rol: 'mesero', estado: 'activo' },
        { nombre: 'Ana Mesera', usuario: 'ana@taqueria.com', contrasena: 'ana123', rol: 'mesero', estado: 'activo' },
        { nombre: 'Pedro Cocinero', usuario: 'pedro@taqueria.com', contrasena: 'pedro123', rol: 'cocinero', estado: 'activo' },
        { nombre: 'María Administradora', usuario: 'maria@taqueria.com', contrasena: 'maria123', rol: 'admin', estado: 'activo' },
        { nombre: 'Carlos Mesero', usuario: 'carlos@taqueria.com', contrasena: 'carlos123', rol: 'mesero', estado: 'inactivo' },
        { nombre: 'Laura Cajera', usuario: 'laura@taqueria.com', contrasena: 'laura123', rol: 'cajero', estado: 'activo' },
        { nombre: 'Roberto Cocinero', usuario: 'roberto@taqueria.com', contrasena: 'roberto123', rol: 'cocinero', estado: 'activo' }
    ];

    // Sample products data with expanded categories, prices, and descriptions
    const products = [
        // Tacos
        { nombre: 'Taco de Asada', precio: 25.00, descripcion: 'Taco tradicional de carne asada premium', categoria: 'tacos', disponible: 1, stock: 100, popularidad: 5 },
        { nombre: 'Taco de Pastor', precio: 20.00, descripcion: 'Taco de carne al pastor marinada con piña', categoria: 'tacos', disponible: 1, stock: 100, popularidad: 5 },
        { nombre: 'Taco de Pollo', precio: 22.00, descripcion: 'Taco de pollo asado con especias', categoria: 'tacos', disponible: 1, stock: 80, popularidad: 3 },
        { nombre: 'Taco de Pescado', precio: 30.00, descripcion: 'Taco de pescado empanizado con ensalada de col', categoria: 'tacos', disponible: 1, stock: 50, popularidad: 4 },
        { nombre: 'Taco de Camarón', precio: 35.00, descripcion: 'Taco de camarón fresco con guacamole', categoria: 'tacos', disponible: 1, stock: 40, popularidad: 4 },
        
        // Quesadillas
        { nombre: 'Quesadilla Sencilla', precio: 35.00, descripcion: 'Tortilla con queso fundido monterrey', categoria: 'quesadillas', disponible: 1, stock: 60, popularidad: 3 },
        { nombre: 'Quesadilla con Asada', precio: 45.00, descripcion: 'Quesadilla con carne asada y queso', categoria: 'quesadillas', disponible: 1, stock: 60, popularidad: 4 },
        { nombre: 'Quesadilla con Pollo', precio: 40.00, descripcion: 'Quesadilla con pollo desmenuzado', categoria: 'quesadillas', disponible: 1, stock: 60, popularidad: 3 },
        
        // Burritos
        { nombre: 'Burrito de Asada', precio: 45.00, descripcion: 'Burrito grande de carne asada con guacamole', categoria: 'burritos', disponible: 1, stock: 40, popularidad: 5 },
        { nombre: 'Burrito de Pastor', precio: 40.00, descripcion: 'Burrito de pastor con queso fundido', categoria: 'burritos', disponible: 1, stock: 40, popularidad: 4 },
        { nombre: 'Burrito Vegetariano', precio: 35.00, descripcion: 'Burrito con frijoles, aguacate y verduras', categoria: 'burritos', disponible: 1, stock: 30, popularidad: 2 },
        
        // Bebidas
        { nombre: 'Coca Cola', precio: 20.00, descripcion: 'Refresco 600ml', categoria: 'bebidas', disponible: 1, stock: 100, popularidad: 5 },
        { nombre: 'Agua de Horchata', precio: 15.00, descripcion: 'Agua fresca de arroz con canela', categoria: 'bebidas', disponible: 1, stock: 50, popularidad: 4 },
        { nombre: 'Agua de Jamaica', precio: 15.00, descripcion: 'Agua fresca de flor de jamaica', categoria: 'bebidas', disponible: 1, stock: 50, popularidad: 4 },
        { nombre: 'Cerveza Nacional', precio: 30.00, descripcion: 'Cerveza local 355ml', categoria: 'bebidas', disponible: 1, stock: 100, popularidad: 4 },
        { nombre: 'Cerveza Importada', precio: 40.00, descripcion: 'Cerveza importada 355ml', categoria: 'bebidas', disponible: 1, stock: 50, popularidad: 3 },
        
        // Complementos
        { nombre: 'Guacamole', precio: 15.00, descripcion: 'Porción extra de guacamole', categoria: 'complementos', disponible: 1, stock: 40, popularidad: 4 },
        { nombre: 'Frijoles Refritos', precio: 12.00, descripcion: 'Porción de frijoles refritos', categoria: 'complementos', disponible: 1, stock: 60, popularidad: 3 },
        { nombre: 'Papas Fritas', precio: 25.00, descripcion: 'Orden de papas a la francesa', categoria: 'complementos', disponible: 1, stock: 50, popularidad: 4 }
    ];

    // Sample tables data with diverse configurations
    const tables = [
        // Interior
        { numero: 1, capacidad: 4, estado: 'disponible', ubicacion: 'interior', tipo: 'normal', reservable: true },
        { numero: 2, capacidad: 6, estado: 'disponible', ubicacion: 'interior', tipo: 'familiar', reservable: true },
        { numero: 3, capacidad: 2, estado: 'disponible', ubicacion: 'interior', tipo: 'pareja', reservable: true },
        { numero: 4, capacidad: 8, estado: 'disponible', ubicacion: 'interior', tipo: 'grupo', reservable: true },
        
        // Barra
        { numero: 5, capacidad: 2, estado: 'disponible', ubicacion: 'barra', tipo: 'barra', reservable: false },
        { numero: 6, capacidad: 2, estado: 'disponible', ubicacion: 'barra', tipo: 'barra', reservable: false },
        { numero: 7, capacidad: 2, estado: 'disponible', ubicacion: 'barra', tipo: 'barra', reservable: false },
        
        // Terraza
        { numero: 8, capacidad: 4, estado: 'disponible', ubicacion: 'terraza', tipo: 'normal', reservable: true },
        { numero: 9, capacidad: 6, estado: 'disponible', ubicacion: 'terraza', tipo: 'familiar', reservable: true },
        { numero: 10, capacidad: 8, estado: 'disponible', ubicacion: 'terraza', tipo: 'grupo', reservable: true },
        
        // VIP
        { numero: 11, capacidad: 10, estado: 'disponible', ubicacion: 'interior', tipo: 'vip', reservable: true },
        { numero: 12, capacidad: 12, estado: 'disponible', ubicacion: 'terraza', tipo: 'vip', reservable: true }
    ];

    // Sample historical orders data
    const orders = [
        // Orders from last month
        {
            mesa_id: 1,
            mesero_id: 2, // Juan Mesero
            estado: 'completado',
            total: 245.00,
            fecha: '2025-04-08 12:30:00',
            items: [
                { producto_id: 1, cantidad: 3, precio: 25.00, notas: 'Sin cebolla' }, // Tacos de Asada
                { producto_id: 12, cantidad: 2, precio: 20.00 }, // Coca Cola
                { producto_id: 17, cantidad: 1, precio: 15.00 } // Guacamole
            ]
        },
        {
            mesa_id: 3,
            mesero_id: 3, // Ana Mesera
            estado: 'completado',
            total: 180.00,
            fecha: '2025-04-08 13:45:00',
            items: [
                { producto_id: 6, cantidad: 2, precio: 35.00 }, // Quesadilla Sencilla
                { producto_id: 13, cantidad: 2, precio: 15.00 } // Agua de Horchata
            ]
        },
        // Orders from two weeks ago
        {
            mesa_id: 2,
            mesero_id: 2,
            estado: 'completado',
            total: 355.00,
            fecha: '2025-04-24 19:15:00',
            items: [
                { producto_id: 9, cantidad: 2, precio: 45.00 }, // Burrito de Asada
                { producto_id: 15, cantidad: 3, precio: 30.00 }, // Cerveza Nacional
                { producto_id: 17, cantidad: 1, precio: 15.00 } // Guacamole
            ]
        },
        // Orders from last week
        {
            mesa_id: 4,
            mesero_id: 3,
            estado: 'completado',
            total: 420.00,
            fecha: '2025-05-01 20:30:00',
            items: [
                { producto_id: 2, cantidad: 4, precio: 20.00 }, // Tacos de Pastor
                { producto_id: 7, cantidad: 2, precio: 45.00 }, // Quesadilla con Asada
                { producto_id: 16, cantidad: 2, precio: 40.00 }, // Cerveza Importada
                { producto_id: 18, cantidad: 1, precio: 12.00 } // Frijoles Refritos
            ]
        },
        // Orders from yesterday
        {
            mesa_id: 8,
            mesero_id: 2,
            estado: 'completado',
            total: 290.00,
            fecha: '2025-05-07 14:20:00',
            items: [
                { producto_id: 4, cantidad: 2, precio: 30.00 }, // Taco de Pescado
                { producto_id: 5, cantidad: 2, precio: 35.00 }, // Taco de Camarón
                { producto_id: 13, cantidad: 2, precio: 15.00 }, // Agua de Horchata
                { producto_id: 19, cantidad: 1, precio: 25.00 } // Papas Fritas
            ]
        },
        // Orders from today (some completed, some in progress)
        {
            mesa_id: 6,
            mesero_id: 3,
            estado: 'completado',
            total: 185.00,
            fecha: '2025-05-08 12:15:00',
            items: [
                { producto_id: 10, cantidad: 2, precio: 40.00 }, // Burrito de Pastor
                { producto_id: 14, cantidad: 1, precio: 15.00 } // Agua de Jamaica
            ]
        },
        {
            mesa_id: 11,
            mesero_id: 2,
            estado: 'en_proceso',
            total: 680.00,
            fecha: '2025-05-08 13:45:00',
            items: [
                { producto_id: 1, cantidad: 6, precio: 25.00 }, // Tacos de Asada
                { producto_id: 7, cantidad: 3, precio: 45.00 }, // Quesadilla con Asada
                { producto_id: 15, cantidad: 4, precio: 30.00 }, // Cerveza Nacional
                { producto_id: 17, cantidad: 2, precio: 15.00 } // Guacamole
            ]
        }
    ];

    // Insert users if they don't exist
    users.forEach(user => {
        db.get('SELECT id FROM usuarios WHERE usuario = ?', [user.usuario], (err, row) => {
            if (err) {
                console.error('Error checking user:', err);
                return;
            }
            
            if (!row) {
                db.run(
                    'INSERT INTO usuarios (nombre, usuario, contrasena, rol, estado) VALUES (?, ?, ?, ?, ?)',
                    [user.nombre, user.usuario, user.contrasena, user.rol, user.estado],
                    err => {
                        if (err) {
                            console.error('Error inserting user:', err);
                        } else {
                            console.log('User created:', user.nombre);
                        }
                    }
                );
            }
        });
    });

    // Insert products if they don't exist
    products.forEach(product => {
        db.get('SELECT id FROM productos WHERE nombre = ?', [product.nombre], (err, row) => {
            if (err) {
                console.error('Error checking product:', err);
                return;
            }
            
            if (!row) {
                db.run(
                    'INSERT INTO productos (nombre, precio, descripcion, categoria, disponible) VALUES (?, ?, ?, ?, ?)',
                    [product.nombre, product.precio, product.descripcion, product.categoria, product.disponible],
                    err => {
                        if (err) {
                            console.error('Error inserting product:', err);
                        } else {
                            console.log('Product created:', product.nombre);
                        }
                    }
                );
            }
        });
    });

    // Insert tables if they don't exist
    tables.forEach(table => {
        db.get('SELECT id FROM mesas WHERE numero = ?', [table.numero], (err, row) => {
            if (err) {
                console.error('Error checking table:', err);
                return;
            }
            
            if (!row) {
                db.run(
                    'INSERT INTO mesas (numero, capacidad, estado, ubicacion) VALUES (?, ?, ?, ?)',
                    [table.numero, table.capacidad, table.estado, table.ubicacion],
                    err => {
                        if (err) {
                            console.error('Error inserting table:', err);
                        } else {
                            console.log('Table created:', table.numero);
                        }
                    }
                );
            }
        });
    });

    // Insert historical orders if they don't exist
    orders.forEach(order => {
        db.get('SELECT id FROM ordenes WHERE fecha_creacion = ? AND mesa_id = ?', [order.fecha, order.mesa_id], (err, row) => {
            if (err) {
                console.error('Error checking order:', err);
                return;
            }
            
            if (!row) {
                // Insert order
                db.run(
                    'INSERT INTO ordenes (mesa_id, mesero_id, estado, total, fecha_creacion) VALUES (?, ?, ?, ?, ?)',
                    [order.mesa_id, order.mesero_id, order.estado, order.total, order.fecha],
                    function(err) {
                        if (err) {
                            console.error('Error inserting order:', err);
                            return;
                        }
                        
                        const orderId = this.lastID;
                        
                        // Insert order items
                        order.items.forEach(item => {
                            db.run(
                                'INSERT INTO detalles_orden (orden_id, producto_id, cantidad, precio_unitario, notas) VALUES (?, ?, ?, ?, ?)',
                                [orderId, item.producto_id, item.cantidad, item.precio, item.notas || null],
                                err => {
                                    if (err) {
                                        console.error('Error inserting order detail:', err);
                                    }
                                }
                            );
                        });
                        
                        console.log('Order created:', orderId, 'for date:', order.fecha);
                    }
                );
            }
        });
    });
}

module.exports = initializeData;