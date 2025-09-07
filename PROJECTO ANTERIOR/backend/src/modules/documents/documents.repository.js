/*
  Archivo: backend/src/modules/documents/documents.repository.js
  Propósito: (Capa de Datos) Abstrae el acceso a la carpeta de documentos de un usuario.
             Sabe cómo leer la lista de archivos de documentos y cómo crear nuevos archivos.
*/

'use strict';

const path = require('path');
const crypto = require('crypto');
const fs = require('fs/promises'); // Usamos fs/promises para operaciones asíncronas.

/**
 * @private
 * Construye la ruta a la carpeta de documentos de un usuario.
 * @param {string} user_id - El ID del usuario.
 * @returns {string} La ruta a la carpeta.
 */
function getDocumentsDirectoryForUser(user_id) {
  return path.resolve(__dirname, `../../../database-local/user-data/${user_id}/documents`);
}

/**
 * Encuentra todos los documentos de un usuario leyendo su directorio.
 * @param {string} user_id - El ID del usuario.
 * @returns {Promise<Array>} Una lista de objetos de documento.
 */
async function findAllDocumentsByUserId(user_id) {
  const documents_directory = getDocumentsDirectoryForUser(user_id);
  try {
    const document_files = await fs.readdir(documents_directory);
    // Por ahora, solo devolvemos los nombres. Una implementación más completa leería
    // metadatos de cada archivo.
    return document_files.map(file => ({ id: file.replace('.txt', ''), title: file.replace('.txt', '') }));
  } catch (error) {
    if (error.code === 'ENOENT') return []; // Si el directorio no existe, el usuario no tiene documentos.
    throw error;
  }
}

/**
 * Crea un nuevo archivo de documento para un usuario.
 * @param {string} user_id - El ID del usuario.
 * @param {Object} document_data - Contiene el título y el texto.
 * @returns {Promise<Object>} El objeto del documento creado.
 */
async function createDocument(user_id, document_data) {
  const documents_directory = getDocumentsDirectoryForUser(user_id);
  await fs.mkdir(documents_directory, { recursive: true });

  const document_id = `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const file_path = path.join(documents_directory, `${document_id}.txt`);
  
  await fs.writeFile(file_path, document_data.text, 'utf8');
  
  return {
    id: document_id,
    title: document_data.title,
  };
}

module.exports = {
  findAllDocumentsByUserId,
  createDocument,
};