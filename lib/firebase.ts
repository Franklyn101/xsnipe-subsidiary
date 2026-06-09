import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
// }
const firebaseConfig = {
   apiKey: "AIzaSyCCIDoMl8aDIT7NVBFaF307B3oyvHzJKc8",
  authDomain: "solbot-df063.firebaseapp.com",
  projectId: "solbot-df063",
  storageBucket: "solbot-df063.firebasestorage.app",
  messagingSenderId: "740228815321",
  appId: "1:740228815321:web:a49a0487f2faeae84661c8",
  measurementId: "G-N8S1W0T2N4",
   databaseURL: "https://solbot-df063-default-rtdb.firebaseio.com"
};


const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
const auth = getAuth(app)
const realtimeDb = getDatabase(app)

export { db, auth, realtimeDb }
