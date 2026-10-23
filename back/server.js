const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
let listaPublica = new Map();
const PORT = 3000;

const usuarios = {};

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
});






io.on('connection', (socket) => {

    socket.on("nombre:ok", (nombre) => {

        let nombreOriginal = nombre;

        let nombreOcupado = false;

        nombre = nombre.trim().toLowerCase();

        Object.values(usuarios).forEach(element => {

            if(element.nombre === nombre){
                nombreOcupado= true;
            }

        });

        if(nombre.length < 3){
            console.log("Ha caido en el error 1");
            socket.emit("nombre:error", 'El nombre ha de tener minimo 3 caracteres');
        }else if(nombreOcupado){
            console.log("Ha caido en el error 2");
            socket.emit("nombre:error", 'El nombre de usuario se esta usando ahora mismo');
        }else{
            usuarios[socket.id] = {
                nombre: nombreOriginal,
                estado: true
            }

            listaPublica = Object.values(usuarios).map(usuario => ({
                nombre: usuario.nombre,
                estado: usuario.estado
            }));

            console.log('Usuario:', usuarios[socket.id])
            socket.emit('nombre:ok');


            io.emit("usuario:lista:recibido", (listaPublica));
    
        }
        nombreOcupado = false;
    });

    socket.on("usuario:lista:enviada", () => {

        listaPublica = Object.values(usuarios).map(usuario => ({
                nombre: usuario.nombre,
                estado: usuario.estado
            }));
            
        socket.emit("usuario:lista:recibido", (listaPublica));
    
    });
});


server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});