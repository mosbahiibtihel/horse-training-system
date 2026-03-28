import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const connectionRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7173/hubs/notifications', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveNotification', (notification) => {
      setNotifications(prev => [
        { ...notification, id: Date.now(), read: false },
        ...prev
      ]);
    });

    connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
    });

    connection.onreconnected(() => {
      console.log('SignalR reconnected');
    });

    const start = async () => {
      try {
        await connection.start();
        console.log('SignalR connected');
      } catch (err) {
        console.error('SignalR error:', err);
        setTimeout(start, 5000);
      }
    };

    start();
    connectionRef.current = connection;

    return () => { connection.stop(); };
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markAllRead };
}