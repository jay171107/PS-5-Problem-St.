import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    // Connect to server (proxied by Vite or direct)
    const newSocket = io(socketUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id);
      setIsConnected(true);
      if (activeEventId) {
        newSocket.emit('join_event', activeEventId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    // Listen for live announcements
    newSocket.on('announcement_broadcast', (announcement) => {
      console.log('📢 Urgent Announcement Received:', announcement);
      setActiveAlert(announcement);
      playAlertTone();
    });

    // Listen for schedule delays
    newSocket.on('schedule_rippled', (payload) => {
      console.log('⏱️ Schedule rippled:', payload);
      if (payload.announcement) {
        setActiveAlert(payload.announcement);
        playAlertTone();
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const playAlertTone = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const joinEventRoom = (eventId) => {
    setActiveEventId(eventId);
    if (socket && isConnected) {
      socket.emit('join_event', eventId);
    }
  };

  const dismissAlert = () => {
    setActiveAlert(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeAlert,
        dismissAlert,
        joinEventRoom,
        activeEventId
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
