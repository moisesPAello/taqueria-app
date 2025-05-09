const db = require('../config/database');

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
        { nombre: 'Taco de Asada', precio: 25.00, descripcion: 'Taco tradicional de carne asada premium', categoria: 'tacos', disponible: 1, stock: 85, popularidad: 5 },
        { nombre: 'Taco de Pastor', precio: 20.00, descripcion: 'Taco de carne al pastor marinada con piña', categoria: 'tacos', disponible: 1, stock: 92, popularidad: 5 },
        { nombre: 'Taco de Pollo', precio: 22.00, descripcion: 'Taco de pollo asado con especias', categoria: 'tacos', disponible: 1, stock: 15, popularidad: 3 },
        { nombre: 'Taco de Pescado', precio: 30.00, descripcion: 'Taco de pescado empanizado con ensalada de col', categoria: 'tacos', disponible: 0, stock: 0, popularidad: 4 },
        { nombre: 'Taco de Camarón', precio: 35.00, descripcion: 'Taco de camarón fresco con guacamole', categoria: 'tacos', disponible: 1, stock: 28, popularidad: 4 },
        
        // Quesadillas
        { nombre: 'Quesadilla Sencilla', precio: 35.00, descripcion: 'Tortilla con queso fundido monterrey', categoria: 'quesadillas', disponible: 1, stock: 45, popularidad: 3 },
        { nombre: 'Quesadilla con Asada', precio: 45.00, descripcion: 'Quesadilla con carne asada y queso', categoria: 'quesadillas', disponible: 1, stock: 38, popularidad: 4 },
        { nombre: 'Quesadilla con Pollo', precio: 40.00, descripcion: 'Quesadilla con pollo desmenuzado', categoria: 'quesadillas', disponible: 0, stock: 5, popularidad: 3 },
        
        // Burritos
        { nombre: 'Burrito de Asada', precio: 45.00, descripcion: 'Burrito grande de carne asada con guacamole', categoria: 'burritos', disponible: 1, stock: 25, popularidad: 5 },
        { nombre: 'Burrito de Pastor', precio: 40.00, descripcion: 'Burrito de pastor con queso fundido', categoria: 'burritos', disponible: 1, stock: 32, popularidad: 4 },
        { nombre: 'Burrito Vegetariano', precio: 35.00, descripcion: 'Burrito con frijoles, aguacate y verduras', categoria: 'burritos', disponible: 1, stock: 18, popularidad: 2 },
        
        // Bebidas
        { nombre: 'Coca Cola', precio: 20.00, descripcion: 'Refresco 600ml', categoria: 'bebidas', disponible: 1, stock: 120, popularidad: 5 },
        { nombre: 'Agua de Horchata', precio: 15.00, descripcion: 'Agua fresca de arroz con canela', categoria: 'bebidas', disponible: 1, stock: 42, popularidad: 4 },
        { nombre: 'Agua de Jamaica', precio: 15.00, descripcion: 'Agua fresca de flor de jamaica', categoria: 'bebidas', disponible: 1, stock: 38, popularidad: 4 },
        { nombre: 'Cerveza Nacional', precio: 30.00, descripcion: 'Cerveza local 355ml', categoria: 'bebidas', disponible: 1, stock: 95, popularidad: 4 },
        { nombre: 'Cerveza Importada', precio: 40.00, descripcion: 'Cerveza importada 355ml', categoria: 'bebidas', disponible: 1, stock: 28, popularidad: 3 },
        
        // Complementos
        { nombre: 'Guacamole', precio: 15.00, descripcion: 'Porción extra de guacamole', categoria: 'complementos', disponible: 1, stock: 22, popularidad: 4 },
        { nombre: 'Frijoles Refritos', precio: 12.00, descripcion: 'Porción de frijoles refritos', categoria: 'complementos', disponible: 1, stock: 48, popularidad: 3 },
        { nombre: 'Papas Fritas', precio: 25.00, descripcion: 'Orden de papas a la francesa', categoria: 'complementos', disponible: 1, stock: 35, popularidad: 4 }
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

    // Sample orders from different days
    const orders = [
        // Orders from yesterday
        {
            mesa_id: 1,
            usuario_id: 2, // Juan
            estado: 'cerrada',
            fecha_creacion: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            total: 185.00,
            num_personas: 2,
            metodo_pago: 'efectivo',
            productos: [
                { producto_id: 1, cantidad: 2 }, // Tacos de Asada
                { producto_id: 12, cantidad: 2 }, // Coca Cola
                { producto_id: 17, cantidad: 1 } // Guacamole
            ]
        },
        // Orders from 3 days ago
        {
            mesa_id: 4,
            usuario_id: 3, // Ana
            estado: 'cerrada',
            fecha_creacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            total: 450.00,
            num_personas: 6,
            metodo_pago: 'tarjeta',
            productos: [
                { producto_id: 9, cantidad: 4 }, // Burritos de Asada
                { producto_id: 15, cantidad: 3 }, // Cerveza Nacional
                { producto_id: 18, cantidad: 2 } // Frijoles Refritos
            ]
        },
        // Orders from a week ago
        {
            mesa_id: 11,
            usuario_id: 2, // Juan
            estado: 'cancelada',
            fecha_creacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            total: 0,
            num_personas: 8,
            notas: 'Cliente se retiró antes de recibir la orden'
        },
        // Active order
        {
            mesa_id: 2,
            usuario_id: 3, // Ana
            estado: 'activa',
            fecha_creacion: new Date().toISOString(),
            total: 275.00,
            num_personas: 4,
            productos: [
                { producto_id: 7, cantidad: 2 }, // Quesadillas con Asada
                { producto_id: 13, cantidad: 4 }, // Agua de Horchata
                { producto_id: 19, cantidad: 1 } // Papas Fritas
            ]
        }
    ];    // Function to insert orders after products are ready
    const insertOrdersAfterProducts = () => {
        orders.forEach(order => {
            db.run(
                'INSERT INTO ordenes (mesa_id, usuario_id, estado, fecha_creacion, total, num_personas, metodo_pago, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [order.mesa_id, order.usuario_id, order.estado, order.fecha_creacion, order.total, order.num_personas, order.metodo_pago || null, order.notas || null],
                function(err) {
                    if (err) {
                        console.error('Error inserting order:', err);
                        return;
                    }

                    const orden_id = this.lastID;
                    
                    // Insert order products if any
                    if (order.productos) {
                        order.productos.forEach(prod => {
                            // Get the product price for detalles_orden
                            db.get('SELECT precio FROM productos WHERE id = ?', [prod.producto_id], (err, product) => {
                                if (err) {
                                    console.error('Error getting product price:', err);
                                    return;
                                }
                                
                                const precio_unitario = product ? product.precio : 0;
                                
                                db.run(
                                    'INSERT INTO detalles_orden (orden_id, producto_id, cantidad, precio_unitario, estado) VALUES (?, ?, ?, ?, ?)',
                                    [orden_id, prod.producto_id, prod.cantidad, precio_unitario, 'pendiente'],
                                    err => {
                                        if (err) {
                                            console.error('Error inserting order product:', err);
                                        } else {
                                            console.log('Order product created for order:', orden_id);
                                        }
                                    }
                                );
                            });
                        });
                    }
                    
                    console.log('Order created:', orden_id);
                }
            );
        });
    };

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
    let productsInserted = 0;
    const totalProducts = products.length;
    
    products.forEach(product => {
        db.get('SELECT id FROM productos WHERE nombre = ?', [product.nombre], (err, row) => {
            if (err) {
                console.error('Error checking product:', err);
                return;
            }
            
            if (!row) {
                db.run(
                    'INSERT INTO productos (nombre, precio, descripcion, categoria, disponible, stock) VALUES (?, ?, ?, ?, ?, ?)',
                    [product.nombre, product.precio, product.descripcion, product.categoria, product.disponible, product.stock],
                    err => {
                        if (err) {
                            console.error('Error inserting product:', err);
                        } else {
                            console.log('Product created:', product.nombre);
                        }
                        productsInserted++;
                        if (productsInserted === totalProducts) {
                            console.log('All products inserted, now creating orders...');
                            insertOrdersAfterProducts();
                        }
                    }
                );
            } else {
                productsInserted++;
                if (productsInserted === totalProducts) {
                    console.log('All products ready, now creating orders...');
                    insertOrdersAfterProducts();
                }
            }
        });    });

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
}

module.exports = initializeData;