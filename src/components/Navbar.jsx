import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/Auth';
import { useSubscription } from '../contexts/Subscription';
import Login from './Login';
import { useState } from 'react';
import '../css/navbar.css';
import logo from '../assets/logo.svg';
import notificationSoundService from '../services/notificationSound';

function Navbar() {
    const { user, isLoggedIn, logout, loading } = useAuth();
    const { hasPremium, daysRemaining, isExpired, pendingPayment } = useSubscription();
    const [showLogin, setShowLogin] = useState(false);
    const [isMuted, setIsMuted] = useState(notificationSoundService.isMutedState());

    const handleLogout = () => {
        logout();
    };

    const handleLoginClick = () => {
        setShowLogin(true);
    };

    const handleLoginClose = () => {
        setShowLogin(false);
    };

    const handleToggleMute = () => {
        const newMuteState = notificationSoundService.toggleMute();
        setIsMuted(newMuteState);
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    <Link to="/">
                        <img src={logo} alt="Job AI Assistant logo" className="navbar-logo" />
                        <span>Job AI Assistant</span>
                    </Link>
                </div>
                <div className="navbar-links">
                    <Link to="/">Home</Link>
                    <button 
                        onClick={handleToggleMute}
                        className="notification-toggle"
                        title={isMuted ? 'Unmute job notification sounds - You will hear a sound when new jobs arrive' : 'Mute job notification sounds - No sound will play when new jobs arrive'}
                    >
                        {isMuted ? '🔇' : '🔊'}
                    </button>
                    {loading ? (
                        <div className="navbar-loading">
                            <span>Loading...</span>
                        </div>
                    ) : isLoggedIn ? (
                        <>
                            <Link to="/favorites">Favorites</Link>
                            <Link to="/profile">Profile</Link>
                            <Link to="/subscription" className="subscription-link">
                                {pendingPayment ? (
                                    <span className="pending-payment">
                                        ⏳ Payment Pending
                                    </span>
                                ) : hasPremium ? (
                                    <span className="premium-status">
                                        ✨ Premium
                                        {isExpired && <span className="expired-indicator"> (Expired)</span>}
                                        {!isExpired && daysRemaining <= 7 && daysRemaining > 0 && (
                                            <span className="expiring-soon"> ({daysRemaining}d left)</span>
                                        )}
                                    </span>
                                ) : (
                                    <span className="upgrade-prompt">Upgrade</span>
                                )}
                            </Link>
                            <div className="navbar-user">
                                <span className="user-email">{user?.email}</span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="navbar-auth">
                            <button onClick={handleLoginClick} className="login-btn">
                                Sign In
                            </button>
                        </div>
                    )}
                </div>
            </nav>
            
            {/* Login Modal */}
            {showLogin && (
                <div className="login-modal-overlay" onClick={handleLoginClose}>
                    <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="login-modal-close" onClick={handleLoginClose}>
                            ×
                        </button>
                        <Login onClose={handleLoginClose} />
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar;