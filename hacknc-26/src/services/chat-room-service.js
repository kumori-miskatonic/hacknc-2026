import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, getFirebaseAuth } from '../auth/firebase'

const CHAT_KEY_LENGTH = 6
const CHAT_KEY_CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function createChatKey() {
  const randomValues = crypto.getRandomValues(
    new Uint32Array(CHAT_KEY_LENGTH),
  )

  return Array.from(
    randomValues,
    (value) => CHAT_KEY_CHARACTERS[value % CHAT_KEY_CHARACTERS.length],
  ).join('')
}

function roomRef(chatKey) {
  return doc(db, 'rooms', chatKey)
}

export async function createChatRoom(roomName) {
  const user = getFirebaseAuth().currentUser

  if (!user) {
    throw new Error('You must sign in first.')
  }

  const trimmedRoomName = roomName.trim()
  if (!trimmedRoomName) {
    throw new Error('Enter a room name before creating a chat.')
  }

  if (trimmedRoomName.length > 100) {
    throw new Error('Room names must be 100 characters or fewer.')
  }

  let chatKey = createChatKey()
  let existingRoom = await getDoc(roomRef(chatKey))

  while (existingRoom.exists()) {
    chatKey = createChatKey()
    existingRoom = await getDoc(roomRef(chatKey))
  }

  await setDoc(roomRef(chatKey), {
    chatKey,
    name: trimmedRoomName,
    ownerId: user.uid,
    createdAt: serverTimestamp(),
  })

  return { chatKey, name: trimmedRoomName }
}

export async function findChatRoom(chatKey) {
  const normalizedChatKey = chatKey.trim()

  if (!/^[A-Za-z0-9]{6}$/.test(normalizedChatKey)) {
    throw new Error('Enter a six-character alphanumeric chat key.')
  }

  const snapshot = await getDoc(roomRef(normalizedChatKey))

  if (!snapshot.exists()) {
    throw new Error('No chat room was found with that key.')
  }

  const data = snapshot.data()
  return {
    chatKey: normalizedChatKey,
    name: data.name,
  }
}
