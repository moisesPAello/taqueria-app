const sqlite3 = require('sqlite3');  // Remove .verbose()
const path = require('path');

// Configurar SQLite para usar UTC
sqlite3.Database.prototype.runAsync = function(sql, params) {
    return new Promise((resolve, reject) => {
        this.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

// Asegurar que las fechas se almacenen en UTC
const dbPath = path.resolve(__dirname, '../../database/database.db');
console.log('Database path:', dbPath);
const db = new sqlite3.Database(
    dbPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error('Error al conectar con la base de datos:', err);
        } else {
            console.log('Conexión exitosa con la base de datos');
            // Configurar la zona horaria UTC
            db.run('PRAGMA timezone = "UTC"');
            initializeDatabase();
        }
    }
);

function initializeDatabase() {
    db.serialize(() => {
        // Tabla de logs para auditoría
        db.run(`CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tabla TEXT NOT NULL,
            accion TEXT NOT NULL,
            registro_id INTEGER NOT NULL,
            usuario_id INTEGER,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            datos_anteriores TEXT,
            datos_nuevos TEXT,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )`);

        // Tabla de mesas mejorada
        db.run(`CREATE TABLE IF NOT EXISTS mesas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero INTEGER NOT NULL UNIQUE,
            capacidad INTEGER NOT NULL,
            estado TEXT NOT NULL DEFAULT 'disponible' CHECK(estado IN ('disponible', 'ocupada', 'en_servicio', 'mantenimiento')),
            ubicacion TEXT,
            notas TEXT,
            mesero_id INTEGER,
            orden_actual INTEGER,
            creado_por INTEGER,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            actualizado_por INTEGER,
            fecha_actualizacion TIMESTAMP,
            FOREIGN KEY (mesero_id) REFERENCES usuarios(id),
            FOREIGN KEY (orden_actual) REFERENCES ordenes(id),
            FOREIGN KEY (creado_por) REFERENCES usuarios(id),
            FOREIGN KEY (actualizado_por) REFERENCES usuarios(id)
        )`);

        // Tabla de usuarios mejorada
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            rol TEXT NOT NULL CHECK(rol IN ('admin', 'mesero', 'cocinero', 'cajero')),
            usuario TEXT NOT NULL UNIQUE,
            contrasena TEXT NOT NULL,
            estado TEXT NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ultimo_acceso TIMESTAMP,
            creado_por INTEGER,
            actualizado_por INTEGER,
            fecha_actualizacion TIMESTAMP,
            FOREIGN KEY (creado_por) REFERENCES usuarios(id),
            FOREIGN KEY (actualizado_por) REFERENCES usuarios(id)
        )`);

        // Tabla de productos mejorada
        db.run(`CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio REAL NOT NULL CHECK(precio >= 0),
            categoria TEXT NOT NULL,
            tiempo_preparacion INTEGER, -- en minutos
            imagen TEXT,
            disponible BOOLEAN NOT NULL DEFAULT 1,
            creado_por INTEGER,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            actualizado_por INTEGER,
            fecha_actualizacion TIMESTAMP,
            FOREIGN KEY (creado_por) REFERENCES usuarios(id),
            FOREIGN KEY (actualizado_por) REFERENCES usuarios(id)
        )`);

        // Tabla de órdenes mejorada
        db.run(`CREATE TABLE IF NOT EXISTS ordenes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mesa_id INTEGER NOT NULL,
            usuario_id INTEGER NOT NULL,
            num_personas INTEGER NOT NULL DEFAULT 1,
            total REAL NOT NULL DEFAULT 0 CHECK(total >= 0),
            estado TEXT NOT NULL DEFAULT 'activa' CHECK(estado IN ('activa', 'cerrada', 'cancelada')),
            metodo_pago TEXT CHECK(metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
            notas TEXT,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_cierre TIMESTAMP,
            creado_por INTEGER,
            actualizado_por INTEGER,
            fecha_actualizacion TIMESTAMP,
            FOREIGN KEY (mesa_id) REFERENCES mesas(id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
            FOREIGN KEY (creado_por) REFERENCES usuarios(id),
            FOREIGN KEY (actualizado_por) REFERENCES usuarios(id)
        )`);

        // Tabla de detalles de orden mejorada
        db.run(`CREATE TABLE IF NOT EXISTS detalles_orden (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orden_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL CHECK(cantidad > 0),
            precio_unitario REAL NOT NULL CHECK(precio_unitario >= 0),
            estado TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'en_preparacion', 'listo', 'entregado')),
            notas TEXT,
            cancelado BOOLEAN NOT NULL DEFAULT 0,
            creado_por INTEGER,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            actualizado_por INTEGER,
            fecha_actualizacion TIMESTAMP,
            FOREIGN KEY (orden_id) REFERENCES ordenes(id),
            FOREIGN KEY (producto_id) REFERENCES productos(id),
            FOREIGN KEY (creado_por) REFERENCES usuarios(id),
            FOREIGN KEY (actualizado_por) REFERENCES usuarios(id)
        )`);

        // Crear índices para mejorar el rendimiento
        db.run('CREATE INDEX IF NOT EXISTS idx_mesas_numero ON mesas(numero)');
        db.run('CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON ordenes(fecha_creacion)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes(estado)');
        db.run('CREATE INDEX IF NOT EXISTS idx_detalles_orden_estado ON detalles_orden(estado)');

        // Crear triggers para auditoría
        db.run(`
            CREATE TRIGGER IF NOT EXISTS log_mesas AFTER UPDATE ON mesas
            BEGIN
                INSERT INTO logs(tabla, accion, registro_id, usuario_id, datos_anteriores, datos_nuevos)
                VALUES('mesas', 'UPDATE', old.id, new.actualizado_por, 
                    json_object('numero', old.numero, 'estado', old.estado),
                    json_object('numero', new.numero, 'estado', new.estado)
                );
            END
        `);

        console.log('Estructura de la base de datos mejorada creada exitosamente');
    });
}

module.exports = db;