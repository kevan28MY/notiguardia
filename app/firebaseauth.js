import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup,getAdditionalUserInfo, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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
auth.lenguageCode='es'
const provider= new GoogleAuthProvider();

const db=getFirestore(app);

function showMessage(message, divId) {
    var messageDiv=document.getElementById(divId);
    messageDiv.style.display= "block";
    messageDiv.innerHTML=message;
    messageDiv.style.opacity=1;
    setTimeout(function(){
        messageDiv.style.opacity=0;
    },5000);
}



const signUp=document.getElementById('submitSignUp');
signUp.addEventListener('click', (event)=> {
    event.preventDefault();
    const email=document.getElementById('rEmail').value;
    const password=document.getElementById('rPassword').value;
    const nombre=document.getElementById('rName').value;
    const auth=getAuth();

    createUserWithEmailAndPassword(auth,email,password)
    .then((userCredential)=>{
        const user=userCredential.user;
        const userData={
            email:email,
            nombre:nombre
        };
        showMessage('Cuenta creada correctamente','signUpMessage');
        const docRef=doc(db,"users",user.uid);
        setDoc(docRef,userData)
        .then(()=>{
            window.location.href="./app/dashboard.html";
        })
        .catch((error)=>{
            console.error("error writting document",error);
        });
    })
    .catch((error)=>{
        const errorCode=error.code;
        if(errorCode=='auth/email-already-in-use'){
            showMessage('El usuario ya existe','signUpMessage');
        }
        else{
            showMessage('unable to create a User', 'signUpMessage');
        }
    })




});


const signIn=document.getElementById('submitSignIn');

signIn.addEventListener('click', (event)=>{
    event.preventDefault();

    const email=document.getElementById('lEmail').value;
    const password=document.getElementById('lPassword').value;

    const auth=getAuth();

    signInWithEmailAndPassword(auth,email,password)
    .then((userCredential)=>{
        showMessage('Inicio de sesión','signInMessage')
        const user=userCredential.user;
        localStorage.setItem('loggedInUserId',user.uid);
        window.location.href="./app/dashboard.html";
    })
    .catch((error)=>{
        const errorCode=error.code;
        if(errorCode==='auth/invalid-credential'){
            showMessage('Email o Contraseña incorrecta','signInMessage');
        }else{
            showMessage('La cuenta no existe','signInMessage')
        }
    })
});

const googleLogin = document.getElementById('googleSignIn');
googleLogin.addEventListener('click', function () {
    signInWithPopup(auth, provider)
        .then(async (result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            // The signed-in user info.
            const user = result.user;
            const additionalUserInfo = getAdditionalUserInfo(result);

            if (additionalUserInfo.isNewUser) {
                // User is new, save their data
                const userData = {
                    email: user.email,
                    nombre: user.displayName
                };
                const docRef = doc(db, "users", user.uid);
                await setDoc(docRef, userData);
            }

            console.log(user);
            window.location.href = "./app/dashboard.html";
            // IdP data available using getAdditionalUserInfo(result)
            // ...
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            showMessage(`Error: ${errorMessage}`, 'signInMessage');
            console.error('Error during Google sign-in:', error);
        });
});
