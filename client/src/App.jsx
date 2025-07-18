import { useState, useEffect, useRef } from 'react';
import { socket, connectSocket, disconnectSocket } from './services/socket';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState('');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState('global');
  const [notifications, setNotifications] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const username = localStorage.getItem('username') || 
                    prompt('Enter your username:') || 
                    `User_${Math.floor(Math.random() * 1000)}`;
    
    localStorage.setItem('username', username);
    setCurrentUser(username);
    connectSocket(username);

    // Socket event listeners
    socket.on('connect', () => {
      addNotification('Connected to chat server');
    });

    socket.on('disconnect', () => {
      addNotification('Disconnected from server');
    });

    socket.on('user-list', (userList) => {
      setUsers(userList);
    });

    socket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user-typing', (username) => {
      setTypingUser(username);
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    socket.on('user-notification', (notification) => {
      addNotification(notification.text);
    });

    return () => {
      disconnectSocket();
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user-list');
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('user-notification');
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addNotification = (text) => {
    const newNotification = {
      id: Date.now(),
      text,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 5));
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      socket.emit('send-message', {
        room: currentRoom,
        text: messageInput
      });
      setMessageInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    } else {
      socket.emit('typing', currentRoom);
    }
  };

  const handleRoomChange = (room) => {
    socket.emit('join-room', room);
    setCurrentRoom(room);
    setMessages([]);
    addNotification(`Joined room: ${room}`);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Real-Time Chat</h1>
        <div className="user-info">
          <span className="username">{currentUser}</span>
          <span className={`status-dot ${socket.connected ? 'connected' : 'disconnected'}`}></span>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Rooms</h3>
            <div className="room-list">
              {['global', 'general', 'random'].map(room => (
                <div 
                  key={room}
                  className={`room-item ${currentRoom === room ? 'active' : ''}`}
                  onClick={() => handleRoomChange(room)}
                >
                  # {room}
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Online Users ({users.length})</h3>
            <div className="user-list">
              {users.map(user => (
                <div key={user.id} className="user-item">
                  <span className="user-status"></span>
                  {user.username}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="chat-main">
          <div className="chat-header">
            <h2>#{currentRoom}</h2>
            {isTyping && <div className="typing-indicator">{typingUser} is typing...</div>}
          </div>

          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === currentUser ? 'sent' : 'received'}`}>
                <div className="message-header">
                  <span className="message-sender">{msg.sender}</span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-container">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </main>
      </div>

      <div className="notification-center">
        {notifications.map(notification => (
          <div key={notification.id} className="notification">
            <div className="notification-text">{notification.text}</div>
            <div className="notification-time">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;