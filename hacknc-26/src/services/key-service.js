import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../auth/firebase'
import { createDeviceKeys } from '../crypto/device-keys'

function publicKeyRef(uid) {
  return doc(db, 'users', uid, 'publicKeys', 'current');
}

export async function registerPublicKey(uid) {
  const ref = publicKeyRef(uid)
  const snapshot = await getDoc(ref)

  if (snapshot.exists()) {
    // Never replace a key automatically.
    return snapshot.data().publicKey
  }

  const publicKey = await createDeviceKeys(uid)

  await setDoc(ref, {
    algorithm: 'ECDH-P256',
    publicKey,
    createdAt: serverTimestamp(),
  })

  return publicKey
}

export async function getPublicKey(uid) {
  const snapshot = await getDoc(publicKeyRef(uid))

  if (!snapshot.exists()) {
    throw new Error('This user has not registered a public key.')
  }

  const data = snapshot.data()

  if (data.algorithm !== 'ECDH-P256') {
    throw new Error('Unsupported public-key algorithm.')
  }

  return data.publicKey
}