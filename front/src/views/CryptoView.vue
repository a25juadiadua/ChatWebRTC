<script setup>
    import { ref } from 'vue'
    import JSEncrypt from 'jsencrypt'

    const clavePublica = ref('');
    const clavePrivada = ref('');

    function generarClaves(){
        const crypt = new JSEncrypt({ default_key_size: 2048 });

        crypt.getKey();

        clavePublica.value = crypt.getPublicKey();
        clavePrivada.value = crypt.getPrivateKey();
    }
</script>

<template>

    <button @click="generarClaves()">
        Generar Claves
    </button>

    <h3>Clave pública</h3>
    <textarea v-model="clavePublica" readonly></textarea>


    <h3>Clave privada</h3>
    <textarea v-model="clavePrivada" readonly></textarea>
</template>

