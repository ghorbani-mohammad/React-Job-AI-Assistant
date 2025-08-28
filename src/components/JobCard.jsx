import '../css/jobcard.css';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFavoriteContext } from '../contexts/Favorites';
import defaultJobImage from '../assets/default-job.svg';

function JobCard({job, onHashtagClick}) {
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

    function handleHashtagClick(e, hashtag) {
        e.preventDefault();
        e.stopPropagation();
        if (onHashtagClick) {
            onHashtagClick(hashtag);
        }
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
        <>
            <div
                className='job-card'
                onClick={openJobUrl}
                role='button'
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openJobUrl();
                    }
                }}
            >
                <div className='job-poster'>
                    <img src={imageSrc} alt={job.title} onError={handleImageError} />
                    <div className='job-overlay'>
                        <button className={`favorite-btn ${favorite ? 'active' : ''}`} onClick={onFavoriteClick}>
                            ❤️
                        </button>
                        {job?.description && (
                            <button className='details-btn' onClick={openDetails} aria-label='View details'>
                                ℹ️
                            </button>
                        )}
                    </div>
                </div>
                <div className='job-info'>
                    <h3 title={job.title}>{truncateWords(job.title, 6)}</h3>
                    {job?.company && <p className='job-company'>{job.company}</p>}
                    {job?.created_at && (
                        <p className='job-created-at' title={new Date(job.created_at).toString()}>
                            {formatCreatedAt(job.created_at, browserTimeZone)}
                        </p>
                    )}
                    {job?.found_keywords_as_hashtags && job.found_keywords_as_hashtags.length > 0 && (
                        <div className="job-hashtags">
                            {job.found_keywords_as_hashtags.map((hashtag, index) => (
                                <button
                                    key={index}
                                    className="hashtag"
                                    onClick={(e) => handleHashtagClick(e, hashtag)}
                                    type="button"
                                    aria-label={`Search for ${hashtag}`}
                                >
                                    {hashtag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {showModal &&
                createPortal(
                    <div
                        className='job-modal-backdrop'
                        onClick={closeDetails}
                        role='presentation'
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}
                    >
                        <div
                            className='job-modal'
                            role='dialog'
                            aria-modal='true'
                            aria-labelledby={`job-${job.id}-title`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#fff',
                                color: '#111',
                                maxWidth: '720px',
                                width: '90%',
                                maxHeight: '80vh',
                                overflow: 'auto',
                                borderRadius: '8px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
                                <div>
                                    <h3 id={`job-${job.id}-title`} style={{ margin: 0 }}>{job.title}</h3>
                                    {job?.company && <p style={{ margin: '4px 0 0 0', color: '#555' }}>{job.company}</p>}
                                    {job?.created_at && (
                                        <p style={{ margin: '6px 0 0 0', color: '#777', fontSize: '0.9em' }}>
                                            Posted: {formatCreatedAt(job.created_at, browserTimeZone)}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {job?.url && (
                                        <button onClick={(e) => { e.stopPropagation(); openJobUrl(); }} className='apply-btn'>
                                            Open job
                                        </button>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); closeDetails(); }} aria-label='Close details' className='close-btn'>
                                        ✕
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: '16px 20px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                {job?.description || 'No description available.'}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}

export default JobCard;