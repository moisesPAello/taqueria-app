const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta al archivo de la base de datos
const dbPath = path.join(__dirname, 'database.db');

// Crear una nueva instancia de la base de datos
const db = new sqlite3.Database(dbPath);

// Función para obtener la estructura de una tabla
function getTableInfo(tableName) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName})`, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                console.log(`\nEstructura de la tabla ${tableName}:`);
                rows.forEach(row => {
                    console.log(`- ${row.name} (${row.type})${row.notnull ? ' NOT NULL' : ''}${row.pk ? ' PRIMARY KEY' : ''}`);
                });
                resolve();
            }
        });
    });
}

// Obtener lista de tablas
db.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], async (err, tables) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    try {
        for (const table of tables) {
            await getTableInfo(table.name);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        db.close();
    }
}); 