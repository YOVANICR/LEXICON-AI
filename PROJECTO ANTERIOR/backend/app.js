/* ==========================================================================
   Archivo: backend/app.js
   Propósito: Punto de entrada principal del servidor Express.
   ========================================================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');
const lexiconRoutes = require('./src/lexicon/lexicon.routes');

const app = express();
const PORT = 3333;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Rutas de la API ---
// Se definen ANTES de servir los archivos estáticos para que tengan prioridad.
app.use('/api', lexiconRoutes);

// --- Servir el Frontend ---
// Le decimos a Express que sirva todos los archivos estáticos desde la carpeta 'frontend'.
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Manejo de rutas del Frontend (Catch-all) ---
// **CORRECCIÓN DEFINITIVA: Se usa una expresión regular en lugar de '*'**
// Esto es compatible con el analizador de rutas estricto de Express 5.
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`======================================================================`);
  console.log(`  LEXICON AI Backend corriendo en http://localhost:${PORT}`);
  console.log(`  Sirviendo frontend desde la carpeta 'frontend'`);
  console.log(`  API disponible en /api/...`);
  console.log(`======================================================================`);
});