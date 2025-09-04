/*
  Archivo: backend/server.js
  Propósito: Punto de entrada principal para la aplicación del lado del servidor.
*/

'use strict';

const express = require('express');
const cors = require('cors');

const application_config = require('./src/shared/config');
const auth_module_routes = require('./src/modules/auth/auth.routes');
const users_module_routes = require('./src/modules/users/users.routes'); // <-- AÑADIDO
const documents_module_routes = require('./src/modules/documents/documents.routes'); // <-- AÑADIDO
const lexicon_module_routes = require('./src/modules/lexicon/lexicon.routes'); // <-- AÑADIDO

const express_application = express();

express_application.use(cors());
express_application.use(express.json());

// --- Montaje de TODOS los Enrutadores de la API ---
express_application.use('/api/auth', auth_module_routes);
express_application.use('/api/users', users_module_routes); // <-- AÑADIDO
express_application.use('/api/documents', documents_module_routes); // <-- AÑADIDO
express_application.use('/api/lexicon', lexicon_module_routes); // <-- AÑADIDO

express_application.use((error, request, response, next) => {
  console.error("MANEJADOR DE ERRORES GLOBAL DEL SERVIDOR:", error);
  response.status(500).json({ message: 'Ha ocurrido un error inesperado en el servidor.' });
});

try {
  express_application.listen(application_config.PORT, () => {
    console.log(`======================================================================`);
    console.log(`  LEXICON AI Backend corriendo en http://localhost:${application_config.PORT}`);
    console.log(`======================================================================`);
  });
} catch (server_start_error) {
  console.error('Error catastrófico al intentar iniciar el servidor Express.', server_start_error);
  process.exit(1);
}