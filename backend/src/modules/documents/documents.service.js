/*
  Archivo: backend/src/modules/documents/documents.service.js
  Propósito: (Capa de Lógica de Negocio) Contiene la lógica para la gestión
             de documentos, como la creación y recuperación de los mismos.
*/

'use strict';

const DocumentsRepository = require('./documents.repository');

/**
 * Obtiene la lista de todos los documentos para un usuario específico.
 * @param {string} user_id - El ID del usuario.
 * @returns {Promise<Array>} Una lista de los documentos del usuario.
 */
async function getDocumentsByUserId(user_id) {
  const documents = await DocumentsRepository.findAllDocumentsByUserId(user_id);
  return documents;
}

/**
 * Crea un nuevo documento y lo asocia a un usuario.
 * @param {string} user_id - El ID del usuario.
 * @param {Object} document_data - Contiene el título y el texto del documento.
 * @returns {Promise<Object>} El documento recién creado.
 */
async function createNewDocumentForUser(user_id, document_data) {
  const new_document = await DocumentsRepository.createDocument(user_id, document_data);
  return new_document;
}

module.exports = {
  getDocumentsByUserId,
  createNewDocumentForUser,
};