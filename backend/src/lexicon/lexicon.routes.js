/* ==========================================================================
   Archivo: backend/src/lexicon/lexicon.routes.js
   Propósito: Define las rutas de la API para el módulo Lexicon.
   ========================================================================== */

const express = require('express');
const controller = require('./lexicon.controller');
const router = express.Router();

// Define las rutas y las asocia con las funciones del controlador
router.get('/database', controller.getDatabase);
router.post('/database', controller.saveDatabase);
router.get('/database-version', controller.getDatabaseVersion);

module.exports = router;
