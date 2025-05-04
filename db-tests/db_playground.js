const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');
const fs = require('fs');
const dirs = ['../exports', '../database/backups'];

dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

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

// Agregar después de las funciones auxiliares
const handleError = (err, message = 'Error en operación') => {
    console.error(`${message}:`, err.message);
    return pressEnterToContinue();
};

// Agregar después del wrapper de error
const validateTableName = async (tableName) => {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
            [tableName],
            (err, row) => {
                if (err) reject(err);
                resolve(row ? true : false);
            }
        );
    });
};

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
            return pressEnterToContinue();
        }

        if (rows.length === 0) {
            console.log('\nLa tabla está vacía');
            return pressEnterToContinue();
        }

        // Obtener el ancho máximo para cada columna
        const columns = Object.keys(rows[0]);
        const widths = {};
        
        // Inicializar con el largo de los nombres de columna
        columns.forEach(col => {
            widths[col] = col.length;
        });

        // Encontrar el valor más largo para cada columna
        rows.forEach(row => {
            columns.forEach(col => {
                const value = row[col]?.toString() || '';
                widths[col] = Math.max(widths[col], value.length);
            });
        });

        // Crear la línea separadora
        const separator = '+' + columns.map(col => '-'.repeat(widths[col] + 2)).join('+') + '+';

        // Imprimir encabezado
        console.log('\n' + separator);
        console.log('|' + columns.map(col => ` ${col.padEnd(widths[col])} `).join('|') + '|');
        console.log(separator);

        // Imprimir filas
        rows.forEach(row => {
            console.log('|' + columns.map(col => {
                const value = row[col]?.toString() || '';
                return ` ${value.padEnd(widths[col])} `;
            }).join('|') + '|');
        });

        // Imprimir línea final
        console.log(separator);
        console.log(`\nTotal de registros: ${rows.length}`);
        
        return pressEnterToContinue();
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

/**
 * Exporta el contenido de una tabla a un archivo CSV
 * @param {string} tableName - Nombre de la tabla a exportar
 * @returns {Promise<void>}
 */
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
            { nombre: 'Taco de Asada', precio: 25.00, descripcion: 'Taco tradicional de carne asada', categoria: 'tacos', disponible: 1 },
            { nombre: 'Taco de Pastor', precio: 20.00, descripcion: 'Taco de carne al pastor marinada', categoria: 'tacos', disponible: 1 },
            { nombre: 'Taco de Pollo', precio: 22.00, descripcion: 'Taco de pollo asado', categoria: 'tacos', disponible: 1 },
            { nombre: 'Quesadilla', precio: 35.00, descripcion: 'Tortilla con queso fundido', categoria: 'quesadillas', disponible: 1 },
            { nombre: 'Burrito de Asada', precio: 45.00, descripcion: 'Burrito grande de carne asada', categoria: 'burritos', disponible: 1 },
            { nombre: 'Coca Cola', precio: 20.00, descripcion: 'Refresco 600ml', categoria: 'bebidas', disponible: 1 },
            { nombre: 'Agua Fresca', precio: 15.00, descripcion: 'Agua de horchata/jamaica', categoria: 'bebidas', disponible: 1 }
        ],
        mesas: [
            { numero: 1, capacidad: 4, estado: 'disponible', ubicacion: 'interior' },
            { numero: 2, capacidad: 6, estado: 'disponible', ubicacion: 'interior' },
            { numero: 3, capacidad: 2, estado: 'disponible', ubicacion: 'barra' },
            { numero: 4, capacidad: 4, estado: 'disponible', ubicacion: 'terraza' },
            { numero: 5, capacidad: 8, estado: 'disponible', ubicacion: 'terraza' }
        ],
        usuarios: [
            { 
                nombre: 'Administrador', 
                usuario: 'admin@taqueria.com', 
                contrasena: 'admin123', 
                rol: 'admin',
                estado: 'activo'
            },
            { 
                nombre: 'Juan Mesero', 
                usuario: 'juan@taqueria.com', 
                contrasena: 'juan123', 
                rol: 'mesero',
                estado: 'activo'
            },
            { 
                nombre: 'Ana Mesera', 
                usuario: 'ana@taqueria.com', 
                contrasena: 'ana123', 
                rol: 'mesero',
                estado: 'activo'
            },
            { 
                nombre: 'Pedro Cocinero', 
                usuario: 'pedro@taqueria.com', 
                contrasena: 'pedro123', 
                rol: 'cocinero',
                estado: 'activo'
            }
        ]
    };

    try {
        // Primero truncamos las tablas para evitar duplicados
        for (const table of Object.keys(sampleData)) {
            await new Promise((resolve, reject) => {
                db.run(`DELETE FROM ${table}`, err => err ? reject(err) : resolve());
            });
            console.log(`✓ Tabla ${table} limpiada`);
        }

        // Luego insertamos los nuevos datos
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
            console.log(`✓ ${data.length} registros cargados en tabla: ${table}`);
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