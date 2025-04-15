// pages/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const router = useRouter();

  const handleJoin = () => {
    if (username && room) {
      router.push(`/chat/${room}?username=${username}`);
    }
  };

  return (
    <div>
      <h1>Join Chat Room</h1>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input placeholder="Room" onChange={e => setRoom(e.target.value)} />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}
