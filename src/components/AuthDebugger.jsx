import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/Auth';
import { 
  getAccessToken, 
  getRefreshToken, 
  isAuthenticated, 
  isAccessTokenExpired, 
  isRefreshTokenExpired, 
  isTokenExpiringSoon,
  getTokenExpirationTime 
} from '../services/auth';

const AuthDebugger = () => {
  const { user, isLoggedIn, loading, forceSync } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebugger, setShowDebugger] = useState(false);

  const updateDebugInfo = () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    const expirationTime = getTokenExpirationTime();
    
    setDebugInfo({
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isAuthenticated: isAuthenticated(),
      isAccessTokenExpired: isAccessTokenExpired(),
      isRefreshTokenExpired: isRefreshTokenExpired(),
      isTokenExpiringSoon: isTokenExpiringSoon(),
      tokenExpirationTime: expirationTime ? new Date(expirationTime).toLocaleString() : null,
      timeUntilExpiration: expirationTime ? Math.round((expirationTime - Date.now()) / 1000 / 60 / 60) + ' hours' : null,
      contextIsLoggedIn: isLoggedIn,
      contextLoading: loading,
      contextUser: user?.email || 'None',
      timestamp: new Date().toLocaleString()
    });
  };

  useEffect(() => {
    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [isLoggedIn, loading, user]);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!showDebugger) {
    return (
      <button 
        onClick={() => setShowDebugger(true)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        Auth Debug
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '350px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace',
      lineHeight: '1.4'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, color: '#00ff00' }}>Auth Debug Info</h4>
        <button 
          onClick={() => setShowDebugger(false)}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: '#ffff00' }}>Token Status:</strong><br/>
        Access Token: {debugInfo.hasAccessToken ? '✓' : '✗'}<br/>
        Refresh Token: {debugInfo.hasRefreshToken ? '✓' : '✗'}<br/>
        Is Authenticated: {debugInfo.isAuthenticated ? '✓' : '✗'}<br/>
        Access Token Expired: {debugInfo.isAccessTokenExpired ? '✓' : '✗'}<br/>
        Refresh Token Expired: {debugInfo.isRefreshTokenExpired ? '✓' : '✗'}<br/>
        Token Expiring Soon: {debugInfo.isTokenExpiringSoon ? '✓' : '✗'}<br/>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: '#ffff00' }}>Context State:</strong><br/>
        Is Logged In: {debugInfo.contextIsLoggedIn ? '✓' : '✗'}<br/>
        Loading: {debugInfo.contextLoading ? '✓' : '✗'}<br/>
        User: {debugInfo.contextUser}<br/>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: '#ffff00' }}>Token Timing:</strong><br/>
        Expires At: {debugInfo.tokenExpirationTime || 'N/A'}<br/>
        Time Until Expiry: {debugInfo.timeUntilExpiration || 'N/A'}<br/>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <small>Last Updated: {debugInfo.timestamp}</small>
      </div>

      <div>
        <button 
          onClick={() => { updateDebugInfo(); forceSync(); }}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            fontSize: '11px',
            cursor: 'pointer',
            marginRight: '5px'
          }}
        >
          Refresh & Sync
        </button>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Clear & Reload
        </button>
      </div>
    </div>
  );
};

export default AuthDebugger;
