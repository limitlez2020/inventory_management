// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkIYIn1zs1Ep67ixqg4SJv7_E48OSa56k",
  authDomain: "inventory-management-8538f.firebaseapp.com",
  projectId: "inventory-management-8538f",
  storageBucket: "inventory-management-8538f.appspot.com",
  messagingSenderId: "652809059668",
  appId: "1:652809059668:web:8a7286c3d27be81e8a1cc1",
  measurementId: "G-FFVCWBXMK8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export {analytics, firestore, storage};
