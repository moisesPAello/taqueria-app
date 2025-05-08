const MesaModel = require('../models/mesaModel');

class MesaController {
    // Obtener todas las mesas
    static async getMesas(req, res) {
        try {
            const mesas = await MesaModel.getAll();
            res.json(mesas || []);
        } catch (err) {
            console.error('Error al obtener mesas:', err);
            res.status(500).json({ error: 'Error al obtener las mesas' });
        }
    }

    // Obtener una mesa específica
    static async getMesa(req, res) {
        try {
            const { id } = req.params;
            const mesa = await MesaModel.getById(id);
            
            if (!mesa) {
                return res.status(404).json({ error: 'Mesa no encontrada' });
            }
            
            res.json(mesa);
        } catch (err) {
            console.error('Error al obtener mesa:', err);
            res.status(500).json({ error: 'Error al obtener la mesa' });
        }
    }

    // Asignar mesero a mesa
    static async asignarMesero(req, res) {
        try {
            const { id } = req.params;
            const { meseroId } = req.body;
            
            if (!meseroId) {
                return res.status(400).json({ error: 'Se requiere el ID del mesero' });
            }

            const usuarioActual = req.user?.id || 1; // Fallback para desarrollo
            
            const result = await MesaModel.asignarMesero(id, meseroId, usuarioActual);
            
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Mesa no encontrada' });
            }
            
            res.json({ message: 'Mesero asignado exitosamente', mesaId: id, meseroId });
        } catch (err) {
            console.error('Error al asignar mesero:', err);
            res.status(500).json({ error: 'Error al asignar mesero' });
        }
    }

    // Actualizar estado de mesa
    static async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const usuarioActual = req.user?.id || 1; // Fallback para desarrollo

            if (!['disponible', 'ocupada', 'en_servicio', 'mantenimiento'].includes(estado)) {
                return res.status(400).json({ error: 'Estado no válido' });
            }
            
            const result = await MesaModel.actualizarEstado(id, estado, usuarioActual);
            
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Mesa no encontrada' });
            }
            
            res.json({ message: 'Estado actualizado exitosamente', mesaId: id, estado });
        } catch (err) {
            console.error('Error al actualizar estado:', err);
            res.status(500).json({ error: 'Error al actualizar estado' });
        }
    }
}

module.exports = MesaController;