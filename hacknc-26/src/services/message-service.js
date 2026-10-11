import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore'

import { getFirebaseAuth, db } from '../auth/firebase'
import { getPublicKey } from './key-service'
import { deriveConversationKey } from '../crypto/key-exchange'
import { encryptMessage } from '../crypto/message-crypto'

export async function sendEncryptedMessage(
  roomId,
  recipientUid,
  plaintext,
) {
  const sender = getFirebaseAuth().currentUser

  if (!sender) {
    throw new Error('You must sign in first.')
  }

  if (!roomId.trim() || !recipientUid.trim()) {
    throw new Error('A room ID and recipient are required.')
  }

  if (!plaintext.trim() || plaintext.length > 2000) {
    throw new Error('Message must be 1–2000 characters.')
  }

  const recipientPublicKey = await getPublicKey(recipientUid)

  const key = await deriveConversationKey(
    sender.uid,
    recipientPublicKey,
    roomId,
  )

  const encrypted = await encryptMessage(key, plaintext)

  await addDoc(
    collection(db, 'rooms', roomId, 'messages'),
    {
      ...encrypted,
      senderId: sender.uid,
      createdAt: serverTimestamp(),
    }
  )
}