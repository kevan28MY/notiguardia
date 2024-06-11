import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore,getDoc,doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db=getFirestore(app);

onAuthStateChanged(auth, (user)=>{
    const loggetdInUserId=localStorage.getItem('loggedInUserId');
    if(loggetdInUserId){
        const docRef=doc(db, "users",loggetdInUserId);
        getDoc(docRef)
        .then((docSnap)=>{
            if(docSnap.exits()){
                const userData=docSnap.data();
            }
    
        })
    }
})

const logoutButton=document.getElementById('logout');
logoutButton.addEventListener('click',()=>{
    localStorage.removeItem('loggedInUserId');
    signOut(auth).then(()=>{
        
        window.location.href="../index.html";
    })
})

