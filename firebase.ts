import {getApp, getApps, initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBK6j8XIWjyAsprD3lUjqIniA6Svh-ovj4",
  authDomain: "chat-with-pdf-c3c02.firebaseapp.com",
  projectId: "chat-with-pdf-c3c02",
  storageBucket: "chat-with-pdf-c3c02.firebasestorage.app",
  messagingSenderId: "526846212760",
  appId: "1:526846212760:web:1a6022958e0f00c47baeed",
  measurementId: "G-1K4169G5PK"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);

export {db, storage};