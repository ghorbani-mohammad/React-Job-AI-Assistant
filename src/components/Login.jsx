import { useState } from 'react';
import { useAuth } from '../contexts/Auth';
import { requestVerificationCode, verifyEmailCode } from '../services/auth';
import '../css/auth.css';

const Login = ({ onClose }) => {
  const { login } = useAuth();
  const [step, setStep] = useState('email'); // 'email' or 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await requestVerificationCode(email);
      setSuccess('Verification code sent to your email!');
      setStep('code');
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await verifyEmailCode(email, code);
      login(response.user);
      setSuccess('Login successful!');
      // Close modal after successful login
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setCode('');
    setError('');
    setSuccess('');
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await requestVerificationCode(email);
      setSuccess('New verification code sent!');
    } catch (err) {
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome to Job AI Assistant</h2>
          <p>Sign in with your email address</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="auth-btn primary"
              disabled={loading || !email.trim()}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength="6"
                required
                disabled={loading}
              />
              <p className="form-help">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>
            <button 
              type="submit" 
              className="auth-btn primary"
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <div className="auth-actions">
              <button 
                type="button" 
                className="auth-btn secondary"
                onClick={handleBackToEmail}
                disabled={loading}
              >
                Change Email
              </button>
              <button 
                type="button" 
                className="auth-btn secondary"
                onClick={handleResendCode}
                disabled={loading}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
