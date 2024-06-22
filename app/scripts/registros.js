import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, where, query, getDocs, doc,getDoc,orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const studentCodes = userData.studentCodes || [];

                const tablaRegistros = document.getElementById('registrosTable').getElementsByTagName('tbody')[0];
                tablaRegistros.innerHTML = ''; // Limpiar filas existentes en la tabla

                // Consultar registros de acciones_estudiantes filtrando por los studentCodes
                const q = query(collection(db, 'acciones_estudiantes'), where('cod_estudiante', 'in', studentCodes), orderBy('timestamp', 'desc'));
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach(async (docSnapshot) => {
                    const data = docSnapshot.data();
                    const fechaHora = new Date(data.timestamp.seconds * 1000);
                    const fecha = fechaHora.toLocaleDateString('es-ES'); // Formato de fecha
                    const hora = fechaHora.toLocaleTimeString(); // Formato de hora
                    const codigo = data.cod_estudiante;
                    const registro = data.accion;

                    if (codigo) {
                        // Obtener el nombre del estudiante asociado al código
                        const studentDocRef = doc(db, 'students', codigo);
                        const studentDocSnap = await getDoc(studentDocRef);

                        if (studentDocSnap.exists()) {
                            const studentData = studentDocSnap.data();
                            const nombre = studentData.nombre || "Desconocido";

                            // Simular la fila que se insertará en la tabla
                            const filaTabla = {
                                fecha: fecha,
                                hora: hora,
                                codigo: codigo,
                                nombre: nombre,
                                registro: registro
                            };

                            // Insertar fila en la tabla
                            const newRow = tablaRegistros.insertRow();
                            newRow.innerHTML = `
                                <td>${fecha}</td>
                                <td>${hora}</td>
                                <td>${codigo}</td>
                                <td>${nombre}</td>
                                <td>${registro}</td>
                            `;
                        } else {
                            console.log(`No existe documento de estudiante con código ${codigo}`);
                        }
                    } else {
                        console.log("El código de estudiante no está definido en el registro.");
                    }
                });
            }
        } catch (error) {
            console.error("Error al cargar registros:", error);
        }
    } else {
        // Usuario no autenticado, redirigir a página de inicio de sesión
        window.location.href = "../index.html";
    }
});