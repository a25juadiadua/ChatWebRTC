
import { defineStore } from 'pinia';

export const useUsuarioStore = defineStore('usuario', {
    state: () => ({
        nombre: '',
        estado: false,
        conectado: false
    })
});
