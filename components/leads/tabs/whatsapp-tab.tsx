"use client"

import { useState } from "react"
import { Send, Phone, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type Message = {
  id: string
  text: string
  direction: "outbound" | "inbound"
  timestamp: Date
}

interface WhatsAppTabProps {
  leadName: string
  leadMobile: string | null
}

const DEMO_MESSAGES: Message[] = [
  {
    id: "1",
    text: "Hi! I came across your product and would love to learn more.",
    direction: "inbound",
    timestamp: new Date(Date.now() - 3600000 * 2),
  },
  {
    id: "2",
    text: "Hello! Thanks for reaching out. I'd be happy to tell you more about what we offer. What specifically are you interested in?",
    direction: "outbound",
    timestamp: new Date(Date.now() - 3600000 * 1.8),
  },
  {
    id: "3",
    text: "I'm particularly interested in your enterprise plan. Can we schedule a demo?",
    direction: "inbound",
    timestamp: new Date(Date.now() - 3600000 * 1),
  },
]

export function WhatsAppTab({ leadName, leadMobile }: WhatsAppTabProps) {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES)
  const [input, setInput]       = useState("")

  function sendMessage() {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), text, direction: "outbound", timestamp: new Date() },
    ])
    setInput("")
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-[13px] font-semibold">
            {leadName[0]?.toUpperCase() ?? "L"}
          </div>
          <div>
            <p className="text-[13px] font-medium text-slate-900">{leadName}</p>
            <p className="text-[11px] text-slate-400">{leadMobile ?? "No number"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400">
            <Phone size={14} />
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${
                msg.direction === "outbound"
                  ? "bg-[#d9fdd3] rounded-tr-none"
                  : "bg-white rounded-tl-none"
              }`}
            >
              <p className="text-[13px] text-slate-800 whitespace-pre-wrap">{msg.text}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 text-right">
                {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Send template + input bar */}
      <div className="shrink-0 border-t border-slate-200 bg-white">
        <div className="px-4 pt-2 pb-1">
          <button className="text-[12px] text-green-600 border border-green-200 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md">
            + Send Template
          </button>
        </div>
        <div className="flex items-end gap-2 px-4 pb-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Type a message..."
            className="flex-1 text-[13px] border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-green-400 resize-none max-h-24 overflow-y-auto"
            style={{ minHeight: "38px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed shrink-0 transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
