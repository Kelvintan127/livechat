'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import io from 'socket.io-client';
import axios from 'axios';

let socket;

export default function ChatRoom() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const room = decodeURIComponent(params.room);
  const username = searchParams.get('username') || 'Anonymous';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!room) return;

    socket = io();

    socket.emit('joinRoom', room);

    socket.on('newMessage', (msg) => {
      // Ensure the message has a valid timestamp
      const messageWithTimestamp = {
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString()
      };
      setMessages(prev => [...prev, messageWithTimestamp]);
    });

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages?room=${room}`);
        setMessages(res.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    return () => {
      socket.disconnect();
    };
  }, [room]);

  const sendMessage = async () => {
    if (!input) return;

    // Add timestamp to the message object
    const msg = { 
      username, 
      message: input, 
      room,
      timestamp: new Date().toISOString() 
    };

    socket.emit('sendMessage', msg);
    
    setInput('');
  };

  // Function to format time difference
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'just now';
    
    try {
      const messageTime = new Date(timestamp);
      if (isNaN(messageTime.getTime())) return 'just now';
      
      const now = currentTime;
      const diffSeconds = Math.floor((now - messageTime) / 1000);
      
      if (diffSeconds < 60) {
        return 'just now';
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60);
        return `${minutes}m ago`;
      } else if (diffSeconds < 86400) {
        const hours = Math.floor(diffSeconds / 3600);
        return `${hours}h ago`;
      } else {
        return messageTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'just now';
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header - responsive for different screen sizes */}
      <header className="bg-blue-500 text-white p-3 md:p-4 flex justify-between items-center">
        <h2 className="text-lg md:text-2xl font-bold">Room: {room}</h2>
        <span className="text-sm md:text-base bg-blue-600 px-2 py-1 rounded">
          {username}
        </span>
      </header>
      
      {/* Messages container - adapts to screen size */}
      <div className="flex-1 p-2 md:p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((m, i) => (
            <div 
              key={i} 
              className={`mb-3 p-2 rounded-lg max-w-[80%] ${
                m.username === username 
                  ? 'ml-auto bg-blue-100' 
                  : 'mr-auto bg-gray-200'
              }`}
            >
              <div className="flex justify-between items-baseline mb-1">
                <span className={`font-bold text-xl ${
                  m.username === username ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {m.username}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatTimestamp(m.timestamp)}
                </span>
              </div>
              <p className="text-sm md:text-base break-words text-blue-500">{m.message}</p>
            </div>
          ))
        )}
        {/* This empty div is used as a reference for scrolling */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area - adapts to screen size */}
      <div className="border-t p-2 md:p-3 bg-white">
        <div className="flex">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && sendMessage()} 
            className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-500"
            placeholder={isMobile ? "Type message..." : "Type your message here..."}
          />
          <button 
            onClick={sendMessage}
            className="bg-blue-500 text-white px-3 md:px-4 py-2 rounded-r-lg hover:bg-blue-600 transition"
          >
            {isMobile ? "Send" : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}