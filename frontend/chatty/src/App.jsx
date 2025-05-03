import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { nanoid } from 'nanoid'

const socket = io.connect("http://localhost:5000")
const userName = nanoid(4)

const dummyUsers = [
  { id: 'user1', name: 'Alice' },
  { id: 'user2', name: 'Bob' },
  { id: 'user3', name: 'Charlie' }
]

function App() {
  const [activeUser, setActiveUser] = useState(dummyUsers[0])
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])

  const sendChat = (e) => {
    e.preventDefault()
    if (message.trim() === '') return
    const payload = {
      message,
      userName,
      to: activeUser.id
    }
    socket.emit("chat", payload)
    setMessage('')
  }

  useEffect(() => {
    socket.on("chat", (payload) => {
      setChat((prevChat) => [...prevChat, payload])
    })
    return () => socket.off("chat")
  }, [])

  const filteredChat = chat.filter(msg => msg.to === activeUser.id)

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-100 border-r overflow-y-auto">
        <h2 className="p-4 text-xl font-semibold border-b bg-white">Chats</h2>
        {dummyUsers.map((user) => (
          <div
            key={user.id}
            className={`p-4 cursor-pointer hover:bg-blue-100 ${
              activeUser.id === user.id ? 'bg-blue-200' : ''
            }`}
            onClick={() => setActiveUser(user)}
          >
            {user.name}
          </div>
        ))}
      </aside>

      {/* Chat Section */}
      <section className="flex flex-col flex-1">
        {/* Header */}
        <div className="p-4 bg-blue-600 text-white font-semibold">
          Chat with {activeUser.name}
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
          {filteredChat.map((payload, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[70%] shadow-md ${
                payload.userName === userName
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-white text-gray-800'
              }`}
            >
              <p className="text-sm">{payload.message}</p>
              <span className="text-xs text-gray-300 block mt-1">
                {payload.userName}
              </span>
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={sendChat}
          className="flex items-center p-4 bg-white border-t gap-2"
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-all"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  )
}

export default App
