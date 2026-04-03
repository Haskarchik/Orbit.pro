import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBnwMzPBEgybqSIAslr6XNXbyyUnpyAfLc",
    authDomain: "orbit-5160d.firebaseapp.com",
    projectId: "orbit-5160d",
    storageBucket: "orbit-5160d.firebasestorage.app",
    messagingSenderId: "827631703244",
    appId: "1:827631703244:web:df1fcb67c9ab71e63f1e69",
    measurementId: "G-DGVS3P7VYM"
};

// Initialize Firebase for Next.js (client-side safe)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
