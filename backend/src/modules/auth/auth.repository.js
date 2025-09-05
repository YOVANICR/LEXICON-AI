/*
  Archivo: backend/src/modules/auth/auth.repository.js
  Propósito: (Capa de Datos) Abstrae el acceso a los datos de los usuarios. Es el único
             módulo que sabe CÓMO y DÓNDE se almacenan los datos de los usuarios.
*/

'use strict';

const path = require('path');

// ==========================================================================
// ANÁLISIS DE ERRORES Y SOLUCIÓN
// ==========================================================================
// ERROR IDENTIFICADO: El servidor fallaba con "Cannot find module" porque esta ruta era incorrecta.
// SOLUCIÓN: Se ha corregido la ruta para que suba dos niveles (`../../`) desde la carpeta `auth`
//          hasta `src`, y luego entre a `shared/config/persistence`, como se define en el mapa del proyecto.
// ==========================================================================
const FileSystemAdapter = require('../../shared/config/persistence/file-system.adapter.js');

const USERS_INDEX_FILE_PATH = path.resolve(__dirname, '../../../database-local/index/users.index.json');

// ... (El resto del código funcional se mantiene igual)
async function findUserByEmail(user_email) {
  const all_users = await FileSystemAdapter.readJsonFile(USERS_INDEX_FILE_PATH);
  if (!all_users || !Array.isArray(all_users)) {
    return null;
  }
  return all_users.find(user => user.email === user_email) || null;
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