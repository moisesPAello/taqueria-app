-- Añadir columnas de control de stock a la tabla productos
ALTER TABLE productos ADD COLUMN stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0);
ALTER TABLE productos ADD COLUMN stock_minimo INTEGER NOT NULL DEFAULT 5;

-- Crear tabla para registro de movimientos de inventario
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
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock);
CREATE INDEX IF NOT EXISTS idx_productos_disponible ON productos((stock > 0));
CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos_inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_inventario(fecha);