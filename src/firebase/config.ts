// Firebase configuration for School of Agriculture - Angunakolapelessa
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDLrXt7os1oaMCIcD3MVP7MYWknGAnimSc",
  authDomain: "agri-school-management-s-8539a.firebaseapp.com",
  projectId: "agri-school-management-s-8539a",
  storageBucket: "agri-school-management-s-8539a.firebasestorage.app",
  messagingSenderId: "83532679810",
  appId: "1:83532679810:web:12d2142c0b57f25979c29b",
  measurementId: "G-RS46Y3CGQK"
};

// Initialize Firebase safely (avoid re-initialization in fast-refresh)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
