/* ==========================================================================
   Archivo: backend/src/lexicon/lexicon.repository.js
   Propósito: Abstracción de la capa de datos. Lee y escribe en database.json.
   ========================================================================== */

const fs = require('fs');
const path = require('path');

// La ruta a la BD ahora es relativa a este archivo.
const DB_PATH = path.join(__dirname, '../data/database.json');

function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return data ? JSON.parse(data) : { docs: [], lexicon: {} };
    }
    return { docs: [], lexicon: {} };
  } catch (error) {
    console.error("Error crítico al leer la base de datos:", error);
    throw new Error('No se pudo leer o parsear el archivo de la base de datos.');
  }
}

function writeDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error crítico al escribir en la base de datos:", error);
    throw new Error('No se pudo escribir en el archivo de la base de datos.');
  }
}

function getDbStats() {
    if (fs.existsSync(DB_PATH)) {
        return fs.statSync(DB_PATH);
    }
    return null;
}

module.exports = {
  readDB,
  writeDB,
  getDbStats,
};
