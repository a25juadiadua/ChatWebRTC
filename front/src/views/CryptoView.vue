<script setup>
    import { ref } from 'vue'
    import JSEncrypt from 'jsencrypt'
    import CryptoJS from 'crypto-js'

    const clavePublica = ref('');
    const clavePrivada = ref('');
    const clavePublicaRemota = ref('');
    const mensaje = ref('');
    const mensajeCifrado = ref('');
    const claveAES = ref('');
    const ivAES = ref('');
    const paqueteEnvio = ref('');
    const mensajeDescifrado = ref('');
    const mensajeRecibido = ref('');
    const claveAESRecibida = ref('');

    let crypt = null;

    function generarClaves(){
        crypt = new JSEncrypt({ default_key_size: 2048 });

        crypt.getKey();

        clavePublica.value = crypt.getPublicKey();
        clavePrivada.value = crypt.getPrivateKey();
    }

    function firmarFirma(){

        if (!crypt || !mensaje.value.trim()) {
        alert('Genera las claves y escribe un mensaje');
        return;
    }

        const firma = crypt.sign(
            mensaje.value,
            CryptoJS.SHA256,
            'sha256'
        )

        const objeto = {
            mensaje: mensaje.value,
            signatura: firma
        }
        
        mensaje.value = JSON.stringify(objeto, null, 2);

    }

    function verificarFirma(mensajeOriginal, firma){

        const rsa = new JSEncrypt();

        rsa.setPublicKey(clavePublicaRemota.value);

        return rsa.verify(
            mensajeOriginal,
            firma,
            CryptoJS.SHA256
        );

    }

    function generarClaveAES(){
        const clave = CryptoJS.lib.WordArray.random(32);

        return clave.toString();
    }

    function cifrarMensaje(){

    if(!claveAES.value){
        claveAES.value = generarClaveAES();
    }

    ivAES.value = CryptoJS.lib.WordArray.random(16).toString();

    const cifrado = CryptoJS.AES.encrypt(
        mensaje.value,
        CryptoJS.enc.Hex.parse(claveAES.value),
        {
            iv: CryptoJS.enc.Hex.parse(ivAES.value)
        }
    );

    mensajeCifrado.value = cifrado.toString();
}

    function cifrarClaveAES(){
        if(!clavePublicaRemota.value.trim()){
            alert('Introduce la clave publica del destinatario');
            return;
        }

        const rsa = new JSEncrypt();

        rsa.setPublicKey(clavePublicaRemota.value);

        const claveCifrada = rsa.encrypt(claveAES.value);

        if(!claveCifrada){
            alert('No se ha podido cifrar la clave AES');
            return;
        }

        return claveCifrada;
    }

    function prepararEnvio(){

    const claveCifrada = cifrarClaveAES();

    if(!claveCifrada)return;

    const paquete = {
        mensaje: mensajeCifrado.value,
        clave: claveCifrada,
        iv: ivAES.value
    };

    paqueteEnvio.value = JSON.stringify(paquete, null, 2);
}

function descifrarClaveAES(paquete){

    const rsa = new JSEncrypt();

    rsa.setPrivateKey(clavePrivada.value);

    claveAESRecibida.value = rsa.decrypt(paquete.clave);

    if(!claveAESRecibida.value){
        alert('No se ha podido descrifrar la clave AES');
        return;
    }
}

function descifrarMensaje(paquete){

    const bytes = CryptoJS.AES.decrypt(
        paquete.mensaje,
        CryptoJS.enc.Hex.parse(claveAESRecibida.value),
        {
            iv: CryptoJS.enc.Hex.parse(paquete.iv)
        }
    );

    mensajeDescifrado.value = bytes.toString(CryptoJS.enc.Utf8);
}

function recibirMensaje(){

    const paquete = JSON.parse(mensajeRecibido.value);

    descifrarClaveAES(paquete);

    if(!claveAESRecibida.value) return;

    descifrarMensaje(paquete);

    const objeto = JSON.parse(mensajeDescifrado.value);

    const firmaValida = verificarFirma(
        objeto.mensaje,
        objeto.signatura
    );

    console.log('Mensaje:', objeto.mensaje);
    console.log('Firma válida:', firmaValida);

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

    <h3>Clave publica remota</h3>
    <textarea v-model="clavePublicaRemota" placeholder="Pega aqui la clave pública del otro usuario"></textarea>

    <h3>Mensaje</h3>

    <textarea v-model="mensaje" placeholder="Escribe tu mensaje..."></textarea>

    <button @click="firmarFirma">Enviar Mensaje</button>

    <button @click="cifrarMensaje">
    Cifrar Mensaje
</button>

    <h3>Mensaje cifrado</h3>
    <textarea v-model="mensajeCifrado" readonly></textarea>

    <button @click="prepararEnvio">
    Preparar envío
</button>

<h3>Mensaje recibido</h3>
<textarea
    v-model="mensajeRecibido"
    placeholder="Pega aquí el mensaje cifrado que has recibido..."
></textarea>

<button @click="recibirMensaje">
    Recibir y descifrar
</button>
</template>

