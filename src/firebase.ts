import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyABMaATDTiczHxHOyUfxbo8YcDgeuon-Wk",
  authDomain: "stoked-rig-5sjh2.firebaseapp.com",
  projectId: "stoked-rig-5sjh2",
  appId: "1:931524047481:web:d58351eceebb25e09ddaa8",
  storageBucket: "stoked-rig-5sjh2.firebasestorage.app",
  messagingSenderId: "931524047481"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, "ai-studio-3a482c79-af0e-4cbe-936f-c1312be0c53f");
