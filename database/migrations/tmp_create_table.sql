DROP TABLE IF EXISTS pagos_divididos;

CREATE TABLE pagos_divididos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orden_id INTEGER NOT NULL,
    cliente_numero INTEGER NOT NULL,
    monto REAL NOT NULL,
    metodo_pago TEXT NOT NULL CHECK(metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
    pagado BOOLEAN DEFAULT 0,
    fecha_pago DATETIME,
    FOREIGN KEY (orden_id) REFERENCES ordenes(id),
    CHECK (monto > 0)
);