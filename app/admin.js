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
const auth=getAuth();



//subir datos del estudiante a firebase
const codigo=document.getElementById('codigo').value;
const nombrec=document.getElementById('nombrec').value;
const carrera=document.getElementById('carrera').value;
const ciclo=document.getElementById('ciclo').value;

const signUp=document.getElementById('btnenviar');

