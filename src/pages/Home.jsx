import JobCard from '../components/JobCard';
import WebSocketTester from '../components/WebSocketTester';
import { useState, useEffect } from 'react';
import '../css/home.css';
import { getJobs, searchJobs } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeQuery, setActiveQuery] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [limit] = useState(10);
    const [count, setCount] = useState(0);
    const [showNewJobNotification, setShowNewJobNotification] = useState(false);
    
    // WebSocket hook
    const { connectionStatus, newJobs, isConnected } = useWebSocket();

    useEffect(() => {
        const loadJobs = async () => {
            setLoading(true);
            try {
                const isSearching = activeQuery.trim().length > 0;
                const data = isSearching
                    ? await searchJobs({ query: activeQuery, limit, offset: page * limit })
                    : await getJobs({ limit, offset: page * limit, language: 'en' });
                setJobs(data.results ?? []);
                setCount(data.count ?? 0);
            } catch (error) {
                console.error('Error loading jobs:', error);
            } finally {
                setLoading(false);
            }
        };
        loadJobs();
    }, [page, limit, activeQuery]);

    // Handle new jobs from WebSocket
    useEffect(() => {
        if (newJobs.length > 0 && page === 0 && !activeQuery) {
            // Only show notification and update jobs if we're on the first page and not searching
            setShowNewJobNotification(true);
            
            // Auto-hide notification after 5 seconds
            const timer = setTimeout(() => {
                setShowNewJobNotification(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [newJobs, page, activeQuery]);

    const handleRefreshWithNewJobs = () => {
        // Merge new jobs with existing jobs, avoiding duplicates
        const existingJobIds = new Set(jobs.map(job => job.id));
        const uniqueNewJobs = newJobs.filter(job => !existingJobIds.has(job.id));
        
        if (uniqueNewJobs.length > 0) {
            setJobs(prevJobs => [...uniqueNewJobs, ...prevJobs]);
            setCount(prevCount => prevCount + uniqueNewJobs.length);
        }
        
        setShowNewJobNotification(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        setActiveQuery(searchTerm);
    }

    const handleHashtagClick = (hashtag) => {
        const cleanHashtag = hashtag.replace(/^#+/, ''); // Remove leading # symbols
        setSearchTerm(cleanHashtag);
        setPage(0);
        setActiveQuery(cleanHashtag);
    }

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return (
        <div className="home">
            {/* WebSocket Status */}
            <div className={`websocket-status ${isConnected ? 'connected' : 'disconnected'}`}>
                <span className="status-indicator"></span>
                <span className="status-text">{connectionStatus}</span>
                {newJobs.length > 0 && (
                    <span className="new-jobs-count">{newJobs.length} new jobs available</span>
                )}
            </div>

            {/* New Job Notification */}
            {showNewJobNotification && newJobs.length > 0 && (
                <div className="new-job-notification">
                    <div className="notification-content">
                        <span className="notification-icon">🎉</span>
                        <div className="notification-text">
                            <strong>{newJobs.length} new job{newJobs.length > 1 ? 's' : ''} available!</strong>
                            <p>Click to refresh and see the latest opportunities</p>
                        </div>
                        <button 
                            className="refresh-btn" 
                            onClick={handleRefreshWithNewJobs}
                            type="button"
                        >
                            Refresh
                        </button>
                        <button 
                            className="close-btn" 
                            onClick={() => setShowNewJobNotification(false)}
                            type="button"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <input type="text" placeholder="Search jobs" className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button type="submit" className="search-btn">Search</button>
            </form>
            {loading ? (
                <div className="loading" aria-busy="true" aria-live="polite">
                    <div className="spinner" />
                </div>
            ) : (
                <div className="jobs-grid">
                    {jobs.map((job) => (<JobCard key={job.id} job={job} onHashtagClick={handleHashtagClick} />))}
                </div>
            )}
            <div className="pagination">
                <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading}>
                    Previous
                </button>
                <span className="page-info">Page {page + 1} of {totalPages}</span>
                <button
                    type="button"
                    onClick={() => setPage((p) => ((p + 1) * limit < count ? p + 1 : p))}
                    disabled={(page + 1) * limit >= count || loading}
                >
                    Next
                </button>
            </div>
            
            {/* WebSocket Tester - Remove this in production */}
            {import.meta.env.DEV && <WebSocketTester />}
        </div>
    )
}

export default Home;