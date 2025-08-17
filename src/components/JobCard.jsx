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

    function truncateWords(text, maxWords) {
        if (!text) return '';
        const words = text.trim().split(/\s+/);
        if (words.length <= maxWords) return text;
        return words.slice(0, maxWords).join(' ') + '…';
    }

    function openJobUrl() {
        if (job?.url) {
            window.open(job.url, '_blank', 'noopener');
        }
    }

    function onFavoriteClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if (favorite) {
            removeFavorite(job.id);
        } else {
            addFavorite(job);
        }
    }
    return (
        <div
            className="job-card"
            onClick={openJobUrl}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openJobUrl();
                }
            }}
        >
            <div className="job-poster">
                <img src={imageSrc} alt={job.title} onError={handleImageError} />
                <div className="job-overlay">
                    <button className={`favorite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                        ❤️
                    </button>
                </div>
            </div>
            <div className="job-info">
                <h3 title={job.title}>{truncateWords(job.title, 6)}</h3>
                {job?.company && <p className="job-company">{job.company}</p>}
            </div>
        </div>
    )

}

export default JobCard;