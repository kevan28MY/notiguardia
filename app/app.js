/// Configura tu proyecto de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, onSnapshot,updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const auth = getAuth();
const db = getFirestore(app);

// const buscarBtn = document.getElementById('buscarBtn');

// // Asocia el evento click al botón
// buscarBtn.addEventListener('click', buscarEstudiante);
// function prueba() {
//     console.log("onclick");
// }

// function buscarEstudiante() {
//     const codigoEstudiante = document.getElementById('codigoEstudiante').value;
    
//     // Busca el documento en Firestore
//     const studentRef = collection(db, 'students');
//     getDocs(studentRef)
//       .then(snapshot => {
//         snapshot.forEach(doc => {
//           if (doc.id === codigoEstudiante) {
//             const data = doc.data();
//             let statusHTML = '';
//             if (data.status === 'dentro') {
//               statusHTML = `
//                 <div class="status-box bg-success p-3 rounded d-flex justify-content-center align-items-center">
//                   <p class="m-0"><strong>En la universidad</strong></p>
//                 </div>
//               `;
//             } else if (data.status === 'fuera') {
//               statusHTML = `
//                 <div class="status-box bg-danger p-3 rounded d-flex justify-content-center align-items-center">
//                   <p class="m-0"><strong>Fuera de la universidad</strong></p>
//                 </div>
//               `;
//             }
//             // Muestra la información del estudiante
//             document.getElementById('resultado').innerHTML = `
//             <div class="card" id="student_card">
//           <div class="card-body">
//               <p><strong>Nombre:</strong> ${data.nombre}</p>
//               <p><strong>Carrera:</strong> ${data.carrera}</p>
//               ${statusHTML}
//               </div>
//         </div>
//             `;
//           }
//         });
//       })
//       .catch(error => {
//         console.error("Error buscando estudiante:", error);
//         document.getElementById('resultado').innerHTML = "Error buscando estudiante";
//       });
  
    // Actualización automática ante cambios en Firestore
  //   const unsubscribe = onSnapshot(studentRef, (snapshot) => {
  //     snapshot.docChanges().forEach(change => {
  //       if (change.type === 'modified' && change.doc.id === codigoEstudiante) {
  //         const data = change.doc.data();
  //         let statusHTML = '';
  //         if (data.status === 'dentro') {
  //           statusHTML = `
  //             <div class="status-box bg-success p-3 rounded d-flex justify-content-center align-items-center">
  //               <p class="m-0"><strong>En la universidad</strong></p>
  //             </div>
  //           `;
  //         } else if (data.status === 'fuera') {
  //           statusHTML = `
  //             <div class="status-box bg-danger p-3 rounded d-flex justify-content-center align-items-center">
  //               <p class="m-0"><strong>Fuera de la universidad</strong></p>
  //             </div>
  //           `;
  //         }
  //         // Actualiza la información del estudiante en la página
  //         document.getElementById('resultado').innerHTML = `
  //         <div class="card" id="student_card">
  //         <div class="card-body">
  //           <p><strong>Nombre:</strong> ${data.nombre}</p>
  //           <p><strong>Carrera:</strong> ${data.carrera}</p>
  //           ${statusHTML}
  //           </div>
  //       </div>
  //         `;
  //       }
  //     });
  //   });
  // }
  
  //cambiar formato, ahora al ingresa si no esta asociado un estudiante debera buscarlo
  onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDocs(doc(db, "users", user.uid));
        const userData = userDoc.data();

        if (userData && userData.studentCode) {
            // Si el padre ya tiene un estudiante asociado, muestra la información del estudiante
            showStudentInfo(userData.studentCode);
        } else {
            // Si no, muestra el formulario para asociar al estudiante
            document.getElementById('studentForm').style.display = 'block';
        }
    } else {
        // Redirigir al inicio de sesión si no hay usuario
        window.location.href = "../index.html";
    }
});

const associateStudentForm = document.getElementById('associateStudentForm');
associateStudentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const studentCode = document.getElementById('studentCode').value;
    const user = auth.currentUser;

    if (user) {
        const studentDoc = await getDocs(doc(db, "students", studentCode));
        if (studentDoc.exists()) {
            // Asocia el estudiante con el padre en la colección "users"
            await setDoc(doc(db, "users", user.uid), {
                studentCode: studentCode
            }, { merge: true });

            // Asocia el padre con el estudiante en la colección "students"
            await updateDoc(doc(db, "students", studentCode), {
                parentId: user.uid
            });

            showMessage('Estudiante asociado correctamente', 'associateMessage');
            document.getElementById('studentForm').style.display = 'none';
            showStudentInfo(studentCode);
        } else {
            showMessage('Estudiante no encontrado', 'associateMessage');
        }
    }
});

function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}

async function showStudentInfo(studentCode) {
    const studentDoc = await getDoc(doc(db, "students", studentCode));
    if (studentDoc.exists()) {
        const data = studentDoc.data();
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
        document.getElementById('studentInfo').style.display = 'block';
        document.getElementById('resultado').innerHTML = `
            <div class="card" id="student_card">
                <div class="card-body">
                    <p><strong>Nombre:</strong> ${data.nombre}</p>
                    <p><strong>Carrera:</strong> ${data.carrera}</p>
                    ${statusHTML}
                </div>
            </div>
        `;
    } else {
        document.getElementById('resultado').innerHTML = "Estudiante no encontrado";
    }
}