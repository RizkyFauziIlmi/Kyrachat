import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use

const firebaseConfig = {
  apiKey: "AIzaSyApp4_GXgZy7PpGjhZk5Xj5v82lLuBTKi0",
  authDomain: "kyrachat-f33e6.firebaseapp.com",
  projectId: "kyrachat-f33e6",
  storageBucket: "kyrachat-f33e6.appspot.com",
  messagingSenderId: "606147109307",
  appId: "1:606147109307:web:0371507a4f50ab6d0a249e",
  measurementId: "G-WB8EZX35ZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore()