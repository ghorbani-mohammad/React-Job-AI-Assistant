import { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

function WebSocketTester() {
  const [testMessage, setTestMessage] = useState('');
  const { 
    connectionStatus, 
    lastMessage, 
    newJobs, 
    sendMessage, 
    isConnected 
  } = useWebSocket();

  const handleSendTestMessage = () => {
    if (testMessage.trim()) {
      sendMessage({
        type: 'test',
        message: testMessage
      });
      setTestMessage('');
    }
  };

  const simulateNewJob = () => {
    // This would normally come from the server, but for testing
    sendMessage({
      type: 'simulate_job',
      job: {
        id: Date.now(),
        title: 'Test Job Position',
        company: 'Test Company',
        location: 'Remote',
        posted_date: new Date().toISOString()
      }
    });
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      left: '20px', 
      background: '#1a1a1a', 
      border: '1px solid #333', 
      borderRadius: '8px', 
      padding: '16px',
      minWidth: '300px',
      fontSize: '14px',
      zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#eaeaea' }}>WebSocket Tester</h3>
      
      <div style={{ marginBottom: '8px', color: '#eaeaea' }}>
        Status: <span style={{ 
          color: isConnected ? '#22c55e' : '#ef4444',
          fontWeight: 'bold'
        }}>
          {connectionStatus}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px', color: '#eaeaea' }}>
        New Jobs: <span style={{ color: '#646cff' }}>{newJobs.length}</span>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Test message"
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #333',
            borderRadius: '4px',
            background: '#2a2a2a',
            color: '#eaeaea',
            fontSize: '12px'
          }}
        />
        <button
          onClick={handleSendTestMessage}
          disabled={!isConnected || !testMessage.trim()}
          style={{
            marginTop: '4px',
            padding: '6px 12px',
            background: isConnected ? '#646cff' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            fontSize: '12px'
          }}
        >
          Send Test
        </button>
      </div>
      
      <button
        onClick={simulateNewJob}
        disabled={!isConnected}
        style={{
          padding: '6px 12px',
          background: isConnected ? '#22c55e' : '#666',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isConnected ? 'pointer' : 'not-allowed',
          fontSize: '12px',
          marginBottom: '8px'
        }}
      >
        Simulate New Job
      </button>
      
      {lastMessage && (
        <div style={{ 
          marginTop: '8px',
          padding: '8px',
          background: '#2a2a2a',
          borderRadius: '4px',
          fontSize: '11px'
        }}>
          <div style={{ color: '#9aa0a6' }}>Last Message:</div>
          <div style={{ color: '#eaeaea' }}>
            Type: {lastMessage.type}
          </div>
          <div style={{ color: '#9aa0a6', fontSize: '10px' }}>
            {new Date(lastMessage.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}

export default WebSocketTester;

