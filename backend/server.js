/*
  Archivo: backend/server.js
  Propósito: Punto de entrada principal para la aplicación del lado del servidor.
             Este archivo es responsable de inicializar el servidor Express, cargar la configuración,
             aplicar middlewares globales, y montar los enrutadores de todos los módulos.
*/

'use strict';

// --- Dependencias del Núcleo ---
const express = require('express');
const cors = require('cors');
const path = require('path');

// --- Módulos de la Aplicación ---
// Se importan los enrutadores de cada módulo de negocio.
const lexiconRoutes = require('./src/lexicon/lexicon.routes');

// ==========================================================================
// ANÁLISIS DE ERRORES Y SOLUCIÓN TEMPORAL
// ==========================================================================
// ERROR IDENTIFICADO: El frontend (backend-api.service.js) intenta hacer una petición a '/api/database'.
//                     Esta ruta no existe en la nueva arquitectura modular.
// SOLUCIÓN TEMPORAL: Se crea un manejador de ruta aquí mismo para responder a esa petición específica
//                    y devolver los datos iniciales, tal como lo hacía el backend antiguo.
//                    Esto permite que el frontend funcione sin necesidad de refactorizarlo inmediatamente.
// SOLUCIÓN A LARGO PLAZO: Modificar 'backend-api.service.js' para que llame a los endpoints
//                       modulares por separado (ej. /api/documents, /api/lexicon).
// ==========================================================================

// --- Inicialización de Express ---
const app = express();
const PORT = 3333;

// --- Middlewares Globales ---
// Habilita CORS para permitir peticiones desde el frontend.
app.use(cors());
// Habilita el parseo de cuerpos de petición en formato JSON.
app.use(express.json({ limit: '10mb' }));

// --- Montaje de Rutas de la API ---
// Se monta el enrutador del módulo 'lexicon' bajo el prefijo '/api'.
// Esto significa que las rutas definidas en 'lexicon.routes.js' (como '/database')
// serán accesibles como '/api/database'.
app.use('/api', lexiconRoutes);

// --- Servidor de Archivos Estáticos del Frontend ---
// Sirve todos los archivos de la carpeta 'frontend'.
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Ruta "Catch-all" para Single-Page Application (SPA) ---
// Cualquier petición GET que no coincida con una ruta de la API o un archivo estático,
// devolverá el 'index.html', permitiendo el enrutamiento del lado del cliente.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/workspace-reader.html'));
});

// --- Arranque del Servidor ---
app.listen(PORT, () => {
  console.log('======================================================================');
  console.log(`  LEXICON AI Backend corriendo en http://localhost:${PORT}`);
  console.log('======================================================================');
});