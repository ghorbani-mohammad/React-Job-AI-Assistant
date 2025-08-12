import "../css/favorites.css";
import JobCard from "../components/JobCard";
import { useFavoriteContext } from "../contexts/Favorites";

function Favorites() {
    const {favorites} = useFavoriteContext();
    if (favorites.length === 0) {
        return (
            <div className="favorites-empty">
                <h2>No Faorites jobs yet</h2>
                <p>Add your favorite jobs to your favorites list</p>
            </div>
        )
    }
    return (
        <div className="favorites">
            <h2>My Favorites</h2>
            <div className="favorites-list">
                {favorites.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    )
}

export default Favorites;