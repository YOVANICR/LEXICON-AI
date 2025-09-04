/*
  Archivo: backend/src/modules/auth/auth.service.js
  Propósito: (Capa de Lógica de Negocio) Contiene la lógica pura y las reglas de negocio
             para la autenticación. Se encarga del hasheo de contraseñas, la generación
             y verificación de tokens JWT, y orquesta las operaciones con el repositorio.
*/

'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AuthenticationRepository = require('./auth.repository');
const application_config = require('../../shared/config');

/**
 * Registra un nuevo usuario en el sistema.
 * @param {Object} user_data - Contiene el email y la contraseña del usuario.
 * @returns {Promise<Object>} El objeto del usuario recién creado (sin la contraseña).
 * @throws {Error} Si el usuario ya existe.
 */
async function registerNewUser(user_data) {
  const { email, password } = user_data;

  // 1. Verificar si el usuario ya existe para evitar duplicados.
  const existing_user = await AuthenticationRepository.findUserByEmail(email);
  if (existing_user) {
    throw new Error('Un usuario con este email ya existe.');
  }

  // 2. Hashear la contraseña antes de guardarla. Nunca guardes contraseñas en texto plano.
  const salt = await bcrypt.genSalt(10);
  const hashed_password = await bcrypt.hash(password, salt);

  // 3. Crear el nuevo objeto de usuario.
  const new_user_object = {
    id: `user_${crypto.randomUUID()}`,
    email,
    hashedPassword: hashed_password,
    role: 'free-tier' // Rol por defecto para nuevos usuarios.
  };

  // 4. Pedir al repositorio que guarde el nuevo usuario.
  const created_user = await AuthenticationRepository.createUser(new_user_object);
  
  // No devolver la contraseña hasheada.
  delete created_user.hashedPassword; 
  return created_user;
}

/**
 * Autentica a un usuario y le proporciona un token JWT.
 * @param {Object} user_credentials - Contiene el email y la contraseña.
 * @returns {Promise<{token: string, user: Object}>} El token y los datos del usuario.
 * @throws {Error} Si las credenciales son inválidas.
 */
async function loginUser(user_credentials) {
  const { email, password } = user_credentials;

  // 1. Buscar al usuario por su email.
  const user_found = await AuthenticationRepository.findUserByEmail(email);
  if (!user_found) {
    throw new Error('Credenciales inválidas.'); // Mensaje genérico por seguridad.
  }
  
  // 2. Comparar la contraseña proporcionada con la hasheada en la base de datos.
  const is_password_match = await bcrypt.compare(password, user_found.hashedPassword);
  if (!is_password_match) {
    throw new Error('Credenciales inválidas.');
  }

  // 3. Si las credenciales son correctas, generar un token JWT.
  const jwt_payload = {
    id: user_found.id,
    email: user_found.email,
    role: user_found.role
  };
  
  const jwt_token = jwt.sign(jwt_payload, application_config.JWT_SECRET, {
    expiresIn: application_config.JWT_EXPIRES_IN
  });
  
  // 4. Devolver el token y los datos del usuario (sin la contraseña).
  delete user_found.hashedPassword;
  return { token: jwt_token, user: user_found };
}

module.exports = {
  registerNewUser,
  loginUser,
};