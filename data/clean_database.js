const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta al archivo de la base de datos
const dbPath = path.join(__dirname, 'database.db');

// Crear una nueva instancia de la base de datos
const db = new sqlite3.Database(dbPath);

// Función para vaciar la base de datos
function cleanDatabase() {
    db.serialize(() => {
        // Desactivar restricciones de clave foránea
        db.run('PRAGMA foreign_keys = OFF', (err) => {
            if (err) {
                console.error('Error al desactivar restricciones:', err);
                return;
            }

            // Vaciar las tablas
            const tables = [
                'detalles_orden',
                'ordenes',
                'productos',
                'usuarios',
                'mesas'
            ];

            tables.forEach(table => {
                db.run(`DELETE FROM ${table}`, (err) => {
                    if (err) {
                        console.error(`Error al vaciar ${table}:`, err);
                    } else {
                        console.log(`Tabla ${table} vaciada exitosamente`);
                    }
                });

                // Reiniciar el contador de autoincremento
                db.run(`DELETE FROM sqlite_sequence WHERE name = '${table}'`, (err) => {
                    if (err) {
                        console.error(`Error al reiniciar secuencia de ${table}:`, err);
                    }
                });
            });

            // Reactivar restricciones de clave foránea
            db.run('PRAGMA foreign_keys = ON', (err) => {
                if (err) {
                    console.error('Error al reactivar restricciones:', err);
                } else {
                    console.log('Base de datos vaciada exitosamente');
                }
                db.close();
            });
        });
    });
}

// Ejecutar la limpieza
cleanDatabase(); 