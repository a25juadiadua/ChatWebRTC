<script setup>
import { ref } from 'vue';
import socket from '../socket';
import { useRouter } from 'vue-router';

import { useUsuarioStore } from '../stores/usuario';

const usuarioStore = useUsuarioStore();

const router = useRouter();
let nomUsuari = ref("");

function comprobarNombre(nombre) {
    if (nombre.trim() === "" || nombre.trim().length < 3) {
        alert("Pon un nombre, mínimo con 3 caracteres");
    } else {
        socket.emit("nombre:ok", nombre);
        console.log("Nombre enviado");
    }
}

socket.on("nombre:ok", () => {
    usuarioStore.nombre = nomUsuari.value.trim();
    usuarioStore.estado = true;
    usuarioStore.conectado = true;

    console.log("Nombre comprobado y guardado en pinia");
    localStorage.setItem("nombreUsuario", nomUsuari.value.trim());
    localStorage.setItem("estadoUsuario", true);
    router.push('/users');
});

socket.on("nombre:error", (mensaje) => {
    alert(mensaje);
});
</script>

<template>
    <div class="login-page">
        <div class="login-card">

            <div class="text-center mb-5">
                <div class="chat-icon">💬</div>
                <h1 class="fw-bold mt-3">Chat<span>WebRTC</span></h1>
                <p class="subtitle">Conecta con otras personas en tiempo real</p>
            </div>

            <form @submit.prevent="comprobarNombre(nomUsuari)">
                <label for="idNomusuari" class="form-label fw-semibold">
                    Nombre de usuario
                </label>

                <input
                    v-model="nomUsuari"
                    type="text"
                    name="nomUsuari"
                    id="idNomusuari"
                    class="form-control username-input"
                    placeholder="Ejemplo: Pedrito"
                    autocomplete="off"
                >

                <button type="submit" class="btn btn-login w-100 mt-4">
                    ✈ Entrar
                </button>
            </form>

            <p class="text-center footer-text mt-5 mb-0">
                — &nbsp; Chat en tiempo real &nbsp; —
            </p>

        </div>
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
    background: linear-gradient(135deg, #edf5ff, #e9e7ff);
}

.login-card {
    width: 100%;
    max-width: 550px;
    padding: 48px;
    background: white;
    border-radius: 24px;
    box-shadow: 0 15px 45px rgba(54, 83, 160, 0.12);
}

.chat-icon {
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

.form-label {
    color: #253453;
}

.username-input {
    padding: 15px;
    border: 2px solid #e0e7f3;
    border-radius: 12px;
    font-size: 1rem;
}

.username-input:focus {
    border-color: #6480fa;
    box-shadow: 0 0 0 3px rgba(100, 128, 250, 0.15);
}

.btn-login {
    padding: 15px;
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    background: linear-gradient(100deg, #347ff5, #8550f6);
    transition: transform 0.2s, box-shadow 0.2s;
}

.btn-login:hover {
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(83, 100, 240, 0.25);
}

.footer-text {
    color: #98a5bf;
    font-size: 0.9rem;
}

@media (max-width: 576px) {
    .login-card {
        padding: 32px 24px;
    }

    h1 {
        font-size: 2rem;
    }
}
</style>