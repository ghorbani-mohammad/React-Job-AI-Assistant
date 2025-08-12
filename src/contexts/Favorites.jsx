import { createContext, useState, useContext, useEffect } from "react";


const FavoriteContext = createContext();

export const useFavoriteContext = () => useContext(FavoriteContext);

export const FavoriteProvider = ({children}) => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const storedFavorites = localStorage.getItem("favorites");
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    useEffect(()=>{
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites])


    const addFavorite = (job) => {
        setFavorites([...favorites, job]);
    }

    const removeFavorite = (jobId) => {
        setFavorites(favorites.filter(job => job.id !== jobId));
    }

    const isFavorite = (jobId) => {
        return favorites.some(job => job.id === jobId);
    }

    const value = {
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
    }

    return <FavoriteContext.Provider value={value}>
        {children}
    </FavoriteContext.Provider>
}
