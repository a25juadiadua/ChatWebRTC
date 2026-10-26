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

    socket.on("nombre:ok", (nombre) => {

        let nombreOriginal = nombre;

        let nombreOcupado = false;

        nombre = nombre.trim().toLowerCase();

        Object.values(usuarios).forEach(element => {

            if(element.nombre.trim().toLowerCase() === nombre){
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

            
            

            console.log('Usuario:', usuarios[socket.id])
            socket.emit('nombre:ok');


            io.emit("usuario:lista:recibido", (usuarios));
    
        }
        nombreOcupado = false;
    });

    socket.on("usuario:lista:enviada", () => {

            
        socket.emit("usuario:lista:recibido", (usuarios));
    
    });


    socket.on("invitacion:chat:emisor", (nombreEmisor, nombreReceptor) => {

    for (const id in usuarios) {

        if (usuarios[id].nombre === nombreReceptor) {

            io.to(id).emit("invitacion:chat:receptor", nombreEmisor);

        }

    }

});

socket.on("invitacion:chat:aceptada", (nombreReceptor) => {

    for (const id in usuarios) {

        if (usuarios[id].nombre === nombreReceptor) {

            io.to(id).emit("invitacion:chat:aceptada");
            io.to(socket.id).emit("invitacion:chat:aceptada");

        }

    }
});

socket.on("invitacion:chat:rechazada", (nombreReceptor) => {

    for (const id in usuarios) {

        if (usuarios[id].nombre === nombreReceptor) {

            io.to(id).emit("invitacion:chat:rechazada");
        }

    }
});

    socket.on('disconnect', () =>{
    
        delete usuarios[socket.id];
    
        io.emit("usuario:lista:recibido", (usuarios));

        socket.emit("usuario:reload");

        console.log("Usuario desconectado");
    });
});


server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});