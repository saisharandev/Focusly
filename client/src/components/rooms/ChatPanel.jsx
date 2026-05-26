import { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare } from 'lucide-react'

function ChatMessage({ msg, isMe }) {
  return (
    <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
      <div className="w-7 h-7 rounded-full bg-accent-teal/20 flex items-center justify-center text-xs text-accent-teal font-bold flex-shrink-0">
        {msg.name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        <span className="text-xs text-text-muted">{isMe ? 'You' : msg.name}</span>
        <div className={`px-3 py-2 rounded-2xl text-sm ${
          isMe
            ? 'bg-accent-teal/20 text-text-primary rounded-tr-sm'
            : 'bg-white/8 text-text-primary rounded-tl-sm'
        }`}>
          {msg.text}
        </div>
      </div>
    </div>
  )
}

export default function ChatPanel({ messages, onSend, currentUserId, isCollapsed, onToggle }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isCollapsed) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card border border-white/10 text-text-secondary hover:text-text-primary text-sm transition-colors"
      >
        <MessageSquare size={16} />
        Chat
        {messages.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-accent-teal text-bg-base text-xs flex items-center justify-center font-bold">
            {Math.min(messages.length, 9)}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full bg-bg-surface border-l border-white/8 w-80 flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <span className="font-semibold text-sm text-text-primary">Chat</span>
        <button onClick={onToggle} className="text-xs text-text-muted hover:text-text-primary">
          Collapse
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <MessageSquare size={24} className="text-text-muted" />
            <p className="text-text-muted text-sm">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} isMe={msg.userId === currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-3 border-t border-white/8 flex gap-2">
        <input
          className="flex-1 bg-bg-card border border-white/10 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-teal"
          placeholder="Say something..."
          value={input}
          onChange={e => setInput(e.target.value.slice(0, 200))}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-2 rounded-xl bg-accent-teal text-bg-base hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
