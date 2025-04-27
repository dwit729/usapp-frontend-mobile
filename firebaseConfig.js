// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDU2gwtU2PBzS4GnDCzvV0HZsr07mvZQfg",
    authDomain: "usapp-b776a.firebaseapp.com",
    projectId: "usapp-b776a",
    storageBucket: "usapp-b776a.firebasestorage.app",
    messagingSenderId: "90560751271",
    appId: "1:90560751271:web:e865f688c212a4b8d61d82",
    measurementId: "G-RFK776055N"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(app);
export const FIRESTORE = getFirestore(app);