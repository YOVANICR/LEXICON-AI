/*
  Archivo: backend/src/shared/middleware/verify-token.middleware.js
  Propósito: Middleware de Express para proteger rutas. Verifica la presencia y validez de un
             JSON Web Token (JWT) en la cabecera de autorización de las peticiones entrantes.
*/

'use strict';

const jwt = require('jsonwebtoken');
const application_config = require('../config');

/**
 * Middleware para verificar un token JWT.
 * @param {import('express').Request} request - El objeto de la petición.
 * @param {import('express').Response} response - El objeto de la respuesta.
 * @param {import('express').NextFunction} next - La función para pasar al siguiente middleware.
 */
function verifyToken(request, response, next) {
  const authorization_header = request.headers.authorization;

  if (!authorization_header || !authorization_header.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
  }

  const token = authorization_header.split(' ')[1];

  try {
    const decoded_payload = jwt.verify(token, application_config.JWT_SECRET);
    
    // Adjuntamos los datos del usuario decodificados al objeto `request`.
    // Ahora, todos los siguientes middlewares y controladores en la cadena tendrán acceso a `request.user`.
    request.user = decoded_payload;
    
    // Pasamos el control al siguiente middleware o al controlador final de la ruta.
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return response.status(401).json({ message: 'Token ha expirado.' });
    }
    return response.status(401).json({ message: 'Token inválido.' });
  }
}

module.exports = verifyToken;