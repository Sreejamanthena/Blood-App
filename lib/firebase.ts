import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAhfF4Q7uQEattUdg4OO_jc0wuugFPdLCc",
  authDomain: "blood-donation-app-decce.firebaseapp.com",
  projectId: "blood-donation-app-decce",
  storageBucket: "blood-donation-app-decce.firebasestorage.app",
  messagingSenderId: "839760259237",
  appId: "1:839760259237:web:bf703275983f92a8f8c54c",
  measurementId: "G-12XN5LDRCT"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
