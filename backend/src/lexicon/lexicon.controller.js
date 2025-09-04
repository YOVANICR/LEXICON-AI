/* ==========================================================================
   Archivo: backend/src/lexicon/lexicon.controller.js
   Propósito: Maneja la lógica de las peticiones para el módulo Lexicon.
   ========================================================================== */

const repository = require('./lexicon.repository');

function getDatabase(req, res) {
  try {
    const db = repository.readDB();
    res.status(200).json(db);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor al leer la base de datos.', error: error.message });
  }
}

function saveDatabase(req, res) {
  const dbState = req.body;
  if (!dbState || typeof dbState.docs === 'undefined' || typeof dbState.lexicon === 'undefined') {
    return res.status(400).json({ message: 'El estado de la base de datos es inválido.' });
  }
  
  try {
    repository.writeDB(dbState);
    console.log(`[Servidor] Base de datos actualizada.`);
    res.status(200).json({ message: 'Base de datos guardada correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor al guardar la base de datos.', error: error.message });
  }
}

function getDatabaseVersion(req, res) {
    try {
        const stats = repository.getDbStats();
        if (stats) {
            res.status(200).json({ lastModified: stats.mtime.getTime() });
        } else {
            res.status(200).json({ lastModified: 0 });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la versión de la base de datos.', error: error.message });
    }
}

// Se elimina la ruta /api/add-phrase ya que no se usa en el frontend actual
// Si se necesitara, se añadiría aquí de forma similar.

module.exports = {
  getDatabase,
  saveDatabase,
  getDatabaseVersion,
};
