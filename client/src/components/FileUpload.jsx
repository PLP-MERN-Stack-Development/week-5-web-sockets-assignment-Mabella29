import { useState } from 'react';
import socket from '../services/socket';

export default function FileUpload() {
  const [file, setFile] = useState(null);

  const sendFile = () => {
    if (!file) return;
    
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
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={sendFile}>Send File</button>
    </div>
  );
}