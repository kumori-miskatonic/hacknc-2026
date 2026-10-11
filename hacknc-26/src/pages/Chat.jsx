import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getFirebaseAuth } from '../auth/firebase'
import {
  findChatRoom,
  getUserChatRooms,
  subscribeToChatMembers,
} from '../services/chat-room-service'
import {
  sendEncryptedMessage,
  subscribeToMessages,
} from '../services/message-service'
import './Chat.css'
import PreviousChats from '../components/PreviousChats'
import "../pages/Login.css"

export default function Chat() {
  const navigate = useNavigate()
  const { chatKey } = useParams()
  const [roomName, setRoomName] = useState('')
  const [recipientUid, setRecipientUid] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sendStatus, setSendStatus] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState([])
  const [chats, setChats] = useState([])
  const hasLoadedMessagesRef = useRef(false)

  useEffect(() => {
    let isCurrent = true

    async function loadChats() {
      try {
        const userChats = await getUserChatRooms()
        if (isCurrent) {
          setChats(userChats)
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError.message || 'Unable to load previous chats.')
        }
      }
    }

    loadChats()

    return () => {
      isCurrent = false
    }
  }, [])

  function handleSelectChat(chat) {
    navigate(`/chat/${chat.chatKey}`)
  }

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

  useEffect(() => {
    hasLoadedMessagesRef.current = false

    const user = getFirebaseAuth().currentUser

    if (!user) {
      queueMicrotask(() => {
        setError('You must be signed in to view this chat.')
      })
      return undefined
    }

    const unsubscribeMembers = subscribeToChatMembers(
      chatKey,
      (members) => {
        const otherMember = members.find((member) => member.uid !== user.uid)
        setRecipientUid(otherMember?.uid || '')
      },
      (memberError) => {
        setError(memberError.message || 'Unable to load chat members.')
      },
    )

    const unsubscribeMessages = subscribeToMessages(
      chatKey,
      user.uid,
      (receivedMessages) => {
        if (!hasLoadedMessagesRef.current) {
          hasLoadedMessagesRef.current = true
          setMessages(receivedMessages)
          return
        }

        setMessages((currentMessages) => {
          const messagesById = new Map(
            currentMessages.map((chatMessage) => [
              chatMessage.id,
              chatMessage,
            ]),
          )

          receivedMessages.forEach((chatMessage) => {
            messagesById.set(chatMessage.id, chatMessage)
          })

          return Array.from(messagesById.values())
        })
      },
      (messageError) => {
        setError(messageError.message || 'Unable to load messages.')
      },
    )

    return () => {
      unsubscribeMembers()
      unsubscribeMessages()
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
      if (!recipientUid) {
        throw new Error(
          'A second member must join before you can send messages.',
        )
      }

      const sentMessage = await sendEncryptedMessage(
        chatKey,
        recipientUid,
        message,
      )
      setMessages((currentMessages) => [...currentMessages, sentMessage])
      setMessage('')
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
          {messages.map((chatMessage) => (
            <p key={chatMessage.id}>
              <strong>
                {chatMessage.senderId === getFirebaseAuth().currentUser?.uid
                  ? 'You'
                  : chatMessage.senderId}
                :
              </strong>{' '}
              {chatMessage.plaintext}
            </p>
          ))}
        </div>
        <div className="div2 chat">
          <PreviousChats chats={chats} onSelectChat={handleSelectChat} />
        </div>
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
