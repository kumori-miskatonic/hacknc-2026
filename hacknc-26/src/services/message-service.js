import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'

import { getFirebaseAuth, db } from '../auth/firebase'
import { getPublicKey } from './key-service'
import { deriveConversationKey } from '../crypto/key-exchange'
import { decryptMessage, encryptMessage } from '../crypto/message-crypto'

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

  const messageReference = await addDoc(
    collection(db, 'rooms', roomId, 'messages'),
    {
      ...encrypted,
      senderId: sender.uid,
      recipientId: recipientUid,
      createdAt: serverTimestamp(),
    }
  )

  return {
    id: messageReference.id,
    ...encrypted,
    senderId: sender.uid,
    recipientId: recipientUid,
    plaintext,
  }
}

export function subscribeToMessages(
  roomId,
  currentUserUid,
  onMessages,
  onError,
) {
  const messagesQuery = query(
    collection(db, 'rooms', roomId, 'messages'),
    orderBy('createdAt', 'asc'),
  )

  return onSnapshot(
    messagesQuery,
    async (snapshot) => {
      try {
        const messages = await Promise.all(
          snapshot.docs
            .filter((messageSnapshot) => {
              const data = messageSnapshot.data()
              return data.recipientId === currentUserUid
            })
            .map(async (messageSnapshot) => {
              const data = messageSnapshot.data()
              try {
                const senderPublicKey = await getPublicKey(data.senderId)
                const conversationKey = await deriveConversationKey(
                  currentUserUid,
                  senderPublicKey,
                  roomId,
                )
                const plaintext = await decryptMessage(
                  conversationKey,
                  data,
                )

                return {
                  id: messageSnapshot.id,
                  ...data,
                  plaintext,
                }
              } catch (error) {
                return {
                  id: messageSnapshot.id,
                  ...data,
                  plaintext: '[Unable to decrypt this message]',
                  decryptionError: error.message,
                }
              }
            }),
        )

        onMessages(messages)
      } catch (error) {
        onError(error)
      }
    },
    onError,
  )
}