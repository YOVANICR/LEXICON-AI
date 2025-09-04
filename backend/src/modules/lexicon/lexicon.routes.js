/*
  Archivo: backend/src/modules/lexicon/lexicon.routes.js
  Propósito: Define las rutas de la API para el módulo de Léxico del usuario.
*/

'use strict';

const express = require('express');
const LexiconController = require('./lexicon.controller'); // <-- AHORA SÍ SE USA
const verifyTokenMiddleware = require('../../shared/middleware/verify-token.middleware');

const lexicon_router = express.Router();

// GET /api/lexicon
lexicon_router.get('/', verifyTokenMiddleware, LexiconController.getLexiconForCurrentUser);

// POST /api/lexicon
lexicon_router.post('/', verifyTokenMiddleware, LexiconController.saveLexiconForCurrentUser);

module.exports = lexicon_router;