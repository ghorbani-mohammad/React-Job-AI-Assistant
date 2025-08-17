import '../css/jobcard.css';
import { useFavoriteContext } from '../contexts/Favorites';
import defaultJobImage from '../assets/default-job.svg';

function JobCard({job}) {
    const {addFavorite, removeFavorite, isFavorite} = useFavoriteContext();
    const favorite = isFavorite(job.id);
    const imageSrc = job.image && job.image.trim() !== '' ? job.image : defaultJobImage;

    function handleImageError(e) {
        if (e.currentTarget.src !== defaultJobImage) {
            e.currentTarget.src = defaultJobImage;
        }
    }

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
                <img src={imageSrc} alt={job.title} onError={handleImageError} />
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