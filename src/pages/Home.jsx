import JobCard from "../components/JobCard";

function Home() {
    const jobs = [
        {"id": 1, "title": "Software Engineer", "release_date": "2025-08-1"},
        {"id": 2, "title": "Backend Engineer", "release_date": "2025-08-08"},
        {"id": 3, "title": "Frontend Engineer", "release_date": "2025-07-30"},
        {"id": 4, "title": "DevOps Engineer", "release_date": "2025-07-27"},
        {"id": 5, "title": "Data Engineer", "release_date": "2025-07-25"},
        {"id": 6, "title": "AI Engineer", "release_date": "2025-07-23"},
        {"id": 7, "title": "Cybersecurity Engineer", "release_date": "2025-07-20"},
    ]
    return (
        <div className="home">
            <div className="jobs-grid">
                {jobs.map((job)=>( <JobCard key={job.id} job={job} />))}
            </div>
        </div>
    )
}

export default Home;