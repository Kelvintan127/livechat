// pages/chat/[room].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import axios from 'axios';

let socket;

export default function ChatRoom() {
  const router = useRouter();
  const { room } = router.query;
  const username = router.query.username || 'Anonymous';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!room) return;

    socket = io();

    socket.emit('joinRoom', room);

    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    const fetchMessages = async () => {
      const res = await axios.get(`/api/messages?room=${room}`);
      setMessages(res.data);
    };

    fetchMessages();

    return () => {
      socket.disconnect();
    };
  }, [room]);

  const sendMessage = async () => {
    if (!input) return;

    const msg = { username, message: input, room };

    socket.emit('sendMessage', msg);
    await axios.post('/api/messages', msg);

    setInput('');
  };

  return (
    <div>
      <h2>Room: {room}</h2>
      <div style={{ height: 300, overflowY: 'scroll' }}>
        {messages.map((m, i) => (
          <div key={i}><strong>{m.username}:</strong> {m.message}</div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
