/*
  Archivo: backend/src/modules/auth/auth.repository.js
  Propósito: (Capa de Datos) Abstrae el acceso a los datos de los usuarios.
*/

'use strict';

const path = require('path');
// RUTA CORREGIDA: Se ha eliminado un '../' extra.
const FileSystemAdapter = require('../shared/persistence/file-system.adapter');

const USERS_INDEX_FILE_PATH = path.resolve(__dirname, '../../../database-local/index/users.index.json');

async function findUserByEmail(user_email) {
  const all_users = await FileSystemAdapter.readJsonFile(USERS_INDEX_FILE_PATH);
  
  if (!all_users || !Array.isArray(all_users)) {
    return null;
  }
  
  const found_user = all_users.find(user => user.email === user_email);
  return found_user || null;
}

async function createUser(new_user_data) {
  let all_users = await FileSystemAdapter.readJsonFile(USERS_INDEX_FILE_PATH) || [];
  all_users.push(new_user_data);
  await FileSystemAdapter.writeJsonFile(USERS_INDEX_FILE_PATH, all_users);
  return new_user_data;
}

module.exports = {
  findUserByEmail,
  createUser,
};