
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import socket from '../socket';
import { useRouter } from 'vue-router';

let conexion = null;
let canal = null;
const rolChat = localStorage.getItem('rolChat');
const router = useRouter();

const nombreUsuario = localStorage.getItem('nombreUsuario');
const nombreOtroUsuario = localStorage.getItem('nombreOtroUsuario');

const mensaje = ref('');
const mensajes = ref([]);
const conectado = ref(socket.connected);



function crearConexion() {
    conexion = new RTCPeerConnection();

    conexion.onicecandidate = (evento) => {
    if (evento.candidate) {
        socket.emit("webrtc:candidato", {
            candidato: evento.candidate,
            nombreDestino: nombreOtroUsuario
        });
    }
};

    if(rolChat === "emisor"){
        canal = conexion.createDataChannel("chat");
        prepararCanal();
    }else{

        conexion.ondatachannel = (evento) =>  {
            canal = evento.channel;
            prepararCanal();
            
        }

    }


    
    console.log("Conexión WebRTC creada");
}

function prepararCanal(){
    canal.onopen = () =>{
        console.log("Canal abierto");
    }

    canal.onclose = () =>{
        console.log("Canal cerrado");
    }
}



// Recibir mensajes del chat
function recibirMensaje(texto, nombreEmisor, hora, minutos) {
    mensajes.value.push({
        texto,
        nombre: nombreEmisor,
        hora: `${hora}:${String(minutos).padStart(2, '0')}`
    });
}

// Enviar mensaje
function enviarMensaje() {
    if (mensaje.value.trim() === '') {
        return;
    }

    // En el siguiente paso conectaremos aquí
    // el envío real del mensaje.
    
    mensaje.value = '';
}

function alConectar() {
    conectado.value = true;
}

function alDesconectar() {
    conectado.value = false;
}

onMounted(() => {
    
    crearConexion();
    
    socket.on('connect', alConectar);
    socket.on('disconnect', alDesconectar);
    socket.on('chat:message', recibirMensaje);
    
    
    async function crearOferta() {
        const oferta = await conexion.createOffer();
        
        await conexion.setLocalDescription(oferta);
        
        socket.emit('webrtc:oferta', {
            oferta,
            nombreDestino: nombreOtroUsuario
        });
    }  
    
    if(rolChat === "receptor"){
        socket.on("webrtc:oferta", async (datos) => {
            
            await conexion.setRemoteDescription(datos.oferta);
            
            const respuesta = await conexion.createAnswer();
            
            await conexion.setLocalDescription(respuesta);
    
            socket.emit("webrtc:respuesta", {
                respuesta,
                nombreDestino: datos.nombreEmisor
            });
    
        });
    }else{
        socket.on("webrtc:respuesta", async (datos) => {
            await conexion.setRemoteDescription(datos.respuesta);
        });
    }

    socket.on("webrtc:candidato", async (datos) => {
    try {
        await conexion.addIceCandidate(datos.candidato);
    } catch (error) {
        console.error("Error al añadir candidato ICE:", error);
    }
});


    if(rolChat === "emisor"){
        crearOferta();
    }
});

onBeforeUnmount(() => {
    socket.off('connect', alConectar);
    socket.off('disconnect', alDesconectar);
    socket.off('chat:message', recibirMensaje);
    socket.off("webrtc:oferta");
    socket.off("webrtc:respuesta");
    socket.off("webrtc:candidato");


});
</script>

<template>
    <div class="container py-5">
        <div class="card shadow mx-auto" style="max-width: 750px;">

            <div class="card-header bg-primary text-white">
                <h4 class="mb-1">💬 Chat WebRTC</h4>

                <div class="d-flex justify-content-between align-items-center">
                <span>{{ nombreUsuario }} hablando con {{ nombreOtroUsuario }}</span>
                    <span>
                        {{ conectado ? 'Conectado' : 'Desconectado' }}
                    </span>
                </div>
            </div>

            <div class="card-body chat-mensajes">
                <div
                    v-for="(item, index) in mensajes"
                    :key="index"
                    class="mb-3"
                    :class="item.nombre === nombreUsuario
                        ? 'text-end'
                        : 'text-start'"
                >
                    <div
                        class="d-inline-block rounded p-2"
                        :class="item.nombre === nombreUsuario
                            ? 'bg-primary-subtle'
                            : 'bg-success-subtle'"
                    >
                        <strong>{{ item.nombre }}:</strong>
                        {{ item.texto }}

                        <div class="small text-muted">
                            {{ item.hora }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="card-footer">
                <form class="d-flex gap-2" @submit.prevent="enviarMensaje">
                    <input
                        v-model="mensaje"
                        class="form-control"
                        placeholder="Escribe un mensaje..."
                        maxlength="500"
                        :disabled="!conectado"
                    >

                    <button
                        class="btn btn-primary"
                        type="submit"
                        :disabled="!conectado"
                    >
                        Enviar
                    </button>
                </form>
            </div>

            <div class="card-footer text-end">
                <button
                    class="btn btn-outline-secondary btn-sm"
                    @click="router.push('/users')"
                >
                    Volver a usuarios
                </button>
            </div>

        </div>
    </div>
</template>

<style scoped>
.chat-mensajes {
    height: 400px;
    overflow-y: auto;
    background: #f8f9fa;
}
</style>
