import { useState } from 'react';
import socket from '../services/socket';

export default function RoomChat() {
  const [room, setRoom] = useState('');
  const [roomMessage, setRoomMessage] = useState('');

  const joinRoom = () => {
    socket.emit('join-room', room);
  };

  const sendRoomMessage = () => {
    socket.emit('room-message', { room, text: roomMessage });
    setRoomMessage('');
  };

  return (
    <div>
      <input
        placeholder="Room name"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
      
      <input
        placeholder="Message for room"
        value={roomMessage}
        onChange={(e) => setRoomMessage(e.target.value)}
      />
      <button onClick={sendRoomMessage}>Send to Room</button>
    </div>
  );
}