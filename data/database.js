const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear conexión a la base de datos
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos SQLite');
    initializeDatabase();
  }
});

// Función para inicializar la base de datos
function initializeDatabase() {
  db.serialize(() => {
    // Tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      rol TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de productos
    db.run(`CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL,
      categoria TEXT NOT NULL,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de mesas
    db.run(`CREATE TABLE IF NOT EXISTS mesas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER UNIQUE NOT NULL,
      capacidad INTEGER NOT NULL,
      estado TEXT DEFAULT 'libre',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de órdenes
    db.run(`CREATE TABLE IF NOT EXISTS ordenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mesa_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      estado TEXT DEFAULT 'activa',
      total REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mesa_id) REFERENCES mesas(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`);

    // Tabla de detalles de orden
    db.run(`CREATE TABLE IF NOT EXISTS detalles_orden (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orden_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      subtotal REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orden_id) REFERENCES ordenes(id),
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    )`);
  });
}

module.exports = db; 