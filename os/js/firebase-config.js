// Configuração oficial do Firebase para o GLS-OS (Grupo Litoral Seg)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdnciZi6_V5Ar2CszaSz-KhyDwcX8kSrw",
  authDomain: "gls-os-80d40.firebaseapp.com",
  projectId: "gls-os-80d40",
  storageBucket: "gls-os-80d40.firebasestorage.app",
  messagingSenderId: "248616895073",
  appId: "1:248616895073:web:6f1a0c40c9b941f3492020",
  measurementId: "G-9YPW0NDVT9"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
