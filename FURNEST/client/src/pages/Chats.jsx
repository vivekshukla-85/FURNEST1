import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getConversations, getOrCreateChat, getMessages, sendMessage } from '../services/api.js'

export default function Chats({ currentUser }) {
  const location = useLocation()
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null) // { chat_id, partner }
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    getConversations().then(setConversations)
  }, [])

  // Arriving from a post's "Start a chat" button: create/find the chat, then select it.
  useEffect(() => {
    const otherUserId = location.state?.otherUserId
    if (!otherUserId) return
    getOrCreateChat({ otherUserId, postId: location.state?.postId }).then((chat) => {
      setActiveChat({ chat_id: chat._id, partner: { _id: otherUserId } })
    })
  }, [location.state])

  useEffect(() => {
    if (activeChat) getMessages(activeChat.chat_id).then(setMessages)
  }, [activeChat])

  async function handleSend(e) {
    e.preventDefault()
    if (!draft.trim()) return
    const message = await sendMessage({ chatId: activeChat.chat_id, content: draft })
    setMessages((prev) => [...prev, message])
    setDraft('')
  }

  const currentId = currentUser?._id || currentUser?.id

  return (
    <div className="mx-auto flex max-w-4xl gap-6 px-4 py-8 sm:px-6">
      <aside className="w-56 shrink-0">
        <h2 className="mb-3 font-display text-lg font-semibold text-pine">Chats</h2>
        <div className="flex flex-col gap-1">
          {conversations.map(({ chat_id, partner, lastMessage }) => (
            <button
              key={chat_id}
              type="button"
              onClick={() => setActiveChat({ chat_id, partner })}
              className={`rounded-lg px-3 py-2 text-left text-sm ${
                activeChat?.chat_id === chat_id ? 'bg-pine text-white' : 'hover:bg-white'
              }`}
            >
              <p className="font-medium">{partner?.name || partner?.username}</p>
              <p className={`truncate text-xs ${activeChat?.chat_id === chat_id ? 'text-white/70' : 'text-bark/50'}`}>
                {lastMessage?.content}
              </p>
            </button>
          ))}
          {conversations.length === 0 && <p className="text-sm text-bark/50">No conversations yet.</p>}
        </div>
      </aside>

      <section className="flex-1">
        {!activeChat ? (
          <p className="text-bark/60">Pick a conversation, or start one from a post.</p>
        ) : (
          <div className="flex h-[60vh] flex-col rounded-card border border-sand bg-white">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    m.sender === currentId ? 'ml-auto bg-pine text-white' : 'bg-meadow text-bark'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {messages.length === 0 && <p className="text-sm text-bark/50">Say hello to get started.</p>}
            </div>
            <form onSubmit={handleSend} className="flex gap-2 border-t border-sand p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="focus-ring flex-1 rounded-full border border-sand bg-white px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-full bg-pine px-4 py-2 text-sm font-medium text-white">
                Send
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}
