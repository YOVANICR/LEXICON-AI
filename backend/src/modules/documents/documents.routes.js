/*
  Archivo: backend/src/modules/documents/documents.routes.js
  Propósito: Define las rutas de la API para el módulo de Documentos.
             Estas rutas permiten a los usuarios autenticados obtener la lista
             de sus documentos y subir nuevos textos.
*/

'use strict';

const express = require('express');
const DocumentsController = require('./documents.controller');
const verifyTokenMiddleware = require('../../shared/middleware/verify-token.middleware');

const documents_router = express.Router();

// GET /api/documents
// Obtiene la lista de todos los documentos del usuario autenticado.
documents_router.get('/', verifyTokenMiddleware, DocumentsController.getAllDocumentsForCurrentUser);

// POST /api/documents/upload
// Sube un nuevo documento para el usuario autenticado.
// (En el futuro, se podría usar 'multer' aquí para manejar la subida de archivos)
documents_router.post('/upload', verifyTokenMiddleware, DocumentsController.uploadNewDocument);

module.exports = documents_router;