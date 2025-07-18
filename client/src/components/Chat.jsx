import { useState, useEffect } from 'react';
import socket from '../services/socket';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');

  useEffect(() => {
    socket.connect();
    
    socket.on('receive-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user-typing', (username) => {
      setTypingUser(username);
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    return () => {
      socket.off('receive-message');
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send-message', message);
      setMessage('');
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.sender}</strong>: {msg.text}
          </div>
        ))}
      </div>
      {isTyping && <div>{typingUser} is typing...</div>}
      <input 
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          socket.emit('typing');
        }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}