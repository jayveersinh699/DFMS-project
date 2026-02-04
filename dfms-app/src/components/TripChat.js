import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';

export default function TripChat({ bookingId, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // 1. FETCH MESSAGES (Polls every 2 seconds for "Live" feel)
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); 
    return () => clearInterval(interval);
  }, [bookingId]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/${bookingId}`);
      const data = await res.json();
      setMessages(data);
    } catch (e) { console.error("Chat Error"); }
  };

  // 2. AUTO SCROLL TO BOTTOM
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. SEND MESSAGE
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        senderId: currentUser._id,
        senderName: currentUser.name,
        text: newMessage
      })
    });

    setNewMessage("");
    fetchMessages(); // Refresh immediately
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] w-full max-w-md h-[500px] rounded-xl border border-white/20 flex flex-col shadow-2xl">
        
        {/* HEADER */}
        <div className="bg-[#111] p-4 rounded-t-xl border-b border-white/10 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Trip Chat</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0a]">
          {messages.length === 0 && <p className="text-gray-600 text-center text-sm mt-10">Start the conversation...</p>}
          
          {messages.map((msg, index) => {
            const isMe = msg.senderId === currentUser._id;
            return (
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-500 mt-1">
                  {isMe ? 'You' : msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* INPUT AREA */}
        <form onSubmit={handleSend} className="p-4 bg-[#111] border-t border-white/10 flex gap-2">
          <input 
            className="flex-1 bg-black text-white px-4 py-2 rounded-full border border-white/20 focus:border-blue-500 outline-none"
            placeholder="Type a message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 p-2 rounded-full text-white hover:bg-blue-500 transition">
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}