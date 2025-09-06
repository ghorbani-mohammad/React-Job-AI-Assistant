import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/Auth';
import '../css/navbar.css';
import logo from '../assets/logo.svg';

function Navbar() {
    const { user, isLoggedIn, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <img src={logo} alt="Job AI Assistant logo" className="navbar-logo" />
                    <span>Job AI Assistant</span>
                </Link>
            </div>
            <div className="navbar-links">
                {isLoggedIn ? (
                    <>
                        <Link to="/">Home</Link>
                        <Link to="/favorites">Favorites</Link>
                        <div className="navbar-user">
                            <span className="user-email">{user?.email}</span>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="navbar-auth">
                        <span className="auth-status">Please sign in</span>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar;