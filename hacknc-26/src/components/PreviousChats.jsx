import './PreviousChats.css'
import '../pages/Login.css'

export default function PreviousChats({ chats, onSelectChat }) {
  return (
    <section className="previous-chats" aria-labelledby="previous-chats-heading">
      <h2 id="previous-chats-heading general-black-text">Previous Chats</h2>
      {chats.length === 0 ? (
        <p>No previous chats yet.</p>
      ) : (
        <div className="previous-chat-list">
          {chats.map((chat) => (
            <button
              className="previous-chat general-black-text"
              key={chat.id}
              type="button"
              onClick={() => onSelectChat(chat)}
            >
              {chat.name}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}