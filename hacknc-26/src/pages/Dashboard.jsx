import { useState } from 'react'
import { getFirebaseAuth } from '../auth/firebase'
import {
  createChatRoom,
  findChatRoom,
} from '../services/chat-room-service'
import { sendEncryptedMessage } from '../services/message-service'

const TEST_ROOM_ID = 'general'

export default function Dashboard() {
  const [status, setStatus] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [chatKey, setChatKey] = useState('')
  const [chatKeyInput, setChatKeyInput] = useState('')
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [isJoiningChat, setIsJoiningChat] = useState(false)

  async function handleTestSend() {
    const user = getFirebaseAuth().currentUser

    if (!user) {
      setStatus('You must be signed in to send a test message.')
      return
    }

    setIsSending(true)
    setStatus('')

    try {
      await sendEncryptedMessage(
        TEST_ROOM_ID,
        user.uid,
        'Encrypted test message',
      )
      setStatus('Encrypted message sent to Firestore.')
    } catch (error) {
      setStatus(error.message || 'Unable to send encrypted message.')
    } finally {
      setIsSending(false)
    }
  }

  async function handleCreateChat() {
    setStatus('')
    setIsCreatingChat(true)

    try {
      const room = await createChatRoom(roomName)
      setRoomName('')
      setChatKey(room.chatKey)
      setChatKeyInput(room.chatKey)
      setStatus(`Chat created. Share this key: ${room.chatKey}`)
    } catch (error) {
      setStatus(error.message || 'Unable to create chat.')
    } finally {
      setIsCreatingChat(false)
    }
  }

  async function handleJoinChat(event) {
    event.preventDefault()
    setStatus('')
    setIsJoiningChat(true)

    try {
      const room = await findChatRoom(chatKeyInput)
      setChatKey(room.chatKey)
      setStatus(`Connected to "${room.name}".`)
    } catch (error) {
      setStatus(error.message || 'Unable to join chat.')
    } finally {
      setIsJoiningChat(false)
    }
  }

  return (
    <div className="dashboard">
      <h1>Welcome to the Dashboard</h1>
      <button type="button" onClick={handleTestSend} disabled={isSending}>
        {isSending ? 'Sending...' : 'Send encrypted test message'}
      </button>
      <div>
        <input
          type="text"
          value={roomName}
          onChange={(event) => setRoomName(event.target.value)}
          maxLength={100}
          placeholder="Room name"
          aria-label="Room name"
        />
        <button
          type="button"
          onClick={handleCreateChat}
          disabled={isCreatingChat}
        >
          {isCreatingChat ? 'Creating...' : 'Create chat key'}
        </button>
        <form onSubmit={handleJoinChat}>
          <input
            type="text"
            value={chatKeyInput}
            onChange={(event) => setChatKeyInput(event.target.value)}
            maxLength={6}
            pattern="[A-Za-z0-9]{6}"
            placeholder="Chat key"
            aria-label="Chat key"
          />
          <button type="submit" disabled={isJoiningChat}>
            {isJoiningChat ? 'Joining...' : 'Join chat'}
          </button>
        </form>
      </div>
      {chatKey && <p>Current chat: {chatKey}</p>}
      {status && <p role="status">{status}</p>}
    </div>
  )
}