import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { SocketEvents } from '@/types';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const token = Cookies.get('token');
    
    if (!token) {
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 2000, // Wait 2 seconds before reconnecting
      reconnectionDelayMax: 10000, // Max wait time of 10 seconds
      reconnectionAttempts: 5, // Only try 5 times
      randomizationFactor: 0.3
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        socketInstance.connect();
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      
      reconnectAttempts.current += 1;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        toast.error('Connection failed. Please refresh the page.');
        socketInstance.disconnect();
      }
    });

    socketInstance.on('error', (error: { message: string }) => {
      toast.error(error.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const emit = useCallback(<K extends keyof SocketEvents>(
    event: K,
    data: SocketEvents[K]
  ) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  }, [socket, isConnected]);

  const on = <K extends keyof SocketEvents>(
    event: K,
    callback: (data: SocketEvents[K]) => void
  ) => {
    if (socket) {
      socket.on(event as string, callback);
    }
  };

  const off = <K extends keyof SocketEvents>(
    event: K,
    callback?: (data: SocketEvents[K]) => void
  ) => {
    if (socket) {
      socket.off(event as string, callback);
    }
  };

  const joinGroup = useCallback((groupId: string) => {
    emit('join_group', { groupId });
  }, [emit]);

  const leaveGroup = useCallback((groupId: string) => {
    emit('leave_group', { groupId });
  }, [emit]);

  const sendMessage = (groupId: string, content: string, messageType?: string) => {
    emit('send_message', { groupId, content, messageType });
  };

  const startTyping = (groupId: string) => {
    emit('typing_start', { groupId });
  };

  const stopTyping = (groupId: string) => {
    emit('typing_stop', { groupId });
  };

  const editMessage = (messageId: string, content: string) => {
    emit('edit_message', { messageId, content });
  };

  const deleteMessage = (messageId: string) => {
    emit('delete_message', { messageId });
  };

  return {
    socket,
    isConnected,
    emit,
    on,
    off,
    joinGroup,
    leaveGroup,
    sendMessage,
    startTyping,
    stopTyping,
    editMessage,
    deleteMessage,
  };
};
