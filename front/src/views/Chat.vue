<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import socket from '../socket';
import { useRouter } from 'vue-router';
import Peer from 'simple-peer/simplepeer.min.js';

const rolChat = localStorage.getItem('rolChat');
const router = useRouter();

const nombreUsuario = localStorage.getItem('nombreUsuario');
const nombreOtroUsuario = localStorage.getItem('nombreOtroUsuario');
const videoRemoto = ref(null);
const mensaje = ref('');
const mensajes = ref([]);
const conectado = ref(socket.connected);
const mostarCapturaVideo = ref(false);
const compartiendoPantalla = ref(false);
const compartoYo = ref(false);
let peer = null;
let capPantalla = null;

console.log("Rol del chat:", rolChat);
console.log("Mi nombre:", nombreUsuario);
console.log("Nombre del otro usuario:", nombreOtroUsuario);


function crearPeer(initiator) {
    conectado.value = false;
    peer = new Peer({ initiator, trickle: false });

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

    peer.on('stream', async (stream) => {
        mostarCapturaVideo.value = true;

        await nextTick();

        videoRemoto.value.srcObject = stream;
    });
}

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


async function iniciarCapturaPantalla(){
    try {
        capPantalla = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
        });

        mostarCapturaVideo.value = true;

        await nextTick();

        videoRemoto.value.srcObject = capPantalla;

        if (peer && peer.connected) {
            peer.addStream(capPantalla);
        }

        socket.emit("webrtc:boton:oculto", {
            nombreDestino: nombreOtroUsuario
        });

        compartiendoPantalla.value = true;
        compartoYo.value = true;

    } catch (error) {
        console.log("El usuario ha cancelado la compartición:", error);
    }
}
function detenerCapturaPantalla() {
    capPantalla.getTracks().forEach(track => track.stop());

    peer.removeStream(capPantalla);

    capPantalla = null;
    mostarCapturaVideo.value = false;

    socket.emit("webrtc:detener-pantalla", {
        nombreDestino: nombreOtroUsuario
    });

    compartiendoPantalla.value = false;
    compartoYo.value = false;
}

function volverUsers(){

    socket.emit("cambio:estado:true", {
        nombreEmisor: nombreUsuario,
        nombreReceptor: nombreOtroUsuario}
    );
}


onMounted(() => {
    socket.on('connect', alConectar);
    socket.on('disconnect', alDesconectar);

    socket.on('webrtc:signal', (datos) => {
        peer.signal(datos.signal);
    });

    socket.on("webrtc:detener-pantalla", () => {
        mostarCapturaVideo.value = false;
        compartiendoPantalla.value = false;
    });

    socket.on("webrtc:boton:oculto", () => {
        compartiendoPantalla.value = true;
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
    socket.off("webrtc:detener-pantalla");
    socket.off('webrtc:listo');
    socket.off("webrtc:boton:oculto");

    if (peer) peer.destroy();
});
</script>

<template>
    <div class="container py-5">

        <div class="card shadow-lg border-0 mx-auto chat-card">

            <!-- CABECERA -->
            <div class="card-header bg-primary text-white p-4">

                <div class="d-flex justify-content-between align-items-center">

                    <div>
                        <h4 class="mb-1 fw-bold">💬 Chat WebRTC</h4>
                        <small class="opacity-75">
                            Conversación con {{ nombreOtroUsuario }}
                        </small>
                    </div>

                    <span
                        class="badge rounded-pill px-3 py-2"
                        :class="conectado ? 'bg-success' : 'bg-danger'"
                    >
                        {{ conectado ? '● Conectado' : '● Desconectado' }}
                    </span>

                </div>

                <!-- BOTONES DE PANTALLA -->
                <div class="d-flex gap-2 mt-4 flex-wrap">

                    <button
                        v-if="compartiendoPantalla === false"
                        class="btn btn-light btn-sm fw-semibold"
                        @click="iniciarCapturaPantalla()"
                    >
                        🖥️ Compartir pantalla
                    </button>

                    <button
                        v-if="compartoYo"
                        class="btn btn-danger btn-sm fw-semibold"
                        @click="detenerCapturaPantalla()"
                    >
                        ⏹ Detener captura
                    </button>

                </div>

            </div>


            <!-- VIDEO -->
            <div class="card-body bg-dark p-3" v-if="mostarCapturaVideo">

                <div class="video-container rounded overflow-hidden">

                    <video
                        ref="videoRemoto"
                        autoplay
                        style="width: 100%; display: block;"
                    ></video>

                </div>

                <p class="text-white-50 small mb-0 mt-2 text-center">
                    🖥️ Pantalla compartida
                </p>

            </div>


            <!-- MENSAJES -->
            <div class="card-body chat-mensajes p-4">

                <div
                    v-if="mensajes.length === 0"
                    class="text-center text-muted mt-5"
                >
                    <div class="fs-1">💬</div>
                    <p class="mb-0">Todavía no hay mensajes.</p>
                    <small>¡Empieza la conversación!</small>
                </div>

                <div
                    v-for="(item, index) in mensajes"
                    :key="index"
                    class="mb-3 d-flex"
                    :class="item.nombre === nombreUsuario
                        ? 'justify-content-end'
                        : 'justify-content-start'"
                >

                    <div
                        class="mensaje-burbuja p-3"
                        :class="item.nombre === nombreUsuario
                            ? 'mensaje-propio'
                            : 'mensaje-ajeno'"
                    >

                        <strong class="d-block small mb-1">
                            {{ item.nombre }}
                        </strong>

                        <div class="mensaje-texto">
                            {{ item.texto }}
                        </div>

                        <div class="small text-muted text-end mt-2">
                            {{ item.hora }}
                        </div>

                    </div>

                </div>

            </div>


            <!-- FORMULARIO -->
            <div class="card-footer bg-white p-3">

                <form
                    class="d-flex gap-2"
                    @submit.prevent="enviarMensaje"
                >

                    <input
                        v-model="mensaje"
                        class="form-control rounded-pill px-3"
                        placeholder="Escribe un mensaje..."
                        maxlength="500"
                        :disabled="!conectado"
                    >

                    <button
                        class="btn btn-primary rounded-pill px-4 fw-semibold"
                        type="submit"
                        :disabled="!conectado"
                    >
                        Enviar ➤
                    </button>

                </form>

            </div>


            <!-- VOLVER -->
            <div class="card-footer bg-light text-end border-0">

                <button
                    class="btn btn-outline-secondary btn-sm"
                    @click="router.push('/users'), volverUsers()"
                >
                    ← Volver a usuarios
                </button>

            </div>

        </div>

    </div>
</template>

<style scoped>

.chat-card {
    max-width: 750px;
    border-radius: 16px;
    overflow: hidden;
}

/* ZONA DE MENSAJES */
.chat-mensajes {
    height: 400px;
    overflow-y: auto;
    background: #f8f9fa;
}

/* BURBUJAS */
.mensaje-burbuja {
    max-width: 75%;
    min-width: 120px;
    border-radius: 15px;
    word-break: break-word;
}

.mensaje-propio {
    background: #cfe2ff;
    border-bottom-right-radius: 4px;
}

.mensaje-ajeno {
    background: #d1e7dd;
    border-bottom-left-radius: 4px;
}

.mensaje-texto {
    white-space: pre-wrap;
}

/* VIDEO */
.video-container {
    background: #000;
}

.video-container video {
    max-height: 450px;
    object-fit: contain;
}

/* SCROLL */
.chat-mensajes::-webkit-scrollbar {
    width: 6px;
}

.chat-mensajes::-webkit-scrollbar-thumb {
    background: #ced4da;
    border-radius: 10px;
}

.chat-mensajes::-webkit-scrollbar-thumb:hover {
    background: #adb5bd;
}

/* MOVIL */
@media (max-width: 576px) {

    .container {
        padding: 15px !important;
    }

    .chat-mensajes {
        height: 350px;
    }

    .mensaje-burbuja {
        max-width: 90%;
    }

}

</style>
