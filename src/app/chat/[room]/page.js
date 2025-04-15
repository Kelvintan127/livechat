'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import io from 'socket.io-client';
import axios from 'axios';

let socket;

export default function ChatRoom() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Decode the room name from URL
  const room = decodeURIComponent(params.room);
  const username = searchParams.get('username') || 'Anonymous';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!room) return;

    // Initialize socket connection
    socket = io();

    // Join the room
    socket.emit('joinRoom', room);

    // Listen for new messages
    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages?room=${room}`);
        setMessages(res.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [room]);

  const sendMessage = async () => {
    if (!input) return;

    const msg = { username, message: input, room };
  
    // Only emit to socket.io, let the server handle saving
    socket.emit('sendMessage', msg);
    
    setInput('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Room: {room}</h2>
      
      <div className="border rounded-lg p-4 mb-4 h-[400px] overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-blue-500 text-center">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="mb-2 p-2 rounded">
              <strong className="text-blue-600">{m.username}:</strong> <p className='text-red-500'>{m.message}</p>
            </div>
          ))
        )}
      </div>
      
      <div className="flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && sendMessage()} 
          className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
        />
        <button 
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}