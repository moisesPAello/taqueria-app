const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

console.log('Iniciando migración...');

db.serialize(() => {
    // 1. Crear tabla temporal con la estructura actualizada
    db.run(`
        CREATE TABLE IF NOT EXISTS productos_temp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio REAL NOT NULL CHECK(precio >= 0),
            categoria TEXT NOT NULL,
            tiempo_preparacion INTEGER,
            imagen TEXT,
            disponible BOOLEAN NOT NULL DEFAULT 1,
            stock INTEGER NOT NULL DEFAULT 100,
            stock_minimo INTEGER NOT NULL DEFAULT 20,
            creado_por INTEGER,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            actualizado_por INTEGER,
            fecha_actualizacion TIMESTAMP,
            FOREIGN KEY (creado_por) REFERENCES usuarios(id),
            FOREIGN KEY (actualizado_por) REFERENCES usuarios(id)
        )
    `, function(err) {
        if (err) {
            console.error('Error creando tabla temporal:', err);
            return;
        }
        console.log('Tabla temporal creada');

        // 2. Copiar datos existentes
        db.run(`
            INSERT INTO productos_temp (
                id, codigo, nombre, descripcion, precio, categoria,
                tiempo_preparacion, imagen, disponible, creado_por,
                fecha_creacion, actualizado_por, fecha_actualizacion
            )
            SELECT 
                id, codigo, nombre, descripcion, precio, categoria,
                tiempo_preparacion, imagen, disponible, creado_por,
                fecha_creacion, actualizado_por, fecha_actualizacion
            FROM productos
        `, function(err) {
            if (err) {
                console.error('Error copiando datos:', err);
                return;
            }
            console.log('Datos copiados');

            // 3. Eliminar tabla original
            db.run('DROP TABLE productos', function(err) {
                if (err) {
                    console.error('Error eliminando tabla original:', err);
                    return;
                }
                console.log('Tabla original eliminada');

                // 4. Renombrar tabla temporal
                db.run('ALTER TABLE productos_temp RENAME TO productos', function(err) {
                    if (err) {
                        console.error('Error renombrando tabla:', err);
                        return;
                    }
                    console.log('Tabla renombrada');

                    // 5. Crear tabla de movimientos
                    db.run(`
                        CREATE TABLE IF NOT EXISTS movimientos_inventario (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            producto_id INTEGER NOT NULL,
                            tipo TEXT NOT NULL CHECK(tipo IN ('entrada', 'salida', 'ajuste')),
                            cantidad INTEGER NOT NULL,
                            motivo TEXT NOT NULL,
                            orden_id INTEGER,
                            usuario_id INTEGER NOT NULL,
                            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (producto_id) REFERENCES productos(id),
                            FOREIGN KEY (orden_id) REFERENCES ordenes(id),
                            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                        )
                    `, function(err) {
                        if (err) {
                            console.error('Error creando tabla movimientos:', err);
                            return;
                        }
                        console.log('Tabla movimientos creada');

                        // 6. Crear índices
                        const indices = [
                            'CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock)',
                            'CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos_inventario(producto_id)',
                            'CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_inventario(fecha)'
                        ];

                        let completedIndices = 0;
                        indices.forEach(sql => {
                            db.run(sql, function(err) {
                                if (err) {
                                    console.error('Error creando índice:', err);
                                    return;
                                }
                                completedIndices++;
                                if (completedIndices === indices.length) {
                                    console.log('Índices creados');
                                    console.log('Migración completada exitosamente');
                                    db.close();
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});