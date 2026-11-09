
import JSEncrypt from 'jsencrypt'
import CryptoJS from 'crypto-js'

// GENERAR CLAVES
export function generarClaves() {
    const crypt = new JSEncrypt({ default_key_size: 2048 })

    crypt.getKey()

    return {
        clavePublica: crypt.getPublicKey(),
        clavePrivada: crypt.getPrivateKey()
    }
}

// CIFRAR MENSAJE
export function cifrarMensaje(mensaje, clavePublica) {
    const rsa = new JSEncrypt()

    rsa.setPublicKey(clavePublica)

    return rsa.encrypt(mensaje)
}

// DESCIFRAR MENSAJE
export function descifrarMensaje(mensajeCifrado, clavePrivada) {
    const rsa = new JSEncrypt()

    rsa.setPrivateKey(clavePrivada)

    return rsa.decrypt(mensajeCifrado)
}
