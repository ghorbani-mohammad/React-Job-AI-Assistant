import "../css/jobcard.css";
import { useFavoriteContext } from "../contexts/Favorites";

function JobCard({job}) {
    const {addFavorite, removeFavorite, isFavorite} = useFavoriteContext();
    const favorite = isFavorite(job.id);

    function onFavoriteClick(e) {
        e.preventDefault();
        if (favorite) {
            removeFavorite(job.id);
        } else {
            addFavorite(job);
        }
    }
    return (
        <div className="job-card">
            <div className="job-poster">
                <img src={job.image} alt={job.title} />
                <div className="job-overlay">
                    <button className={`favorite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                        ❤️
                    </button>
                </div>
            </div>
            <div className="job-info">
                <h3>{job.title}</h3>
                <p>{job.release_date}</p>
            </div>
        </div>
    )

}

export default JobCard;