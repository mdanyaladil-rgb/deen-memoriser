// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3Z-jsHTAxfSnbgy5dB6pbS1etoxJ95zo",
  authDomain: "quran-memoriser.firebaseapp.com",
  projectId: "quran-memoriser",
  storageBucket: "quran-memoriser.appspot.com",
  messagingSenderId: "849046326870",
  appId: "1:849046326870:web:abcdef123456",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
