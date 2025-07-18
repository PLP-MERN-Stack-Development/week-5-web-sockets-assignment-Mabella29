import { useEffect } from 'react';
import socket from '../services/socket';

export default function useNotifications() {
  useEffect(() => {
    const handleNotification = (notif) => {
      if (Notification.permission === 'granted') {
        new Notification(notif.text);
      }
    };

    socket.on('user-notification', handleNotification);
    socket.on('message-notification', handleNotification);

    return () => {
      socket.off('user-notification', handleNotification);
      socket.off('message-notification', handleNotification);
    };
  }, []);
}