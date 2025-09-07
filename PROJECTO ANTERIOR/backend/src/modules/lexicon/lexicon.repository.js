/*
  Archivo: backend/src/modules/lexicon/lexicon.repository.js
  Propósito: (Capa de Datos) Abstrae el acceso al archivo lexicon.json de un usuario.
             Es la única parte de la aplicación que interactúa directamente con este archivo.
*/

'use strict';

const path = require('path');
const FileSystemAdapter = require('../../shared/persistence/file-system.adapter');

/**
 * @private
 * Construye la ruta al archivo lexicon.json para un ID de usuario dado.
 * @param {string} user_id - El ID del usuario.
 * @returns {string} La ruta completa al archivo.
 */
function getLexiconFilePathForUser(user_id) {
  return path.resolve(__dirname, `../../../database-local/user-data/${user_id}/lexicon.json`);
}

/**
 * Busca y devuelve el léxico de un usuario por su ID.
 * @param {string} user_id - El ID del usuario.
 * @returns {Promise<Object|null>} El objeto del léxico o null si no se encuentra.
 */
async function findLexiconByUserId(user_id) {
  const lexicon_file_path = getLexiconFilePathForUser(user_id);
  const user_lexicon = await FileSystemAdapter.readJsonFile(lexicon_file_path);
  return user_lexicon;
}

/**
 * Guarda el objeto de léxico completo para un usuario.
 * @param {string} user_id - El ID del usuario.
 * @param {Object} lexicon_data - El léxico a guardar.
 * @returns {Promise<void>}
 */
async function saveLexicon(user_id, lexicon_data) {
  const lexicon_file_path = getLexiconFilePathForUser(user_id);
  await FileSystemAdapter.writeJsonFile(lexicon_file_path, lexicon_data);
}

module.exports = {
  findLexiconByUserId,
  saveLexicon,
};