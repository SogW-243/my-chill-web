// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDs12YVloqxXUYwXp6MZZ7xr7wqDHEzko8",
  authDomain: "my-chill-web.firebaseapp.com",
  projectId: "my-chill-web",
  storageBucket: "my-chill-web.firebasestorage.app",
  messagingSenderId: "953943475752",
  appId: "1:953943475752:web:770c48ae6302bd9940d71d",
  measurementId: "G-0BS1JNJKPZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;