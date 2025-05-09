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