import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore,setDoc,doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAev2UYvws9Gb6T1z-pWIto_vrfXkiTAyw",
    authDomain: "notiguardia-cce5e.firebaseapp.com",
    projectId: "notiguardia-cce5e",
    storageBucket: "notiguardia-cce5e.appspot.com",
    messagingSenderId: "424396633234",
    appId: "1:424396633234:web:a6a8e3b527ce5dfe2fa24b",
    measurementId: "G-GQEZ65XR44"
};

const app = initializeApp(firebaseConfig);
const db=getFirestore(app);

// const storage = firebase.storage();
const auth=getAuth();


const formulario = document.getElementById('formulario');
  formulario.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    // Obtener los valores de los campos del formulario
    const codigo = formulario['codigo'].value;
    const nombre = formulario['nombre'].value;
    const carrera = formulario['carrera'].value;
    const ciclo = formulario['ciclo'].value;
    const imagen = formulario['imagen'].files[0]; // Obtener el archivo de imagen

    // Verificar que se haya seleccionado una imagen
    if (!imagen) {
      alert('Por favor selecciona una imagen.');
      return;
    }

    // Subir la imagen a Firebase Storage
    const storageRef = storage.ref(`estudiantes/${codigo}.jpg`);
    const imagenSnapshot = await storageRef.put(imagen);
    const imagenUrl = await imagenSnapshot.ref.getDownloadURL();

    // Detectar la cara y obtener el encoding facial usando face-api.js
    const image = await faceDetection(imagenUrl);
    const face_encoding = await getFaceEncoding(image);

    // Añadir los datos del estudiante a Firestore
    await db.collection('students').doc(codigo).set({
      nombre: nombre,
      carrera: carrera,
      ciclo: ciclo,
      image_url: imagenUrl,
      face_encoding: face_encoding,
      status:"fuera"
    });

    console.log(`Estudiante ${nombre} agregado correctamente a Firebase.`);
    alert('Estudiante agregado correctamente.');

    // Limpiar el formulario después de enviar los datos
    formulario.reset();
  });

  // Función para detectar la cara usando face-api.js
  async function faceDetection(imagenUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imagenUrl;
    });
  }

  // Función para obtener el encoding facial usando face-api.js
  async function getFaceEncoding(image) {
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models'); // Cargar modelo de landmarks
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models'); // Cargar modelo de reconocimiento facial

    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    if (detections.length === 0) {
      console.error('No se detectaron caras en la imagen.');
      return null;
    }
    const faceDescriptor = detections[0].descriptor;
    return Array.from(faceDescriptor);
  }
