/*
  Archivo: backend/src/modules/users/users.repository.js
  Propósito: (Capa de Datos) Proporciona acceso directo a los datos del perfil de un usuario.
             Sabe cómo construir la ruta al archivo `profile.json` de un usuario específico
             y utiliza el FileSystemAdapter para leerlo y escribirlo.
*/

'use strict';

const path = require('path');
const FileSystemAdapter = require('../../shared/persistence/file-system.adapter');

/**
 * @private
 * Construye la ruta al archivo de perfil para un ID de usuario dado.
 * @param {string} user_id - El ID del usuario.
 * @returns {string} La ruta completa al archivo profile.json del usuario.
 */
function getProfileFilePathForUser(user_id) {
  return path.resolve(__dirname, `../../../database-local/user-data/${user_id}/profile.json`);
}

/**
 * Busca y devuelve el perfil de un usuario por su ID.
 * @param {string} user_id - El ID del usuario.
 * @returns {Promise<Object|null>} El objeto del perfil del usuario o null si no se encuentra.
 */
async function findProfileByUserId(user_id) {
  const profile_file_path = getProfileFilePathForUser(user_id);
  const user_profile = await FileSystemAdapter.readJsonFile(profile_file_path);
  return user_profile;
}

/**
 * Crea o actualiza el perfil de un usuario.
 * @param {string} user_id - El ID del usuario.
 * @param {Object} profile_data - Los datos del perfil a guardar.
 * @returns {Promise<Object>} Los datos del perfil que fueron guardados.
 */
async function saveProfileForUserId(user_id, profile_data) {
  const profile_file_path = getProfileFilePathForUser(user_id);
  await FileSystemAdapter.writeJsonFile(profile_file_path, profile_data);
  return profile_data;
}

module.exports = {
  findProfileByUserId,
  saveProfileForUserId,
};