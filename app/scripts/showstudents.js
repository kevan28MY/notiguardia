import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection,doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const auth = getAuth();
const db = getFirestore(app);

//const unsubscribeStudents = onSnapshot(collection(db, 'students'), (snapshot)
// const studentsContainer = document.getElementById('studentsContainer');
// const studentInfo = document.getElementById('studentInfo');
// const associateMessage = document.getElementById('associateMessage');
// const refreshButton = document.getElementById('refreshButton');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                let userData = userDocSnap.data();

                // Verifica y asigna studentCodes como un array si no está definido
                if (!userData.studentCodes) {
                    userData.studentCodes = [];
                }

                // Renderizar estudiantes asociados inicialmente
                await renderStudentCards(userData.studentCodes);

                // Escuchar cambios en la colección 'students'
                const unsubscribeStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
                    snapshot.docChanges().forEach(async (change) => {
                        if (change.type === 'modified') {
                            const updatedStudentData = change.doc.data();
                            await updateStudentCard(updatedStudentData);
                        }
                    });
                });

                // Manejar evento click del botón de actualizar
                document.getElementById('refreshButton').addEventListener('click', async () => {
                    await renderStudentCards(userData.studentCodes);
                });

                // Función para renderizar tarjetas de estudiantes asociados
                async function renderStudentCards(studentCodes) {
                    const studentsContainer = document.getElementById('studentsContainer');
                    studentsContainer.innerHTML = ''; // Limpiar el contenedor antes de renderizar
                    const studentInfo = document.getElementById('studentInfo');
                    studentInfo.style.display = 'block'; // Mostrar el contenedor de información de estudiantes

                    for (let i = 0; i < studentCodes.length; i++) {
                        const code = studentCodes[i];
                        const studentDocRef = doc(db, 'students', code);
                        const studentDocSnap = await getDoc(studentDocRef);

                        if (studentDocSnap.exists()) {
                            const studentData = studentDocSnap.data();
                            const statusHTML = getStatusHTML(studentData.status); // Función para obtener HTML de estado

                            // Crear elementos HTML para la tarjeta de estudiante
                            const colDiv = document.createElement('div');
                            colDiv.classList.add('col-md-6');

                            const cardDiv = document.createElement('div');
                            cardDiv.classList.add('card', 'mb-3');

                            const cardBodyDiv = document.createElement('div');
                            cardBodyDiv.classList.add('card-body');

                            const cardTitle = document.createElement('h5');
                            cardTitle.classList.add('card-title');
                            cardTitle.textContent = studentData.nombre;

                            const cardText = document.createElement('p');
                            cardText.classList.add('card-text');
                            cardText.innerHTML = `<strong>Carrera:</strong> ${studentData.carrera}`;

                            const statusBox = document.createElement('div');
                            statusBox.classList.add('status-box', 'p-2', 'rounded');
                            statusBox.innerHTML = statusHTML;

                            // Botón de eliminar asociación
                            const deleteButton = document.createElement('button');
                            deleteButton.classList.add('btn', 'btn-danger', 'mt-2');
                            deleteButton.textContent = 'Eliminar Asociación';
                            deleteButton.addEventListener('click', async () => {
                                await deleteAssociation(code);
                            });

                            // Construir la tarjeta de estudiante
                            cardBodyDiv.appendChild(cardTitle);
                            cardBodyDiv.appendChild(cardText);
                            cardBodyDiv.appendChild(statusBox);
                            cardBodyDiv.appendChild(deleteButton);
                            cardDiv.appendChild(cardBodyDiv);
                            colDiv.appendChild(cardDiv);

                            // Establecer un identificador único para la tarjeta de estudiante
                            colDiv.id = `studentCard-${code}`;

                            // Agregar la tarjeta al contenedor de estudiantes
                            studentsContainer.appendChild(colDiv);
                        }
                    }
                }

                // Función para actualizar la tarjeta de estudiante en la interfaz
                async function updateStudentCard(studentData) {
                    const cardId = `studentCard-${studentData.code}`;
                    const studentCard = document.getElementById(cardId);
                    if (studentCard) {
                        const statusHTML = getStatusHTML(studentData.status); // Obtener HTML de estado actualizado
                        const statusBox = studentCard.querySelector('.status-box');
                        if (statusBox) {
                            statusBox.innerHTML = statusHTML; // Actualizar el estado en la tarjeta de estudiante
                        }
                    }
                }

                // Función para obtener HTML de estado basado en el estado del estudiante
                function getStatusHTML(status) {
                    let statusHTML = '';
                    if (status === 'dentro') {
                        statusHTML = `
                            <div class="status-box bg-success p-2 rounded">
                                <p class="m-0"><strong>En la universidad</strong></p>
                            </div>
                        `;
                    } else if (status === 'fuera') {
                        statusHTML = `
                            <div class="status-box bg-danger p-2 rounded">
                                <p class="m-0"><strong>Fuera de la universidad</strong></p>
                            </div>
                        `;
                    }
                    return statusHTML;
                }

                // Función para eliminar la asociación entre usuario y estudiante
                async function deleteAssociation(studentCode) {
                    try {
                        // Actualizar el documento del usuario eliminando el studentCode
                        await updateDoc(userDocRef, {
                            studentCodes: arrayRemove(studentCode)
                        });

                        // Obtener el documento del estudiante
                        const studentDocRef = doc(db, 'students', studentCode);
                        const studentDocSnap = await getDoc(studentDocRef);

                        if (studentDocSnap.exists()) {
                            const studentData = studentDocSnap.data();
                            const updatedParentsID = studentData.parentsID.filter(id => id !== user.uid);

                            // Actualizar el documento del estudiante eliminando el ID del usuario
                            await updateDoc(studentDocRef, {
                                parentsID: updatedParentsID
                            });
                        }

                        // Volver a renderizar tarjetas de estudiantes actualizadas
                        userData = (await getDoc(userDocRef)).data(); // Obtener datos actualizados del usuario
                        await renderStudentCards(userData.studentCodes);
                    } catch (error) {
                        console.error('Error al eliminar la asociación:', error);
                    }
                }

                // Manejador para enviar el formulario de asociación de estudiantes
                document.getElementById('associateStudentForm').addEventListener('submit', async (event) => {
                    event.preventDefault();
                    const studentCode = document.getElementById('studentCode').value.trim();

                    // Verifica si el estudiante existe en Firestore
                    const studentDocRef = doc(db, 'students', studentCode);
                    const studentDocSnap = await getDoc(studentDocRef);

                    if (studentDocSnap.exists()) {
                        // Asocia estudiante con el usuario actual
                        await updateDoc(userDocRef, {
                            studentCodes: arrayUnion(studentCode) // Añade código de estudiante al usuario
                        });

                        // Actualiza el documento del estudiante con el ID del usuario
                        await updateDoc(studentDocRef, {
                            parentsID: arrayUnion(user.uid) // Añade ID de usuario a parentsID en students
                        });

                        // Muestra mensaje de éxito
                        showMessage('Estudiante asociado correctamente', 'associateMessage');

                        // Limpiar el formulario después de la asociación
                        document.getElementById('associateStudentForm').reset();

                        // Volver a renderizar tarjetas de estudiantes
                        userData = (await getDoc(userDocRef)).data(); // Obtener datos actualizados del usuario
                        await renderStudentCards(userData.studentCodes);
                    } else {
                        showMessage('Estudiante no encontrado', 'associateMessage');
                    }
                });

                // Función para mostrar mensajes en la interfaz
                function showMessage(message, messageId) {
                    const messageContainer = document.getElementById(messageId);
                    messageContainer.innerHTML = `<div class="alert alert-info mt-3">${message}</div>`;
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        // Si no hay usuario autenticado, redirige al inicio de sesión
        window.location.href = "../index.html";
    }
});