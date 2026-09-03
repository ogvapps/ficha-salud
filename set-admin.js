// Script para asignar rol de admin
const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// UID del usuario
const uid = '3nuwDtlx8Gg1FFlxRG21GiKudqc2';

// Asignar claim de admin
admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
        console.log('✅ Rol de admin asignado correctamente al usuario:', uid);
        console.log('El usuario debe cerrar sesión y volver a entrar para que los cambios surtan efecto.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error al asignar rol de admin:', error);
        process.exit(1);
    });
