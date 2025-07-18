// client/src/services/socket.js
import { io } from 'socket.io-client';

// Initialize socket with auto-reconnect and auth
const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
  autoConnect: false, // Prevent automatic connection
  withCredentials: true,
  reconnectionAttempts: 5, // Number of reconnect attempts
  reconnectionDelay: 1000, // Initial delay (ms)
  reconnectionDelayMax: 5000, // Maximum delay
  auth: (cb) => {
    // Get username from storage or prompt
    const username = localStorage.getItem('username') || prompt('Enter your username:');
    localStorage.setItem('username', username);
    cb({ username });
  }
});

// Enhanced reconnection logic
socket.io.on('reconnect_attempt', () => {
  const username = localStorage.getItem('username');
  socket.auth = { username };
});

// Event type definitions for better autocompletion
const socketEvents = {
  // Core chat
  'send-message': (text) => socket.emit('send-message', text),
  'receive-message': (callback) => socket.on('receive-message', callback),
  
  // Private messaging
  'private-message': ({ recipient, text }) => 
    socket.emit('private-message', { recipient, text }),
  'receive-private': (callback) => 
    socket.on('private-message', callback),
  
  // Rooms
  'join-room': (room) => socket.emit('join-room', room),
  'room-message': ({ room, text }) => 
    socket.emit('room-message', { room, text }),
  'receive-room': (callback) => 
    socket.on('room-message', callback),
  
  // Files
  'send-file': (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('send-file', {
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result
      });
    };
    reader.readAsDataURL(file);
  },
  'receive-file': (callback) => socket.on('receive-file', callback),
  
  // Notifications
  'user-notification': (callback) => 
    socket.on('user-notification', callback),
  
  // Typing indicators
  'typing': (room) => socket.emit('typing', room),
  'user-typing': (callback) => socket.on('user-typing', callback),
  
  // History
  'load-messages': (params) => socket.emit('load-messages', params),
  'messages-loaded': (callback) => socket.on('messages-loaded', callback)
};

// Connection management
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Cleanup all listeners
export const cleanupSocket = () => {
  socket.offAny();
};

export default {
  ...socketEvents,
  connect: connectSocket,
  disconnect: disconnectSocket,
  cleanup: cleanupSocket,
  instance: socket // Direct access when needed
};