# ChatWebRTC

Aplicación web de chat en tiempo real que permite a los usuarios conectarse, consultar quién está disponible, enviarse invitaciones y mantener conversaciones privadas mediante **WebRTC P2P**.

El proyecto utiliza **Vue 3** para la interfaz, **Node.js y Socket.IO** para la comunicación entre usuarios y **simple-peer** para gestionar las conexiones WebRTC.

## Características

- Registro de usuarios mediante un nombre de usuario.
- Validación del nombre y comprobación de usuarios duplicados.
- Listado de usuarios conectados y su estado.
- Envío, aceptación y rechazo de invitaciones de chat.
- Comunicación entre usuarios mediante conexiones WebRTC peer-to-peer.
- Envío y recepción de mensajes en tiempo real.
- Intercambio de señalización WebRTC mediante Socket.IO.
- Interfaz desarrollada con Bootstrap.

## Tecnologías utilizadas

### Frontend
- Vue 3
- Vite
- Pinia
- Vue Router
- Bootstrap
- Socket.IO Client
- simple-peer

### Backend
- Node.js
- Express
- Socket.IO

## Estructura del proyecto

```text
ChatWebRTC/
├── front/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── views/
│   │   └── socket.js
│   ├── package.json
│   └── vite.config.js
│
└── back/
    ├── server.js
    ├── package.json
    └── package-lock.json
```

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/a25juadiadua/ChatWebRTC.git
cd ChatWebRTC
```

### 2. Instalar y ejecutar el backend

```bash
cd back
npm install
node server.js
```

El backend utiliza el puerto `30050` en la configuración actual.

### 3. Instalar y ejecutar el frontend

En otra terminal:

```bash
cd front
npm install
npm run dev
```

Vite mostrará la dirección local donde se puede abrir la aplicación, normalmente `http://localhost:5173`.

**Importante:** comprueba que la URL de Socket.IO y el origen permitido en CORS coincidan con el entorno en el que se ejecuta la aplicación.

## ¿Cómo funciona?

1. **Identificación:** el usuario introduce su nombre, que se valida en el servidor.
2. **Lista de usuarios:** el frontend solicita y muestra los usuarios conectados y su estado.
3. **Invitaciones:** un usuario puede invitar a otro a iniciar una conversación.
4. **Señalización:** Socket.IO intercambia los datos necesarios para establecer la conexión WebRTC.
5. **Conexión P2P:** una vez establecida la conexión, los mensajes se envían directamente entre los navegadores mediante `simple-peer`.

Socket.IO se utiliza para la señalización y la gestión de usuarios; los mensajes del chat se transmiten mediante el canal de datos de WebRTC.

## Despliegue

El frontend compilado se genera con:

```bash
cd front
npm run build
```

Los archivos de producción se guardan en `front/dist`.

Para el despliegue en Labs, el frontend se publica dentro de `public_html/webRTC` y el backend se mantiene fuera del directorio público, en `private/ChatWebRTC`.

El backend debe estar ejecutándose en el servidor y el puerto configurado debe permitir conexiones desde el navegador. La URL de Socket.IO y la configuración de CORS deben ajustarse al dominio de despliegue.

## Objetivo del proyecto

Este proyecto forma parte del aprendizaje de desarrollo de aplicaciones web y permite practicar la comunicación en tiempo real, la gestión de usuarios, Vue 3 y las conexiones peer-to-peer con WebRTC.
