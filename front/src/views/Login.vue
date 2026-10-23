<script setup>
import { ref } from 'vue';

let nomUsuari = ref("");

function comprobarNombre(nombre){

    if(nombre.value.trim() === null || nombre.value.length < 3){
        alert("Pon un nombre, minimo con 3 caracteres");
    }else{

    }
}

</script>

<template>
    <form @submit.prevent="comprobarNombre(nomUsuari)" >
        <label for="nomUsuari">Nom Usuari:</label>
        <input  v-model="nomUsuari" type="text" name="nomUsuari" id="idNomusuari" placeholder="Pedrito">

        <input type="submit" value="Enviar">
</form>
</template>