import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getFirebaseAuth } from '../auth/firebase'
import { findChatRoom } from '../services/chat-room-service'
import { sendEncryptedMessage } from '../services/message-service'
import './Chat.css'

export default function Chat() {
  const { chatKey } = useParams()
  const [roomName, setRoomName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sendStatus, setSendStatus] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    let isCurrent = true

    async function loadRoom() {
      try {
        const room = await findChatRoom(chatKey)
        if (isCurrent) {
          setRoomName(room.name)
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError.message || 'Unable to load this chat.')
        }
      }
    }

    loadRoom()

    return () => {
      isCurrent = false
    }
  }, [chatKey])

  async function handleSendMessage(event) {
    event.preventDefault()
    const user = getFirebaseAuth().currentUser

    if (!user) {
      setSendStatus('You must be signed in to send a message.')
      return
    }

    setIsSending(true)
    setSendStatus('')

    try {
      await sendEncryptedMessage(chatKey, user.uid, message)
      setMessage('')
      setSendStatus('Encrypted message sent.')
    } catch (sendError) {
      setSendStatus(sendError.message || 'Unable to send encrypted message.')
    } finally {
      setIsSending(false)
    }
  }

  if (error) {
    return <p role="alert">{error}</p>
  }

  return (
    <main className="chat-page">
      <h1>{roomName || 'Loading chat...'}</h1>
      <p>Chat key: {chatKey}</p>
      <div className="div1">
        <div className="div2 past-messages">
          <p>Past Messages</p>
        </div>
        <div className="div2 chat">Chats</div>
      </div>
      <div className="div1 row2">
        <div className="div2 MessageBox">
            <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={2000}
              placeholder="Type a message"
              aria-label="Message"
              required
            />
            <button type="submit" disabled={isSending}>
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </form>
          {sendStatus && <p role="status">{sendStatus}</p>}
        </div>
        <div className="div2">Username</div>
      </div>
    </main>
  )
}
