<script setup>
import { RouterView } from 'vue-router';
import socket from './socket';

socket.on("disconnect", () => {
    console.log("Se ha ejecutado disconnect");

    router.push("/");
});

</script>

<template>
    <RouterView socket  />
</template>