import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredConfigKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'appId',
]

let auth

function getFirebaseApp() {
  const missingKeys = requiredConfigKeys.filter((key) => !firebaseConfig[key])
  if (missingKeys.length > 0) {
    throw new Error(
      `Firebase is not configured. Missing: ${missingKeys.join(', ')}`,
    )
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
}

export function getFirebaseAuth() {
  if (auth) {
    return auth
  }

  const app = getFirebaseApp()
  auth = getAuth(app)
  return auth
}

export const db = getFirestore(getFirebaseApp())
