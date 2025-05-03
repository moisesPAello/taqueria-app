const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');

// Configuración de la base de datos
const dbPath = path.join(__dirname, '../database/database.db');
const db = new sqlite3.Database(dbPath);

// Configuración de readline para entrada interactiva
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Funciones auxiliares
const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));
const pressEnterToContinue = () => question('\nPresiona Enter para continuar...');

// Menú principal
const mainMenu = async () => {
    while (true) {
        console.clear();
        console.log('=== SQLite Database Playground ===');
        console.log('\nSelecciona una categoría:');
        console.log('1. Consultas y Visualización');
        console.log('2. Gestión de Datos');
        console.log('3. Gestión de Estructura');
        console.log('4. Mantenimiento');
        console.log('5. Salir');

        const option = await question('\nOpción: ');
        
        switch (option) {
            case '1': await queryMenu(); break;
            case '2': await dataMenu(); break;
            case '3': await structureMenu(); break;
            case '4': await maintenanceMenu(); break;
            case '5': 
                console.log('Cerrando conexión...');
                db.close();
                rl.close();
                return;
            default:
                console.log('Opción no válida');
                await pressEnterToContinue();
        }
    }
};

// Menú de consultas
const queryMenu = async () => {
    while (true) {
        console.clear();
        console.log('=== Consultas y Visualización ===');
        console.log('1. Ver todas las tablas');
        console.log('2. Ver estructura de una tabla');
        console.log('3. Ver datos de una tabla');
        console.log('4. Ejecutar consulta SQL personalizada');
        console.log('5. Ver índices de una tabla');
        console.log('6. Volver al menú principal');

        const option = await question('\nOpción: ');

        switch (option) {
            case '1': await showTables(); break;
            case '2': await showTableStructure(); break;
            case '3': await showTableData(); break;
            case '4': await executeCustomQuery(); break;
            case '5': await showTableIndexes(); break;
            case '6': return;
            default:
                console.log('Opción no válida');
                await pressEnterToContinue();
        }
    }
};

// Menú de gestión de datos
const dataMenu = async () => {
    while (true) {
        console.clear();
        console.log('=== Gestión de Datos ===');
        console.log('1. Insertar registro');
        console.log('2. Actualizar registro');
        console.log('3. Eliminar registro');
        console.log('4. Truncar tabla');
        console.log('5. Importar datos CSV');
        console.log('6. Exportar datos CSV');
        console.log('7. Volver al menú principal');
        console.log('8. Cargar datos de ejemplo');

        const option = await question('\nOpción: ');

        switch (option) {
            case '1': await insertRecord(); break;
            case '2': await updateRecord(); break;
            case '3': await deleteRecord(); break;
            case '4': await truncateTable(); break;
            case '5': await importCSV(); break;
            case '6': await exportCSV(); break;
            case '7': return;
            case '8': await loadSampleData(); break;
            default:
                console.log('Opción no válida');
                await pressEnterToContinue();
        }
    }
};

// Menú de estructura
const structureMenu = async () => {
    while (true) {
        console.clear();
        console.log('=== Gestión de Estructura ===');
        console.log('1. Crear tabla');
        console.log('2. Modificar tabla');
        console.log('3. Eliminar tabla');
        console.log('4. Crear índice');
        console.log('5. Eliminar índice');
        console.log('6. Ver triggers');
        console.log('7. Volver al menú principal');

        const option = await question('\nOpción: ');

        switch (option) {
            case '1': await createTable(); break;
            case '2': await alterTable(); break;
            case '3': await dropTable(); break;
            case '4': await createIndex(); break;
            case '5': await dropIndex(); break;
            case '6': await showTriggers(); break;
            case '7': return;
            default:
                console.log('Opción no válida');
                await pressEnterToContinue();
        }
    }
};

// Menú de mantenimiento
const maintenanceMenu = async () => {
    while (true) {
        console.clear();
        console.log('=== Mantenimiento ===');
        console.log('1. Analizar base de datos');
        console.log('2. Vacuumar base de datos');
        console.log('3. Verificar integridad');
        console.log('4. Respaldar base de datos');
        console.log('5. Restaurar base de datos');
        console.log('6. Ver tamaño de tablas');
        console.log('7. Volver al menú principal');

        const option = await question('\nOpción: ');

        switch (option) {
            case '1': await analyzeDatabase(); break;
            case '2': await vacuumDatabase(); break;
            case '3': await checkIntegrity(); break;
            case '4': await backupDatabase(); break;
            case '5': await restoreDatabase(); break;
            case '6': await showTableSizes(); break;
            case '7': return;
            default:
                console.log('Opción no válida');
                await pressEnterToContinue();
        }
    }
};

// Implementación de funciones de consulta
async function showTables() {
    console.clear();
    console.log('=== Tablas en la base de datos ===\n');
    
    db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`, 
        [], (err, tables) => {
            if (err) {
                console.error('Error:', err.message);
            } else {
                tables.forEach(table => {
                    console.log(`- ${table.name}`);
                });
            }
            pressEnterToContinue();
        });
}

async function showTableStructure() {
    const tableName = await question('\nNombre de la tabla: ');
    console.log(`\nEstructura de la tabla ${tableName}:`);
    
    db.all(`PRAGMA table_info(${tableName})`, [], (err, columns) => {
        if (err) {
            console.error('Error:', err.message);
        } else {
            columns.forEach(col => {
                console.log(`${col.name} (${col.type})${col.pk ? ' PRIMARY KEY' : ''}${col.notnull ? ' NOT NULL' : ''}`);
            });
        }
        pressEnterToContinue();
    });
}

async function showTableData() {
    const tableName = await question('\nNombre de la tabla: ');
    const limit = await question('Límite de registros (Enter para todos): ') || 'ALL';
    
    const query = `SELECT * FROM ${tableName} ${limit !== 'ALL' ? 'LIMIT ' + limit : ''}`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
        } else {
            console.log('\nRegistros encontrados:');
            console.table(rows);
        }
        pressEnterToContinue();
    });
}

async function executeCustomQuery() {
    console.log('\nEjecutar consulta SQL personalizada');
    console.log('Ejemplo: SELECT * FROM usuarios WHERE id = 1');
    const query = await question('\nIngresa tu consulta SQL: ');
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
        } else {
            console.log('\nResultados:');
            console.table(rows);
        }
        pressEnterToContinue();
    });
}

async function showTableIndexes() {
    const tableName = await question('\nNombre de la tabla: ');
    
    db.all(`SELECT * FROM sqlite_master WHERE type = 'index' AND tbl_name = ?`, 
        [tableName], (err, indexes) => {
            if (err) {
                console.error('Error:', err.message);
            } else {
                console.log('\nÍndices encontrados:');
                indexes.forEach(index => {
                    console.log(`- ${index.name}: ${index.sql}`);
                });
            }
            pressEnterToContinue();
        });
}

// Implementación de funciones de datos
async function truncateTable() {
    const tableName = await question('\nNombre de la tabla a truncar: ');
    const confirm = await question('¿Estás seguro? (s/n): ');
    
    if (confirm.toLowerCase() === 's') {
        db.run(`DELETE FROM ${tableName}`, err => {
            if (err) {
                console.error('Error:', err.message);
            } else {
                console.log('Tabla truncada exitosamente');
            }
            pressEnterToContinue();
        });
    }
}

async function insertRecord() {
    const tableName = await question('\nNombre de la tabla: ');
    
    // Obtener estructura de la tabla
    db.all(`PRAGMA table_info(${tableName})`, [], async (err, columns) => {
        if (err) {
            console.error('Error:', err.message);
            return pressEnterToContinue();
        }

        const values = [];
        const placeholders = [];
        const columnNames = [];

        for (const col of columns) {
            if (!col.pk || col.pk !== 1) { // Ignorar primary keys autoincrement
                const value = await question(`${col.name} (${col.type}): `);
                values.push(value);
                columnNames.push(col.name);
                placeholders.push('?');
            }
        }

        const query = `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${placeholders.join(', ')})`;
        
        db.run(query, values, function(err) {
            if (err) {
                console.error('Error:', err.message);
            } else {
                console.log(`Registro insertado con ID: ${this.lastID}`);
            }
            pressEnterToContinue();
        });
    });
}

// Implementación de funciones de estructura
async function dropTable() {
    const tableName = await question('\nNombre de la tabla a eliminar: ');
    const confirm = await question('¿Estás seguro? Esta acción no se puede deshacer (s/n): ');
    
    if (confirm.toLowerCase() === 's') {
        db.run(`DROP TABLE IF EXISTS ${tableName}`, err => {
            if (err) {
                console.error('Error:', err.message);
            } else {
                console.log('Tabla eliminada exitosamente');
            }
            pressEnterToContinue();
        });
    }
}

// Implementación de funciones de mantenimiento
async function vacuumDatabase() {
    console.log('\nOptimizando la base de datos...');
    db.run('VACUUM', err => {
        if (err) {
            console.error('Error:', err.message);
        } else {
            console.log('Base de datos optimizada exitosamente');
        }
        pressEnterToContinue();
    });
}

async function analyzeDatabase() {
    console.log('\nAnalizando base de datos...');
    db.exec('ANALYZE', err => {
        if (err) {
            console.error('Error:', err.message);
        } else {
            console.log('Análisis completado');
        }
        pressEnterToContinue();
    });
}

async function checkIntegrity() {
    console.log('\nVerificando integridad de la base de datos...');
    db.get('PRAGMA integrity_check', (err, result) => {
        if (err) {
            console.error('Error:', err.message);
        } else {
            console.log('Resultado:', result.integrity_check);
        }
        pressEnterToContinue();
    });
}

async function showTableSizes() {
    console.log('\nTamaño de las tablas:');
    const query = `
        SELECT 
            name as 'Tabla',
            page_count * page_size as 'Tamaño (bytes)'
        FROM 
            sqlite_master AS m,
            pragma_page_count(m.name) AS page_count,
            pragma_page_size() AS page_size
        WHERE 
            m.type = 'table'
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
        } else {
            rows.forEach(row => {
                const sizeInMB = (row['Tamaño (bytes)'] / (1024 * 1024)).toFixed(2);
                console.log(`${row.Tabla}: ${sizeInMB} MB`);
            });
        }
        pressEnterToContinue();
    });
}

async function backupDatabase() {
    const fs = require('fs');
    const backupPath = path.join(__dirname, '../database/backup_' + 
        new Date().toISOString().replace(/[:.]/g, '-') + '.db');
    
    console.log('\nCreando respaldo...');
    
    const backup = fs.createWriteStream(backupPath);
    const source = fs.createReadStream(dbPath);
    
    source.pipe(backup);
    
    backup.on('finish', () => {
        console.log(`Respaldo creado en: ${backupPath}`);
        pressEnterToContinue();
    });
    
    backup.on('error', (err) => {
        console.error('Error al crear respaldo:', err);
        pressEnterToContinue();
    });
}

// Implementación de importación/exportación CSV
async function exportCSV() {
    const fs = require('fs');
    const tableName = await question('\nNombre de la tabla a exportar: ');
    const csvPath = path.join(__dirname, `../exports/${tableName}_${Date.now()}.csv`);
    
    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
            return pressEnterToContinue();
        }
        
        if (rows.length === 0) {
            console.log('No hay datos para exportar');
            return pressEnterToContinue();
        }
        
        const headers = Object.keys(rows[0]).join(',');
        const values = rows.map(row => Object.values(row).join(','));
        const csv = [headers, ...values].join('\n');
        
        fs.writeFile(csvPath, csv, err => {
            if (err) {
                console.error('Error al exportar:', err);
            } else {
                console.log(`Datos exportados a: ${csvPath}`);
            }
            pressEnterToContinue();
        });
    });
}

// Nueva función para cargar datos de ejemplo
async function loadSampleData() {
    console.log('\nCargando datos de ejemplo...');
    
    const sampleData = {
        productos: [
            { nombre: 'Taco de Asada', precio: 25.00, descripcion: 'Taco tradicional de carne asada' },
            { nombre: 'Taco de Pastor', precio: 20.00, descripcion: 'Taco de carne al pastor' },
            // ... más productos
        ],
        mesas: [
            { numero: 1, capacidad: 4, estado: 'disponible' },
            { numero: 2, capacidad: 6, estado: 'disponible' },
            // ... más mesas
        ],
        usuarios: [
            { nombre: 'Admin', email: 'admin@taqueria.com', password: 'admin123', rol: 'admin' },
            { nombre: 'Mesero', email: 'mesero@taqueria.com', password: 'mesero123', rol: 'mesero' },
            // ... más usuarios
        ]
    };

    try {
        for (const [table, data] of Object.entries(sampleData)) {
            for (const item of data) {
                const columns = Object.keys(item).join(', ');
                const placeholders = Object.keys(item).map(() => '?').join(', ');
                const values = Object.values(item);
                
                await new Promise((resolve, reject) => {
                    db.run(
                        `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
                        values,
                        err => err ? reject(err) : resolve()
                    );
                });
            }
            console.log(`✓ Datos cargados en tabla: ${table}`);
        }
        console.log('\nTodos los datos de ejemplo han sido cargados exitosamente.');
    } catch (err) {
        console.error('Error al cargar datos:', err.message);
    }
    
    await pressEnterToContinue();
}

// Inicio del programa
console.log('Bienvenido al SQLite Database Playground');
mainMenu();
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