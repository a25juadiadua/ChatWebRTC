
<script setup>
import { onMounted, ref } from 'vue';
import socket from '../socket';
import { useUsuarioStore } from '../stores/usuario';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2'

const router = useRouter();
let listaUsuarios = ref([]); 
const usuarioStore = useUsuarioStore();
let nombreUsuario = localStorage.getItem("nombreUsuario");

console.log("Nombre de usuario: " , nombreUsuario);

//--------------------- FUNCIONES ------------------------------

function invitacionChat(nombreEmisor, nombreReceptor){
    socket.emit("invitacion:chat:emisor", nombreEmisor, nombreReceptor);
    
}
socket.on("invitacion:chat:receptor", async (nombreReceptor) => {

    const resultado = await Swal.fire({
    title: "Invitación al chat",
    text: `¿Quieres aceptar la invitación de ${nombreReceptor}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Rechazar"

});

if (resultado.isConfirmed) {

    socket.emit("invitacion:chat:aceptada", nombreReceptor);
    console.log("Invitación aceptada");

} else {

    socket.emit("invitacion:chat:rechazada",nombreReceptor);
    console.log("Invitación rechazada");

}
});

socket.on("invitacion:chat:aceptada", () => {
    router.push("/chat");
});

socket.on("invitacion:chat:rechazada", () => {

    Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Te ha rechazado la invitación",
        });

});


onMounted(() => {


    socket.emit("usuario:lista:enviada");
    
    socket.on("usuario:lista:recibido", (usuarios) => {

    listaUsuarios.value = Object.values(usuarios).filter(
        element => element.nombre !== nombreUsuario);

});

    
    
});




</script>

<template>
    <div class="users-page">
        <div class="users-card">

            <div class="text-center mb-5">
                <div class="users-icon">👥</div>

                <h1 class="fw-bold mt-3">
                    Usuarios <span>conectados</span>
                </h1>

                <p class="subtitle">
                    Aquí puedes ver quién está en línea
                </p>
            </div>

            <div class="table-responsive">
                <table class="table users-table align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Estado</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="value in listaUsuarios" :key="value.nombre" @click="invitacionChat(nombreUsuario, value.nombre)">
                            <td>
                                <div class="user-info">
                                    <div class="user-avatar">
                                        {{ value.nombre.charAt(0).toUpperCase() }}
                                    </div>

                                    <span>{{ value.nombre }}</span>
                                </div>
                            </td>

                            <td>
                                <span v-if="value.estado" class="status available">
                                    <span class="status-dot"></span>
                                    Disponible
                                </span>

                                <span v-else class="status occupied">
                                    <span class="status-dot"></span>
                                    Ocupat
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p class="text-center footer-text mt-4 mb-0">
                — &nbsp; Chat en tiempo real &nbsp; —
            </p>

        </div>
    </div>
</template>

<style scoped>
.users-page {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
    background: linear-gradient(135deg, #edf5ff, #e9e7ff);
}

.users-card {
    width: 100%;
    max-width: 850px;
    padding: 48px;
    background: white;
    border-radius: 24px;
    box-shadow: 0 15px 45px rgba(54, 83, 160, 0.12);
}

.users-icon {
    font-size: 55px;
}

h1 {
    color: #1d2b50;
    font-size: 2.4rem;
}

h1 span {
    color: #5375f5;
}

.subtitle {
    color: #7886a5;
    margin-top: 12px;
}

.users-table {
    border-radius: 16px;
    overflow: hidden;
    color: #253453;
}

.users-table thead th {
    padding: 18px 24px;
    color: #253453;
    background: #edf2ff;
    border-bottom: 2px solid #e0e7f3;
}

.users-table tbody td {
    padding: 16px 24px;
    border-bottom: 1px solid #edf0f7;
}

.users-table tbody tr:last-child td {
    border-bottom: none;
}

.users-table tbody tr:hover td {
    background: #f8faff;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 14px;
    font-weight: 500;
}

.user-avatar {
    width: 42px;
    height: 42px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    border-radius: 50%;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    background: linear-gradient(135deg, #347ff5, #8550f6);
}

.status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 30px;
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
}

.available {
    color: #138b5b;
    background: #e0f8ee;
}

.occupied {
    color: #687b9c;
    background: #eaf0fa;
}

.status-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: currentColor;
}

.footer-text {
    color: #98a5bf;
    font-size: 0.9rem;
}

@media (max-width: 576px) {
    .users-card {
        padding: 28px 18px;
    }

    h1 {
        font-size: 1.8rem;
    }

    .users-table thead th,
    .users-table tbody td {
        padding: 14px 10px;
    }
}
</style>