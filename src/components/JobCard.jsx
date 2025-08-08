function JobCard({job}) {
    function onFavoriteClick() {
        console.log("Favorite clicked");
    }
    return (
        <div className="job-card">
            <div className="job-poster">
                <img src={job.poster} alt={job.title} />
                <div className="job-overlay">
                    <button className="favorite-btn" onClick={onFavoriteClick}>
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