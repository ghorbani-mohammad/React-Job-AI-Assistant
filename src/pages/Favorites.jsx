import "../css/favorites.css";
import JobCard from "../components/JobCard";
import { useFavoriteContext } from "../contexts/Favorites";
import { useAuth } from "../contexts/Auth";

function Favorites() {
    const {favorites, loading, error, loadFavorites} = useFavoriteContext();
    const { isLoggedIn } = useAuth();

    // Show login prompt if user is not logged in
    if (!isLoggedIn) {
        return (
            <div className="favorites-empty">
                <h2>Please Sign In</h2>
                <p>Sign in to view and manage your favorite jobs</p>
            </div>
        );
    }

    // Show loading state
    if (loading && favorites.length === 0) {
        return (
            <div className="favorites-loading">
                <h2>Loading your favorites...</h2>
                <p>Please wait while we fetch your saved jobs</p>
            </div>
        );
    }

    // Show error state
    if (error && favorites.length === 0) {
        return (
            <div className="favorites-error">
                <h2>Error Loading Favorites</h2>
                <p>{error}</p>
                <button onClick={loadFavorites} className="retry-btn">
                    Try Again
                </button>
            </div>
        );
    }

    // Show empty state
    if (favorites.length === 0) {
        return (
            <div className="favorites-empty">
                <h2>No Favorite Jobs Yet</h2>
                <p>Add your favorite jobs to your favorites list by clicking the heart icon on any job card</p>
            </div>
        );
    }

    return (
        <div className="favorites">
            <div className="favorites-header">
                <h2>My Favorites ({favorites.length})</h2>
                {loading && <span className="loading-indicator">Updating...</span>}
            </div>
            <div className="favorites-list">
                {favorites.map((favorite) => (
                    <JobCard key={favorite.id} job={favorite.job} />
                ))}
            </div>
        </div>
    );
}

export default Favorites;