import { useState } from 'react'
import { getFirebaseAuth } from '../auth/firebase'
import { sendEncryptedMessage } from '../services/message-service'

const TEST_ROOM_ID = 'general'
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

export default function Dashboard() {
  const [status, setStatus] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [chatKey, setChatKey] = useState('')
  const [chatKeyInput, setChatKeyInput] = useState('')

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

  function handleCreateChat() {
    const newChatKey = createChatKey()
    setChatKey(newChatKey)
    setChatKeyInput(newChatKey)
    setStatus(`Chat created. Share this key: ${newChatKey}`)
  }

  function handleJoinChat(event) {
    event.preventDefault()
    const requestedChatKey = chatKeyInput.trim()

    if (!/^[A-Za-z0-9]{6}$/.test(requestedChatKey)) {
      setStatus('Enter a six-character alphanumeric chat key.')
      return
    }

    setChatKey(requestedChatKey)
    setStatus(`Joined chat: ${requestedChatKey}`)
  }

  return (
    <div className="dashboard">
      <h1>Welcome to the Dashboard</h1>
      <button type="button" onClick={handleTestSend} disabled={isSending}>
        {isSending ? 'Sending...' : 'Send encrypted test message'}
      </button>
      <div>
        <button type="button" onClick={handleCreateChat}>
          Create chat key
        </button>
        <form onSubmit={handleJoinChat}>
          <input
            type="text"
            value={chatKeyInput}
            onChange={(event) => setChatKeyInput(event.target.value)}
            maxLength={CHAT_KEY_LENGTH}
            pattern="[A-Za-z0-9]{6}"
            placeholder="Chat key"
            aria-label="Chat key"
          />
          <button type="submit">Join chat</button>
        </form>
      </div>
      {chatKey && <p>Current chat: {chatKey}</p>}
      {status && <p role="status">{status}</p>}
    </div>
  )
}