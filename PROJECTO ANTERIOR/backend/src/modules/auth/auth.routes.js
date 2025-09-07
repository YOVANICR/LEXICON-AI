/*
  Archivo: backend/src/modules/auth/auth.routes.js
  Propósito: Define las rutas de la API para el módulo de Autenticación.
             Este enrutador expone los endpoints públicos para que los usuarios
             puedan registrarse e iniciar sesión en la aplicación.
*/

'use strict';

const express = require('express');
const AuthenticationController = require('./auth.controller');

const authentication_router = express.Router();

// Ruta para registrar un nuevo usuario.
// POST /api/auth/register
authentication_router.post('/register', AuthenticationController.registerNewUser);

// Ruta para que un usuario inicie sesión y obtenga un token.
// POST /api/auth/login
authentication_router.post('/login', AuthenticationController.authenticateUser);

module.exports = authentication_router;