import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getDatabase, ref, set, push } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "1234569",
  authDomain: "ai-security-surveillance-84a86.firebaseapp.com",
  databaseURL: "https://ai-security-surveillance-84a86-default-rtdb.firebaseio.com",
  projectId: "ai-security-surveillance-84a86",
  storageBucket: "ai-security-surveillance-84a86.firebasestorage.app",
  messagingSenderId: "286844161320",
  appId: "1:286844161320:web:8e604fad6e39a935b1541d",
  measurementId: "G-J39QRKYSCE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Realtime Database and get a reference to the service
const rtdb = getDatabase(app);

/**
 * Sends a message "hello" to Firebase Firestore and Realtime Database
 */
export const sendHelloMessage = async (userEmail = "Anonymous") => {
    try {
        // 1. Send to Firestore
        await addDoc(collection(db, "messages"), {
            text: "hello",
            user: userEmail,
            timestamp: serverTimestamp()
        });

        // 2. Send to Realtime Database
        const msgRef = ref(rtdb, 'messages');
        const newMessageRef = push(msgRef);
        await set(newMessageRef, {
            text: "hello",
            user: userEmail,
            timestamp: Date.now()
        });

        console.log("✅ 'hello' message sent to Firebase!");
    } catch (error) {
        console.error("❌ Error sending message to Firebase:", error);
    }
};

export { app, db, rtdb, analytics };
