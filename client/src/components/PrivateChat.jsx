import { useState } from 'react';
import socket from '../services/socket';

export default function PrivateChat() {
  const [privateMessage, setPrivateMessage] = useState('');
  const [recipient, setRecipient] = useState('');

  const sendPrivate = () => {
    socket.emit('private-message', { 
      recipient, 
      text: privateMessage 
    });
    setPrivateMessage('');
  };

  return (
    <div>
      <input
        placeholder="Recipient username"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        placeholder="Private message"
        value={privateMessage}
        onChange={(e) => setPrivateMessage(e.target.value)}
      />
      <button onClick={sendPrivate}>Send Private</button>
    </div>
  );
}