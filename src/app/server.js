const express = require('express');
const next = require('next');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    socket.on('joinRoom', (room) => {
      socket.join(room);
    });

    socket.on('sendMessage', async (msg) => {
      // Save message to database using Prisma
      try {
        await prisma.message.create({
          data: {
            username: msg.username,
            message: msg.message,
            room: msg.room,
            timestamp: new Date()
          }
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
      
      // Broadcast message to room
      io.to(msg.room).emit('newMessage', msg);
    });
  });

  server.use((req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
