const db = require('./database');

function initializeData() {
    // Sample users data
    const users = [
        { nombre: 'Administrador', usuario: 'admin@taqueria.com', contrasena: 'admin123', rol: 'admin', estado: 'activo' },
        { nombre: 'Juan Mesero', usuario: 'juan@taqueria.com', contrasena: 'juan123', rol: 'mesero', estado: 'activo' },
        { nombre: 'Ana Mesera', usuario: 'ana@taqueria.com', contrasena: 'ana123', rol: 'mesero', estado: 'activo' },
        { nombre: 'Pedro Cocinero', usuario: 'pedro@taqueria.com', contrasena: 'pedro123', rol: 'cocinero', estado: 'activo' }
    ];

    // Sample products data
    const products = [
        { nombre: 'Taco de Asada', precio: 25.00, descripcion: 'Taco tradicional de carne asada', categoria: 'tacos', disponible: 1 },
        { nombre: 'Taco de Pastor', precio: 20.00, descripcion: 'Taco de carne al pastor marinada', categoria: 'tacos', disponible: 1 },
        { nombre: 'Taco de Pollo', precio: 22.00, descripcion: 'Taco de pollo asado', categoria: 'tacos', disponible: 1 },
        { nombre: 'Quesadilla', precio: 35.00, descripcion: 'Tortilla con queso fundido', categoria: 'quesadillas', disponible: 1 },
        { nombre: 'Burrito de Asada', precio: 45.00, descripcion: 'Burrito grande de carne asada', categoria: 'burritos', disponible: 1 },
        { nombre: 'Coca Cola', precio: 20.00, descripcion: 'Refresco 600ml', categoria: 'bebidas', disponible: 1 },
        { nombre: 'Agua Fresca', precio: 15.00, descripcion: 'Agua de horchata/jamaica', categoria: 'bebidas', disponible: 1 }
    ];

    // Sample tables data
    const tables = [
        { numero: 1, capacidad: 4, estado: 'disponible', ubicacion: 'interior' },
        { numero: 2, capacidad: 6, estado: 'disponible', ubicacion: 'interior' },
        { numero: 3, capacidad: 2, estado: 'disponible', ubicacion: 'barra' },
        { numero: 4, capacidad: 4, estado: 'disponible', ubicacion: 'terraza' },
        { numero: 5, capacidad: 8, estado: 'disponible', ubicacion: 'terraza' }
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
}

module.exports = initializeData;