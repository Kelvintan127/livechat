'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const router = useRouter();

  const handleJoin = () => {
    if (username && room) {
      // Encode the room name properly for URL
      const encodedRoom = encodeURIComponent(room);
      router.push(`/chat/${encodedRoom}?username=${encodeURIComponent(username)}`);
    }
  };

  // Handle input validation
  const handleRoomInput = (e) => {
    const value = e.target.value;
    setRoom(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-center text-blue-500">Join Chat Room</h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input 
              id="username"
              type="text" 
              placeholder="Enter your username" 
              value={username}
              onChange={e => setUsername(e.target.value)} 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
              Room
            </label>
            <input 
              id="room"
              type="text" 
              placeholder="Enter room name" 
              value={room}
              onChange={handleRoomInput} 
              className="w-full px-4 py-2 border rounded-md text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button 
            onClick={handleJoin}
            disabled={!username || !room}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Join Chat
          </button>
        </div>
      </div>
    </div>
  );
}
