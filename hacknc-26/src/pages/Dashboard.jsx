import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createChatRoom,
  getUserChatRooms,
  joinChatRoom,
} from '../services/chat-room-service'
import PreviousChats from '../components/PreviousChats'
import './Dashboard.css'
import '../pages/Login.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [roomName, setRoomName] = useState('')
  const [chatKey, setChatKey] = useState('')
  const [chatKeyInput, setChatKeyInput] = useState('')
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [isJoiningChat, setIsJoiningChat] = useState(false)
  const [chats, setChats] = useState([])

  useEffect(() => {
    let isCurrent = true

    async function loadChats() {
      try {
        const userChats = await getUserChatRooms()
        if (isCurrent) {
          setChats(userChats)
        }
      } catch (error) {
        if (isCurrent) {
          setStatus(error.message || 'Unable to load previous chats.')
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

  async function handleCreateChat() {
    setStatus('')
    setIsCreatingChat(true)

    try {
      const room = await createChatRoom(roomName)
      setRoomName('')
      setChatKey(room.chatKey)
      setChatKeyInput(room.chatKey)
      navigate(`/chat/${room.chatKey}`)
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
      const room = await joinChatRoom(chatKeyInput)
      setChatKey(room.chatKey)
      navigate(`/chat/${room.chatKey}`)
    } catch (error) {
      setStatus(error.message || 'Unable to join chat.')
    } finally {
      setIsJoiningChat(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <section className="dashboard-main">
          <h1>Welcome to the Dashboard</h1>
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
            className="general-ui-button dashboard-button"
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
            <button type="submit" className="general-ui-button dashboard-button"
            disabled={isJoiningChat}>
              {isJoiningChat ? 'Joining...' : 'Join chat'}
            </button>
          </form>
          {chatKey && <p>Current chat: {chatKey}</p>}
          {status && <p role="status">{status}</p>}
        </section>
        <aside className="dashboard-sidebar">
          <PreviousChats chats={chats} onSelectChat={handleSelectChat} />
        </aside>
      </div>
    </div>
  )
}