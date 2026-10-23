const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const PORT = 3000;

const usuarios = {};

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
});

io.on('connection', (socket) => {

});


server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});