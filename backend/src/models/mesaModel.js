const db = require('../../config/database');

class MesaModel {
    // Obtener todas las mesas con sus meseros asignados
    static async getAll() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    m.*,
                    u.nombre as mesero_nombre,
                    u.id as mesero_id,
                    o.id as orden_actual
                FROM mesas m
                LEFT JOIN usuarios u ON m.mesero_id = u.id
                LEFT JOIN ordenes o ON m.id = o.mesa_id AND o.estado = 'activa'
            `;
            
            db.all(query, [], (err, rows) => {
                if (err) return reject(err);
                
                // Ensure we return valid JSON data
                const mesas = rows.map(mesa => ({
                    id: mesa.id,
                    numero: mesa.numero,
                    capacidad: mesa.capacidad,
                    estado: mesa.estado,
                    ubicacion: mesa.ubicacion,
                    mesero_id: mesa.mesero_id || null,
                    mesero_nombre: mesa.mesero_nombre || null,
                    orden_actual: mesa.orden_actual || null
                }));
                
                resolve(mesas);
            });
        });
    }

    // Obtener una mesa específica
    static async getById(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    m.*,
                    u.nombre as mesero_nombre,
                    u.id as mesero_id,
                    o.id as orden_actual
                FROM mesas m
                LEFT JOIN usuarios u ON m.mesero_id = u.id
                LEFT JOIN ordenes o ON m.id = o.mesa_id AND o.estado = 'activa'
                WHERE m.id = ?
            `;

            db.get(query, [id], (err, mesa) => {
                if (err) return reject(err);
                if (!mesa) return resolve(null);
                
                // Format mesa data
                resolve({
                    id: mesa.id,
                    numero: mesa.numero,
                    capacidad: mesa.capacidad,
                    estado: mesa.estado,
                    ubicacion: mesa.ubicacion,
                    mesero_id: mesa.mesero_id || null,
                    mesero_nombre: mesa.mesero_nombre || null,
                    orden_actual: mesa.orden_actual || null
                });
            });
        });
    }

    // Asignar mesero a mesa
    static async asignarMesero(mesaId, meseroId, usuarioActual) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE mesas 
                SET mesero_id = ?,
                    estado = CASE 
                        WHEN estado = 'disponible' THEN 'disponible'
                        ELSE estado 
                    END,
                    actualizado_por = ?,
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [meseroId, usuarioActual, mesaId],
                function(err) {
                    if (err) return reject(err);
                    resolve({ changes: this.changes });
                }
            );
        });
    }

    // Actualizar estado de mesa
    static async actualizarEstado(mesaId, estado, usuarioActual) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE mesas 
                SET estado = ?,
                    mesero_id = CASE 
                        WHEN ? = 'disponible' THEN NULL 
                        ELSE mesero_id 
                    END,
                    actualizado_por = ?,
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [estado, estado, usuarioActual, mesaId],
                function(err) {
                    if (err) return reject(err);
                    resolve({ changes: this.changes });
                }
            );
        });
    }
}

module.exports = MesaModel;