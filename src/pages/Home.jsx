import JobCard from "../components/JobCard";
import { useState, useEffect } from "react";
import "../css/home.css";
import { searchJobs, getJobs } from "../services/api";

function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadJobs = async() => {
            try{
                const data = await getJobs();
                setJobs(data);
            } catch (error) {
                console.error("Error loading jobs:", error);
            } finally {
                setLoading(false);
            }
        }
        loadJobs();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Search submitted");
        alert(searchTerm);
        setSearchTerm("------");
    }

    return (
        <div className="home">
            <form onSubmit={handleSearch} className="search-form">
                <input type="text" placeholder="Search jobs" className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button type="submit" className="search-btn">Search</button>
            </form>
            <div className="jobs-grid">
                {jobs.map((job) => (job.title.toLowerCase().includes(searchTerm.toLowerCase()) && <JobCard key={job.id} job={job} />))}
            </div>
        </div>
    )
}

export default Home;