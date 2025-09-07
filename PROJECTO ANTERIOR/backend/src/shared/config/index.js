/*
  Archivo: backend/src/shared/config/index.js
  Propósito: Carga, valida y centraliza todas las variables de entorno de la aplicación
             desde un archivo .env. Proporciona un único objeto de configuración inmutable
             para ser utilizado en todo el backend.
*/

'use strict';

const dotenv = require('dotenv');
const path = require('path');

// Carga el archivo .env ubicado en la raíz del proyecto backend.
// Es crucial hacerlo antes de que cualquier otra parte del código necesite las variables.
const load_environment_variables_result = dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

if (load_environment_variables_result.error) {
  console.warn("ADVERTENCIA: No se encontró el archivo .env. Se usarán valores por defecto. Para producción, este archivo es OBLIGATORIO.");
}

const application_config = {
  // Puerto en el que correrá el servidor. Se toma de las variables de entorno o se usa 3333 por defecto.
  PORT: process.env.PORT || 3333,
  
  // Clave secreta para firmar los JSON Web Tokens (JWT).
  // ¡OBLIGATORIO cambiar esto en producción por una cadena larga y segura!
  JWT_SECRET: process.env.JWT_SECRET || 'ESTA-ES-UNA-CLAVE-SECRETA-DE-DESARROLLO-NO-USAR-EN-PRODUCCION',
  
  // Duración de la validez de un token (ej. "1h", "7d").
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
};

// Se congela el objeto para prevenir modificaciones accidentales en otras partes del código.
module.exports = Object.freeze(application_config);