// src/firebase.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import dotenv from 'dotenv'

dotenv.config()

// Load .env only if in a Node.js-like runtime
if (typeof process !== 'undefined' && process.env) {
  import('dotenv').then((dotenv) => dotenv.config())
}

// check if the environment variables are loaded correctly
// console.log('🔥 Firebase API Key:', process.env.VITE_FIREBASE_API_KEY)

const firebaseConfig = {
  apiKey:
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY
      ? import.meta.env.VITE_FIREBASE_API_KEY
      : process.env.VITE_FIREBASE_API_KEY,

  authDomain:
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN
      ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
      : process.env.VITE_FIREBASE_AUTH_DOMAIN,

  projectId:
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID
      ? import.meta.env.VITE_FIREBASE_PROJECT_ID
      : process.env.VITE_FIREBASE_PROJECT_ID,

  storageBucket:
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET
      ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
      : process.env.VITE_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID
      ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
      : process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID
      ? import.meta.env.VITE_FIREBASE_APP_ID
      : process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
