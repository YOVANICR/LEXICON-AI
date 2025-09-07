/*
  Archivo: backend/src/shared/persistence/file-system.adapter.js
  Propósito: Proporciona una capa de abstracción de bajo nivel para interactuar con el
             sistema de archivos. Envuelve las operaciones de FS en promesas y añade un
             manejo de errores robusto y centralizado.
*/

'use strict';

const fs = require('fs/promises'); // Usamos la versión basada en promesas del módulo 'fs'.
const path = require('path');

/**
 * Lee y parsea un archivo JSON de forma asíncrona.
 * @param {string} file_path - La ruta completa al archivo a leer.
 * @returns {Promise<Object|null>} Una promesa que resuelve con el objeto JSON parseado, o null si el archivo no existe.
 * @throws {Error} Si ocurre un error al leer o parsear el archivo.
 */
async function readJsonFile(file_path) {
  try {
    const file_content_as_string = await fs.readFile(file_path, 'utf8');
    return JSON.parse(file_content_as_string);
  } catch (error) {
    // Un error común es que el archivo no exista (ENOENT), lo cual es un caso de uso válido (ej. primer usuario).
    if (error.code === 'ENOENT') {
      return null; // Devolvemos null para indicar que el recurso no fue encontrado.
    }
    // Para cualquier otro error (ej. JSON malformado, permisos), lanzamos la excepción para que sea manejada arriba.
    console.error(`Error crítico al leer o parsear el archivo: ${file_path}`, error);
    throw new Error('Error de persistencia al intentar leer un archivo.');
  }
}

/**
 * Escribe datos en un archivo JSON de forma asíncrona, creando directorios si es necesario.
 * @param {string} file_path - La ruta completa al archivo a escribir.
 * @param {Object} data_to_write - El objeto JavaScript que será convertido a JSON y guardado.
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error durante la escritura.
 */
async function writeJsonFile(file_path, data_to_write) {
  try {
    const directory_path = path.dirname(file_path);
    // Asegurarse de que el directorio exista antes de intentar escribir el archivo.
    await fs.mkdir(directory_path, { recursive: true });
    
    const data_as_json_string = JSON.stringify(data_to_write, null, 2); // El '2' es para indentación bonita (pretty-print).
    await fs.writeFile(file_path, data_as_json_string, 'utf8');
  } catch (error) {
    console.error(`Error crítico al escribir en el archivo: ${file_path}`, error);
    throw new Error('Error de persistencia al intentar escribir un archivo.');
  }
}

module.exports = {
  readJsonFile,
  writeJsonFile,
};