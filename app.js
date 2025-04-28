const express = require('express');
const verifyToken = require('./src/middlewares/verifyToken');  // Middleware para verificar el token
const routeSelector = require('./src/middlewares/routeSelector');  // Middleware para seleccionar la ruta

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware de verificación de token
app.use(verifyToken);

// Middleware de selección de ruta
app.use(routeSelector);


app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


