import { Link } from 'react-router-dom';
import '../css/navbar.css';
import logo from '../assets/logo.svg';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <img src={logo} alt="Job AI Assistant logo" className="navbar-logo" />
                    <span>Job AI Assistant</span>
                </Link>
            </div>
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/favorites">Favorites</Link>
            </div>
        </nav>
    )
}

export default Navbar;