class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.listeners = new Map();
    this.userId = 'user123'; // You can make this dynamic
    this.apiKey = import.meta.env.VITE_API_KEY || 'your-public-api-key';
  }

  connect(url = 'wss://social.m-gh.com/ws/') {
    try {
      this.socket = new WebSocket(url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Authenticate user
      this.send({
        type: 'authenticate',
        userId: this.userId,
        apiKey: this.apiKey
      });

      this.emit('connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.isConnected = false;
      this.emit('disconnected');
      this.scheduleReconnect();
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'authenticated':
        this.emit('authenticated');
        break;
        
      case 'new_job':
        console.log('New job received:', data.job);
        this.emit('new_job', data.job);
        break;
        
      case 'job_status_changed':
        console.log('Job status changed:', data);
        this.emit('job_status_changed', data);
        break;
        
      case 'error':
        console.error('Server error:', data.message);
        this.emit('server_error', data.message);
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', data);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached. Giving up.');
      this.emit('max_reconnect_attempts_reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.socket?.readyState
    };
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;

