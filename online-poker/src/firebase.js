// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore, persistentLocalCache } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {

  apiKey: "AIzaSyAm60IJDrgsNug1lvkUnARvqpukpZbPdTI",

  authDomain: "online-poker-7c823.firebaseapp.com",

  projectId: "online-poker-7c823",

  storageBucket: "online-poker-7c823.appspot.com",

  messagingSenderId: "901081366309",

  appId: "1:901081366309:web:e17e09c3620e4c3283e4cc"

};


// Initialize Firebase

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Defaults to single-tab persistence if no tab manager is specified.
initializeFirestore(app, { localCache: persistentLocalCache(/*settings*/{}) });

// Export firestore database
// It will be imported into your react app whenever it is needed
export const db = getFirestore(app);