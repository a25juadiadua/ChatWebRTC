
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import socket from '../socket';
import { useRouter } from 'vue-router';
import Peer from 'simple-peer/simplepeer.min.js';

const rolChat = localStorage.getItem('rolChat');
const router = useRouter();

const nombreUsuario = localStorage.getItem('nombreUsuario');
const nombreOtroUsuario = localStorage.getItem('nombreOtroUsuario');

const mensaje = ref('');
const mensajes = ref([]);
const conectado = ref(socket.connected);
let peer =null;

console.log("Rol del chat:", rolChat);
console.log("Mi nombre:", nombreUsuario);
console.log("Nombre del otro usuario:", nombreOtroUsuario);


function crearPeer(initiator) {
    conectado.value = false;
    peer = new Peer({ initiator, trickle: false });

    // Se dispara con la oferta (emisor) o con la respuesta (receptor)
    peer.on('signal', (data) => {
        socket.emit('webrtc:signal', {
            signal: data,
            nombreDestino: nombreOtroUsuario
        });
    });

    peer.on('connect', () => {
        conectado.value = true;
        console.log('Conexión P2P establecida');
    });

    peer.on('data', (datos) => {
        const recibido = JSON.parse(datos.toString());

        mensajes.value.push(recibido);
    });

    peer.on('error', (err) => {
        console.error('Error en el peer:', err);
    });

    peer.on('close', () => {
        conectado.value = false;
        console.log("Desconexion P2P hecha");
    })
}

// Enviar mensaje
function enviarMensaje() {
    if (mensaje.value.trim() === '' || !peer || !peer.connected) {
        return;
    }

    const nuevoMensaje = {
        texto: mensaje.value.trim(),
        nombre: nombreUsuario,
        hora: new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        })
    };


    peer.send(JSON.stringify(nuevoMensaje));
    mensajes.value.push(nuevoMensaje);
    mensaje.value = '';
}

function alConectar() {
    conectado.value = true;
}

function alDesconectar() {
    conectado.value = false;
}

onMounted(() => {
    socket.on('connect', alConectar);
    socket.on('disconnect', alDesconectar);

    socket.on('webrtc:signal', (datos) => {
    peer.signal(datos.signal);
    });

if (rolChat === 'emisor') {
    socket.on('webrtc:listo', () => crearPeer(true));
} else {
    crearPeer(false);
    socket.emit('webrtc:listo', { nombreDestino: nombreOtroUsuario });
}
    
});

onBeforeUnmount(() => {
    socket.off('connect', alConectar);
    socket.off('disconnect', alDesconectar);
    socket.off('webrtc:signal');
socket.off('webrtc:listo');
if (peer) peer.destroy();
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
