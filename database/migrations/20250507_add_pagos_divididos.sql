-- Crear tabla pagos_divididos
CREATE TABLE IF NOT EXISTS pagos_divididos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orden_id INTEGER NOT NULL,
    cliente_numero INTEGER NOT NULL,
    monto REAL NOT NULL,
    FOREIGN KEY (orden_id) REFERENCES ordenes(id),
    CHECK (monto > 0)
);