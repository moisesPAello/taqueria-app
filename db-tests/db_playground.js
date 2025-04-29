const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');

// Ruta al archivo de la base de datos
const dbPath = path.join(__dirname, 'database.db');

// Crear una nueva instancia de la base de datos
const db = new sqlite3.Database(dbPath);

// Configurar readline para entrada de usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para mostrar el menú
function showMenu() {
    console.log('\n=== Menú de Pruebas de Base de Datos ===');
    console.log('1. Ver todos los productos');
    console.log('2. Ver todas las mesas');
    console.log('3. Ver todos los usuarios');
    console.log('4. Ver todas las órdenes activas');
    console.log('5. Crear nueva orden');
    console.log('6. Agregar producto a orden');
    console.log('7. Ver detalles de una orden');
    console.log('8. Ver logs de auditoría');
    console.log('9. Salir');
    console.log('----------------------------------------');
}

// Función para mostrar todos los productos
function showProducts() {
    db.all('SELECT * FROM productos', [], (err, rows) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return;
        }
        console.log('\n=== Productos ===');
        rows.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`Código: ${row.codigo || 'N/A'}`);
            console.log(`Nombre: ${row.nombre}`);
            console.log(`Descripción: ${row.descripcion || 'N/A'}`);
            console.log(`Precio: $${row.precio}`);
            console.log(`Categoría: ${row.categoria}`);
            console.log(`Tiempo de preparación: ${row.tiempo_preparacion || 'N/A'} minutos`);
            console.log(`Disponible: ${row.disponible ? 'Sí' : 'No'}`);
            console.log('-------------------');
        });
        askOption();
    });
}

// Función para mostrar todas las mesas
function showMesas() {
    db.all('SELECT * FROM mesas', [], (err, rows) => {
        if (err) {
            console.error('Error al obtener mesas:', err);
            return;
        }
        console.log('\n=== Mesas ===');
        rows.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`Número: ${row.numero}`);
            console.log(`Capacidad: ${row.capacidad}`);
            console.log(`Estado: ${row.estado}`);
            console.log(`Ubicación: ${row.ubicacion || 'N/A'}`);
            console.log(`Notas: ${row.notas || 'N/A'}`);
            console.log('-------------------');
        });
        askOption();
    });
}

// Función para mostrar todos los usuarios
function showUsuarios() {
    db.all('SELECT * FROM usuarios', [], (err, rows) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return;
        }
        console.log('\n=== Usuarios ===');
        rows.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`Nombre: ${row.nombre}`);
            console.log(`Rol: ${row.rol}`);
            console.log(`Usuario: ${row.usuario}`);
            console.log(`Estado: ${row.estado}`);
            console.log(`Último acceso: ${row.ultimo_acceso || 'N/A'}`);
            console.log('-------------------');
        });
        askOption();
    });
}

// Función para mostrar órdenes activas
function showOrdenesActivas() {
    const query = `
        SELECT o.*, m.numero as mesa_numero, u.nombre as usuario_nombre
        FROM ordenes o
        JOIN mesas m ON o.mesa_id = m.id
        JOIN usuarios u ON o.usuario_id = u.id
        WHERE o.estado = 'activa'
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error al obtener órdenes activas:', err);
            return;
        }
        console.log('\n=== Órdenes Activas ===');
        rows.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`Mesa: ${row.mesa_numero}`);
            console.log(`Mesero: ${row.usuario_nombre}`);
            console.log(`Total: $${row.total}`);
            console.log(`Estado: ${row.estado}`);
            console.log(`Fecha creación: ${row.fecha_creacion}`);
            console.log('-------------------');
        });
        askOption();
    });
}

// Función para crear una nueva orden
function createNewOrder() {
    rl.question('Número de mesa: ', (mesaNum) => {
        rl.question('ID del usuario: ', (usuarioId) => {
            db.run(
                'INSERT INTO ordenes (mesa_id, usuario_id, creado_por) VALUES (?, ?, ?)',
                [mesaNum, usuarioId, usuarioId],
                function(err) {
                    if (err) {
                        console.error('Error al crear orden:', err);
                    } else {
                        console.log(`Orden creada con ID: ${this.lastID}`);
                    }
                    askOption();
                }
            );
        });
    });
}

// Función para agregar producto a una orden
function addProductToOrder() {
    rl.question('ID de la orden: ', (ordenId) => {
        rl.question('ID del producto: ', (productoId) => {
            rl.question('Cantidad: ', (cantidad) => {
                db.get('SELECT precio FROM productos WHERE id = ?', [productoId], (err, producto) => {
                    if (err) {
                        console.error('Error al obtener precio:', err);
                        askOption();
                        return;
                    }
                    
                    db.run(
                        'INSERT INTO detalles_orden (orden_id, producto_id, cantidad, precio_unitario, creado_por) VALUES (?, ?, ?, ?, ?)',
                        [ordenId, productoId, cantidad, producto.precio, 1],
                        function(err) {
                            if (err) {
                                console.error('Error al agregar producto:', err);
                            } else {
                                console.log('Producto agregado exitosamente');
                            }
                            askOption();
                        }
                    );
                });
            });
        });
    });
}

// Función para ver detalles de una orden
function showOrderDetails() {
    rl.question('ID de la orden: ', (ordenId) => {
        const query = `
            SELECT do.*, p.nombre as producto_nombre
            FROM detalles_orden do
            JOIN productos p ON do.producto_id = p.id
            WHERE do.orden_id = ?
        `;
        
        db.all(query, [ordenId], (err, rows) => {
            if (err) {
                console.error('Error al obtener detalles:', err);
                askOption();
                return;
            }
            
            console.log('\n=== Detalles de la Orden ===');
            rows.forEach(row => {
                console.log(`Producto: ${row.producto_nombre}`);
                console.log(`Cantidad: ${row.cantidad}`);
                console.log(`Precio unitario: $${row.precio_unitario}`);
                console.log(`Estado: ${row.estado}`);
                console.log(`Notas: ${row.notas || 'N/A'}`);
                console.log('-------------------');
            });
            askOption();
        });
    });
}

// Función para ver logs de auditoría
function showLogs() {
    db.all('SELECT * FROM logs ORDER BY fecha DESC LIMIT 10', [], (err, rows) => {
        if (err) {
            console.error('Error al obtener logs:', err);
            return;
        }
        console.log('\n=== Últimos 10 Logs ===');
        rows.forEach(row => {
            console.log(`Tabla: ${row.tabla}`);
            console.log(`Acción: ${row.accion}`);
            console.log(`Fecha: ${row.fecha}`);
            console.log(`Usuario: ${row.usuario_id}`);
            console.log('-------------------');
        });
        askOption();
    });
}

// Función para preguntar la opción al usuario
function askOption() {
    showMenu();
    rl.question('Selecciona una opción: ', (option) => {
        switch(option) {
            case '1':
                showProducts();
                break;
            case '2':
                showMesas();
                break;
            case '3':
                showUsuarios();
                break;
            case '4':
                showOrdenesActivas();
                break;
            case '5':
                createNewOrder();
                break;
            case '6':
                addProductToOrder();
                break;
            case '7':
                showOrderDetails();
                break;
            case '8':
                showLogs();
                break;
            case '9':
                console.log('Saliendo...');
                rl.close();
                db.close();
                break;
            default:
                console.log('Opción no válida');
                askOption();
        }
    });
}

// Iniciar el programa
console.log('Bienvenido al campo de pruebas de la base de datos');
askOption(); 