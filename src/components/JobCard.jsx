import '../css/jobcard.css';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFavoriteContext } from '../contexts/Favorites';
import defaultJobImage from '../assets/default-job.svg';

function JobCard({job}) {
    const {addFavorite, removeFavorite, isFavorite} = useFavoriteContext();
    const favorite = isFavorite(job.id);
    const imageSrc = job.image && job.image.trim() !== '' ? job.image : defaultJobImage;
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const [showModal, setShowModal] = useState(false);

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

    function formatCreatedAt(isoString, timeZone) {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const options = { dateStyle: 'medium', timeStyle: 'short' };
            if (timeZone) options.timeZone = timeZone;
            return new Intl.DateTimeFormat(undefined, options).format(date);
        } catch (e) {
            return '';
        }
    }

    function openDetails(e) {
        e.preventDefault();
        e.stopPropagation();
        setShowModal(true);
    }

    function closeDetails() {
        setShowModal(false);
    }

    useEffect(() => {
        if (!showModal) return undefined;
        function onKeyDown(ev) {
            if (ev.key === 'Escape') {
                setShowModal(false);
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showModal]);
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
                {job?.keywords_as_hashtags && job.keywords_as_hashtags.length > 0 && (
                    <div className="job-hashtags">
                        {job.keywords_as_hashtags.map((hashtag, index) => (
                            <span key={index} className="hashtag">
                                {hashtag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

}

export default JobCard;