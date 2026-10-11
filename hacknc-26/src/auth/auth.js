import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { getFirebaseAuth } from './firebase'
import { registerPublicKey } from '../services/key-service'

const googleProvider = new GoogleAuthProvider()

export async function registerUser(email, password, displayName = '') {
  const auth = getFirebaseAuth()
  const credential = await createUserWithEmailAndPassword(auth, email, password)

  if (displayName.trim()) {
    await updateProfile(credential.user, { displayName: displayName.trim() })
  }

  await registerPublicKey(auth.currentUser.uid); // Create and register device keys for the new user
  return credential.user
}

export async function loginUser(email, password) {
  const auth = getFirebaseAuth()
  await setPersistence(auth, browserLocalPersistence)
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth()
  await setPersistence(auth, browserLocalPersistence)
  const credential = await signInWithPopup(auth, googleProvider)
  return credential.user
}

export function observeAuthState(callback) {
  return onAuthStateChanged(getFirebaseAuth(), callback)
}

export function logoutUser() {
  return signOut(getFirebaseAuth())
}

export function resetPassword(email) {
  return sendPasswordResetEmail(getFirebaseAuth(), email)
}
