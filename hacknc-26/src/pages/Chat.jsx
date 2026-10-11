import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { findChatRoom } from '../services/chat-room-service'
import './Chat.css';

export default function Chat() {
    const { chatKey } = useParams()
    const [roomName, setRoomName] = useState('')
    const [error, setError] = useState('')

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

    if (error) {
        return <p role="alert">{error}</p>
    }

    return (
        <main className="chat-page">
            <h1>{roomName || 'Loading chat...'}</h1>
            <p>Chat key: {chatKey}</p>
            <div class="div1">
                <div class="div2 past-messages">Past Messages</div>
                <div class="div2 chat">Chats</div>
            </div>
            <div class="div1 row2">
                <div class="div2 MessageBox">Message Box</div>
                <div class="div2">Username</div>
            </div>
        </main>
    )
}