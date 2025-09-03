import { useEffect, useRef, useCallback, useState } from 'react';
import websocketService from '../services/websocket';

export const useWebSocket = (url = 'wss://social.m-gh.com/ws/') => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const [newJobs, setNewJobs] = useState([]);
  const eventListenersRef = useRef(new Map());

  const updateConnectionStatus = useCallback(() => {
    const status = websocketService.getConnectionStatus();
    if (status.isConnected) {
      setConnectionStatus('Connected');
    } else if (status.reconnectAttempts > 0) {
      setConnectionStatus(`Reconnecting... (${status.reconnectAttempts})`);
    } else {
      setConnectionStatus('Disconnected');
    }
  }, []);

  const addEventListener = useCallback((event, callback) => {
    websocketService.on(event, callback);
    
    // Store reference for cleanup
    if (!eventListenersRef.current.has(event)) {
      eventListenersRef.current.set(event, []);
    }
    eventListenersRef.current.get(event).push(callback);
  }, []);

  const removeEventListener = useCallback((event, callback) => {
    websocketService.off(event, callback);
    
    // Remove from reference
    if (eventListenersRef.current.has(event)) {
      const callbacks = eventListenersRef.current.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }, []);

  const sendMessage = useCallback((message) => {
    websocketService.send(message);
  }, []);

  const connect = useCallback(() => {
    websocketService.connect(url);
  }, [url]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  useEffect(() => {
    // Set up connection event listeners
    const onConnected = () => {
      updateConnectionStatus();
    };

    const onDisconnected = () => {
      updateConnectionStatus();
    };

    const onAuthenticated = () => {
      setConnectionStatus('Socket is connected. Awaiting Job Updates...');
    };

    const onNewJob = (job) => {
      setLastMessage({ type: 'new_job', job, timestamp: Date.now() });
      setNewJobs(prev => [job, ...prev.slice(0, 9)]); // Keep last 10 new jobs
    };

    const onJobStatusChanged = (data) => {
      setLastMessage({ type: 'job_status_changed', data, timestamp: Date.now() });
    };

    const onError = (error) => {
      setLastMessage({ type: 'error', error, timestamp: Date.now() });
      updateConnectionStatus();
    };

    const onServerError = (message) => {
      setLastMessage({ type: 'server_error', message, timestamp: Date.now() });
    };

    const onMaxReconnectAttempts = () => {
      setConnectionStatus('Connection Failed');
    };

    // Add event listeners
    addEventListener('connected', onConnected);
    addEventListener('disconnected', onDisconnected);
    addEventListener('authenticated', onAuthenticated);
    addEventListener('new_job', onNewJob);
    addEventListener('job_status_changed', onJobStatusChanged);
    addEventListener('error', onError);
    addEventListener('server_error', onServerError);
    addEventListener('max_reconnect_attempts_reached', onMaxReconnectAttempts);

    // Connect to WebSocket
    connect();

    // Cleanup function
    return () => {
      // Remove all event listeners
      eventListenersRef.current.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          websocketService.off(event, callback);
        });
      });
      eventListenersRef.current.clear();
    };
  }, [url, addEventListener, connect, updateConnectionStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionStatus,
    lastMessage,
    newJobs,
    sendMessage,
    connect,
    disconnect,
    addEventListener,
    removeEventListener,
    isConnected: connectionStatus === 'Connected' || connectionStatus === 'Authenticated'
  };
};

