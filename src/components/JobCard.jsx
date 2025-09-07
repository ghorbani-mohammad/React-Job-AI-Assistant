import '../css/jobcard.css';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFavoriteContext } from '../contexts/Favorites';
import { useAuth } from '../contexts/Auth';
import defaultJobImage from '../assets/default-job.svg';

function JobCard({job, onHashtagClick, isNew = false}) {
    const {addFavorite, removeFavorite, isFavorite, loading} = useFavoriteContext();
    const { isLoggedIn } = useAuth();
    const favorite = isLoggedIn ? isFavorite(job.id) : false;
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

    async function onFavoriteClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isLoggedIn) {
            // Show login prompt or redirect to login
            alert('Please sign in to save favorites');
            return;
        }
        
        if (loading) {
            return; // Prevent multiple clicks while loading
        }
        
        try {
            if (favorite) {
                const success = await removeFavorite(job.id);
                if (!success) {
                    alert('Failed to remove from favorites. Please try again.');
                }
            } else {
                const success = await addFavorite(job);
                if (!success) {
                    alert('Failed to add to favorites. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error managing favorite:', error);
            alert(error.message || 'An error occurred. Please try again.');
        }
    }

    function formatRelativeTime(isoString) {
        if (!isoString) return '';
        
        try {
            const now = new Date();
            const postDate = new Date(isoString);
            const diffInMs = now - postDate;
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            
            if (diffInMinutes < 1) {
                return 'Just now';
            } else if (diffInMinutes < 60) {
                return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
            } else if (diffInHours < 24) {
                return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
            } else if (diffInDays < 7) {
                return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
            } else {
                return null; // Use full date format for older posts
            }
        } catch (e) {
            return '';
        }
    }

    function formatCreatedAt(isoString, timeZone) {
        if (!isoString) return '';
        
        // Try relative time first for recent posts
        const relativeTime = formatRelativeTime(isoString);
        if (relativeTime) {
            return relativeTime;
        }
        
        // Fall back to full date format for older posts
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
                className={`job-card ${isNew ? 'job-card-new' : ''}`}
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
                        <button 
                            className={`favorite-btn ${favorite ? 'active' : ''} ${!isLoggedIn ? 'disabled' : ''} ${loading ? 'loading' : ''}`} 
                            onClick={onFavoriteClick}
                            disabled={loading}
                            title={!isLoggedIn ? 'Sign in to save favorites' : (favorite ? 'Remove from favorites' : 'Add to favorites')}
                        >
                            {loading ? '⏳' : '❤️'}
                        </button>
                        {job?.description && (
                            <button className='details-btn' onClick={openDetails} aria-label='View details'>
                                ℹ️
                            </button>
                        )}
                    </div>
                </div>
                <div className='job-info'>
                    <div className="job-title-container">
                        <h3 title={job.title}>{truncateWords(job.title, 6)}</h3>
                        {isNew && <span className="new-job-badge">NEW</span>}
                    </div>
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