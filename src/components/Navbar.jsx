import { Link } from "react-router-dom";
import "../css/navbar.css";

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Job AI Assistant</Link>
            </div>
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/favorites">Favorites</Link>
            </div>
        </nav>
    )
}

export default Navbar;