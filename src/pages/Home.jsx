import JobCard from '../components/JobCard';
import { useState, useEffect } from 'react';
import '../css/home.css';
import { getJobs } from '../services/api';

function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [limit] = useState(10);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const loadJobs = async() => {
            setLoading(true);
            try{
                const data = await getJobs({ limit, offset: page * limit, language: 'en' });
                setJobs(data.results ?? []);
                setCount(data.count ?? 0);
            } catch (error) {
                console.error('Error loading jobs:', error);
            } finally {
                setLoading(false);
            }
        }
        loadJobs();
    }, [page, limit]);

    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Search submitted");
        alert(searchTerm);
        setSearchTerm("------");
    }

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return (
        <div className="home">
            <form onSubmit={handleSearch} className="search-form">
                <input type="text" placeholder="Search jobs" className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button type="submit" className="search-btn">Search</button>
            </form>
            <div className="jobs-grid">
                {jobs.map((job) => (job.title.toLowerCase().includes(searchTerm.toLowerCase()) && <JobCard key={job.id} job={job} />))}
            </div>
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
        </div>
    )
}

export default Home;