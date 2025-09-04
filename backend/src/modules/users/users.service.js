/*
  Archivo: backend/src/modules/users/users.service.js
  Propósito: (Capa de Lógica de Negocio) Contiene la lógica pura para la gestión de perfiles
             de usuario. Orquesta las operaciones con el repositorio de usuarios.
*/

'use strict';

// Importaremos el repositorio de usuarios cuando lo creemos en el siguiente paso.
// const UsersRepository = require('./users.repository');

/**
 * Obtiene los datos del perfil de un usuario por su ID.
 * @param {string} user_id - El ID del usuario cuyo perfil se quiere obtener.
 * @returns {Promise<Object>} El objeto del perfil del usuario.
 * @throws {Error} Si el perfil del usuario no se encuentra.
 */
async function getUserProfileById(user_id) {
  console.log(`Servicio de Usuarios: Buscando perfil para el ID ${user_id}`);
  
  // const user_profile = await UsersRepository.findProfileByUserId(user_id);
  // if (!user_profile) {
  //   throw new Error('Perfil de usuario no encontrado.');
  // }
  // return user_profile;
  
  // --- Placeholder hasta que creemos el repositorio ---
  // Simulamos la búsqueda de un perfil.
  const placeholder_profile = {
    id: user_id,
    name: 'Usuario de Prueba',
    theme: 'dark',
    language: 'es',
    memberSince: new Date().toISOString()
  };
  return placeholder_profile;
}

module.exports = {
  getUserProfileById,
};