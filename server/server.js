// server/server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors =require('cors');
const dotenv = require('dotenv');
const Message = require('./models/Message.js');

dotenv.config();

// Initialize Express and HTTP server
const app = express();
app.use(cors());
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
});

// Authentication middleware
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('Authentication error: Username required'));
  }
  socket.data.username = username;
  next();
});

// Connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.data.username} (ID: ${socket.id})`);

  // Notify all users about new connection
  io.emit('user-notification', {
    text: `${socket.data.username} joined the chat`,
    type: 'join',
    timestamp: new Date()
  });

  // Global chat
  socket.on('send-message', async (message) => {
    try {
      // Save to database (optional)
      const savedMessage = await Message.create({
        sender: socket.data.username,
        text: message,
        room: 'global'
      });

      io.emit('receive-message', savedMessage);

      // Notification
      io.emit('message-notification', {
        sender: socket.data.username,
        preview: message.slice(0, 20)
      });
    } catch (err) {
      console.error('Message save error:', err);
    }
  });

  // Private messaging
  socket.on('private-message', ({ recipient, text }) => {
    io.to(recipient).emit('private-message', {
      sender: socket.data.username,
      recipient,
      text,
      timestamp: new Date()
    });
  });

  // Room handling
  socket.on('join-room', (room) => {
    socket.join(room);
    socket.emit('room-joined', room);
  });

  socket.on('room-message', ({ room, text }) => {
    io.to(room).emit('room-message', {
      sender: socket.data.username,
      room,
      text,
      timestamp: new Date()
    });
  });

  // File sharing
  socket.on('send-file', (file) => {
    io.emit('receive-file', {
      sender: socket.data.username,
      file,
      timestamp: new Date()
    });
  });

  // Message pagination
  socket.on('load-messages', async ({ room, page = 1 }) => {
    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .skip((page - 1) * 10)
      .limit(10);
    socket.emit('messages-loaded', { room, messages });
  });

  // Typing indicator
  socket.on('typing', (room) => {
    socket.to(room).emit('user-typing', {
      username: socket.data.username,
      room
    });
  });

  // Disconnection
  socket.on('disconnect', () => {
    io.emit('user-notification', {
      text: `${socket.data.username} left the chat`,
      type: 'leave',
      timestamp: new Date()
    });
  });
});

// Error handling
io.on('connection_error', (err) => {
  console.error('Socket connection error:', err.message);
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});