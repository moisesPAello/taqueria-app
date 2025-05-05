const db = require('./database');

function initializeData() {
    // Sample users data
    const users = [
        { nombre: 'Administrador', usuario: 'admin@taqueria.com', contrasena: 'admin123', rol: 'admin', estado: 'activo' },
        { nombre: 'Juan Mesero', usuario: 'juan@taqueria.com', contrasena: 'juan123', rol: 'mesero', estado: 'activo' },
        { nombre: 'Ana Mesera', usuario: 'ana@taqueria.com', contrasena: 'ana123', rol: 'mesero', estado: 'activo' },
        { nombre: 'Pedro Cocinero', usuario: 'pedro@taqueria.com', contrasena: 'pedro123', rol: 'cocinero', estado: 'activo' }
    ];

    // Insert users if they don't exist
    users.forEach(user => {
        db.get('SELECT id FROM usuarios WHERE usuario = ?', [user.usuario], (err, row) => {
            if (err) {
                console.error('Error checking user:', err);
                return;
            }
            
            if (!row) {
                db.run(
                    'INSERT INTO usuarios (nombre, usuario, contrasena, rol, estado) VALUES (?, ?, ?, ?, ?)',
                    [user.nombre, user.usuario, user.contrasena, user.rol, user.estado],
                    err => {
                        if (err) {
                            console.error('Error inserting user:', err);
                        } else {
                            console.log('User created:', user.nombre);
                        }
                    }
                );
            }
        });
    });
}

module.exports = initializeData;