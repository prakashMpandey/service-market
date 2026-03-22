import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import client from '../api/client';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);



  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await client.get('/notifications/');

      console.log(data)
      setNotifications(data.results || []);

      if (data && data.length > 0) {
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user]);




  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (!user) return;

    const token = localStorage.getItem('access');
    if (!token) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log(data)

      const newNotification = {
        id: data.notification_id,
        message: data.message,
        is_read: false,
        created_at: data.created_at,
        booking_id:data.booking_id
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);

      // Attempt to reconnect after 3 seconds
      if (user) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, [user]);



  // Initialize on user login
  useEffect(() => {
    if (user) {
      connectWebSocket();
      fetchNotifications();
    } else {
      // Cleanup on logout
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      setIsConnected(false);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user, fetchNotifications, connectWebSocket]);




  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await client.patch(`/notifications/${notificationId}/read/`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };





  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await client.patch('/notifications/read-all/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };




  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isConnected,
      markAsRead,
      markAllAsRead,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return default values instead of throwing
    return {
      notifications: [],
      unreadCount: 0,
      isConnected: false,
      markAsRead: () => {},
      markAllAsRead: () => {},
      fetchNotifications: () => {}
    };
  }
  return context;
}
