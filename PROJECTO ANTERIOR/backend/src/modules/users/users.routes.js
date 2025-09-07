/*
  Archivo: backend/src/modules/users/users.routes.js
  Propósito: Define las rutas de la API para el módulo de gestión de Perfil de Usuario.
             Estas rutas están protegidas y solo son accesibles para usuarios autenticados.
*/

'use strict';

const express = require('express');
const UsersController = require('./users.controller');
const verifyTokenMiddleware = require('../../shared/middleware/verify-token.middleware');

const users_router = express.Router();

// Ruta para obtener el perfil del usuario actualmente autenticado.
// GET /api/users/me
// 1. Primero se ejecuta el middleware `verifyToken`.
// 2. Si el token es válido, se pasa el control al `UsersController.getCurrentUserProfile`.
users_router.get('/me', verifyTokenMiddleware, UsersController.getCurrentUserProfile);

module.exports = users_router;