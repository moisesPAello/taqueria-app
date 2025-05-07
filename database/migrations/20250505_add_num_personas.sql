-- Inicio de la transacción
BEGIN TRANSACTION;

-- 1. Crear tabla temporal con la nueva estructura
CREATE TABLE ordenes_new (
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
);

-- 2. Copiar datos existentes a la nueva tabla
INSERT INTO ordenes_new (
    id, mesa_id, usuario_id, total, estado, metodo_pago, notas,
    fecha_creacion, fecha_cierre, creado_por, actualizado_por, fecha_actualizacion
) SELECT 
    id, mesa_id, usuario_id, total, estado, metodo_pago, notas,
    fecha_creacion, fecha_cierre, creado_por, actualizado_por, fecha_actualizacion
FROM ordenes;

-- 3. Eliminar tabla vieja
DROP TABLE ordenes;

-- 4. Renombrar tabla nueva
ALTER TABLE ordenes_new RENAME TO ordenes;

-- 5. Recrear índices
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON ordenes(fecha_creacion);

-- Confirmar cambios
COMMIT;