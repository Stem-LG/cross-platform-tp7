import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAq9H_IPX7mgIsN-2PQfagrkFASqaO4IMA",
    authDomain: "group-notes-1.firebaseapp.com",
    projectId: "group-notes-1",
    storageBucket: "group-notes-1.firebasestorage.app",
    messagingSenderId: "164200750960",
    appId: "1:164200750960:web:f632db531938227c5639b5"
};

const app = initializeApp(firebaseConfig);

// Initialize auth with persistence
const auth = initializeAuth(app);

export { auth };
export default app;
export const db = getFirestore(app); 