/// Configura tu proyecto de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAev2UYvws9Gb6T1z-pWIto_vrfXkiTAyw",
    authDomain: "notiguardia-cce5e.firebaseapp.com",
    projectId: "notiguardia-cce5e",
    storageBucket: "notiguardia-cce5e.appspot.com",
    messagingSenderId: "424396633234",
    appId: "1:424396633234:web:a6a8e3b527ce5dfe2fa24b",
    measurementId: "G-GQEZ65XR44"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const buscarBtn = document.getElementById('buscarBtn');

// Asocia el evento click al botón
buscarBtn.addEventListener('click', buscarEstudiante);
function prueba() {
    console.log("onclick");
}

function buscarEstudiante() {
    const codigoEstudiante = document.getElementById('codigoEstudiante').value;
    
    // Busca el documento en Firestore
    const studentRef = collection(db, 'students');
    getDocs(studentRef)
      .then(snapshot => {
        snapshot.forEach(doc => {
          if (doc.id === codigoEstudiante) {
            const data = doc.data();
            let statusHTML = '';
            if (data.status === 'dentro') {
              statusHTML = `
                <div class="status-box bg-success p-3 rounded d-flex justify-content-center align-items-center">
                  <p class="m-0"><strong>En la universidad</strong></p>
                </div>
              `;
            } else if (data.status === 'fuera') {
              statusHTML = `
                <div class="status-box bg-danger p-3 rounded d-flex justify-content-center align-items-center">
                  <p class="m-0"><strong>Fuera de la universidad</strong></p>
                </div>
              `;
            }
            // Muestra la información del estudiante
            document.getElementById('resultado').innerHTML = `
            <div class="card" id="student_card">
          <div class="card-body">
              <p><strong>Nombre:</strong> ${data.nombre}</p>
              <p><strong>Carrera:</strong> ${data.carrera}</p>
              ${statusHTML}
              </div>
        </div>
            `;
          }
        });
      })
      .catch(error => {
        console.error("Error buscando estudiante:", error);
        document.getElementById('resultado').innerHTML = "Error buscando estudiante";
      });
  
    // Actualización automática ante cambios en Firestore
    const unsubscribe = onSnapshot(studentRef, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified' && change.doc.id === codigoEstudiante) {
          const data = change.doc.data();
          let statusHTML = '';
          if (data.status === 'dentro') {
            statusHTML = `
              <div class="status-box bg-success p-3 rounded d-flex justify-content-center align-items-center">
                <p class="m-0"><strong>En la universidad</strong></p>
              </div>
            `;
          } else if (data.status === 'fuera') {
            statusHTML = `
              <div class="status-box bg-danger p-3 rounded d-flex justify-content-center align-items-center">
                <p class="m-0"><strong>Fuera de la universidad</strong></p>
              </div>
            `;
          }
          // Actualiza la información del estudiante en la página
          document.getElementById('resultado').innerHTML = `
          <div class="card" id="student_card">
          <div class="card-body">
            <p><strong>Nombre:</strong> ${data.nombre}</p>
            <p><strong>Carrera:</strong> ${data.carrera}</p>
            ${statusHTML}
            </div>
        </div>
          `;
        }
      });
    });
  }
  