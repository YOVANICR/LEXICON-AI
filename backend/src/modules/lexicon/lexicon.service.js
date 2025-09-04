/*
  Archivo: backend/src/modules/lexicon/lexicon.service.js
  Propósito: (Capa de Lógica de Negocio) Contiene la lógica para la gestión
             del léxico de un usuario.
*/

'use strict';

const LexiconRepository = require('./lexicon.repository');

/**
 * Obtiene el léxico de un usuario por su ID.
 * @param {string} user_id - El ID del usuario.
 * @returns {Promise<Object>} El objeto del léxico del usuario.
 */
async function getLexiconByUserId(user_id) {
  const user_lexicon = await LexiconRepository.findLexiconByUserId(user_id);
  // Si el usuario no tiene léxico, devolvemos un objeto vacío en lugar de null para consistencia.
  return user_lexicon || {};
}

/**
 * Guarda el léxico completo para un usuario.
 * @param {string} user_id - El ID del usuario.
 * @param {Object} lexicon_data - El objeto de léxico a guardar.
 * @returns {Promise<void>}
 */
async function saveLexiconForUserId(user_id, lexicon_data) {
  await LexiconRepository.saveLexicon(user_id, lexicon_data);
}

module.exports = {
  getLexiconByUserId,
  saveLexiconForUserId,
};