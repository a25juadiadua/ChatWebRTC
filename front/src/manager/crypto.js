
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

    // Generar clave AES aleatoria de 32 bytes
    const claveAES = CryptoJS.lib.WordArray.random(32)

    // Generar IV aleatorio de 16 bytes
    const iv = CryptoJS.lib.WordArray.random(16)

    // Cifrar el mensaje con AES
    const cifrado = CryptoJS.AES.encrypt(
        mensaje,
        claveAES,
        { iv: iv }
    )

    // Cifrar la clave AES con RSA
    const rsa = new JSEncrypt()

    rsa.setPublicKey(clavePublica)

    const claveCifrada = rsa.encrypt(claveAES.toString())

    if (!claveCifrada) {
        return null
    }

    // Preparar el paquete de envío
    return {
        mensaje: cifrado.toString(),
        clave: claveCifrada,
        iv: iv.toString()
    }
}

// DESCIFRAR MENSAJE
export function descifrarMensaje(paquete, clavePrivada) {

    // Descifrar la clave AES con RSA
    const rsa = new JSEncrypt()

    rsa.setPrivateKey(clavePrivada)

    const claveAES = rsa.decrypt(paquete.clave)

    if (!claveAES) {
        return null
    }

    try {

        // Descifrar el mensaje con AES
        const bytes = CryptoJS.AES.decrypt(
            paquete.mensaje,
            CryptoJS.enc.Hex.parse(claveAES),
            {
                iv: CryptoJS.enc.Hex.parse(paquete.iv)
            }
        )

        return bytes.toString(CryptoJS.enc.Utf8) || null

    } catch (error) {
        return null
    }
}

// FIRMAR MENSAJE
export function firmarMensaje(mensaje, clavePrivada) {

    const rsa = new JSEncrypt()

    rsa.setPrivateKey(clavePrivada)

    return rsa.sign(
        mensaje,
        CryptoJS.SHA256,
        'sha256'
    )
}

// VERIFICAR FIRMA
export function verificarFirma(mensaje, firma, clavePublica) {

    const rsa = new JSEncrypt()

    rsa.setPublicKey(clavePublica)

    return rsa.verify(
        mensaje,
        firma,
        CryptoJS.SHA256
    )
}


