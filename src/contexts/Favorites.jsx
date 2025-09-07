import { createContext, useState, useContext, useEffect } from "react";
import { getFavorites, addToFavorites, removeFromFavorites } from "../services/api";
import { useAuth } from "./Auth";

const FavoriteContext = createContext();

export const useFavoriteContext = () => useContext(FavoriteContext);

export const FavoriteProvider = ({children}) => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isLoggedIn, getAccessToken } = useAuth();

    // Load favorites when user logs in
    useEffect(() => {
        if (isLoggedIn) {
            loadFavorites();
        } else {
            // Clear favorites when user logs out
            setFavorites([]);
            setError(null);
        }
    }, [isLoggedIn]);

    const loadFavorites = async () => {
        if (!isLoggedIn) return;
        
        setLoading(true);
        setError(null);
        try {
            const data = await getFavorites();
            setFavorites(data.results || []);
        } catch (err) {
            console.error('Error loading favorites:', err);
            setError(err.message);
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    };

    const addFavorite = async (job) => {
        if (!isLoggedIn) {
            throw new Error('Please sign in to save favorites');
        }

        setLoading(true);
        setError(null);
        try {
            const newFavorite = await addToFavorites(job.id);
            setFavorites(prev => [...prev, newFavorite]);
            return true;
        } catch (err) {
            console.error('Error adding to favorites:', err);
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (jobId) => {
        if (!isLoggedIn) {
            throw new Error('Please sign in to manage favorites');
        }

        // Find the favorite entry that contains this job
        const favoriteEntry = favorites.find(fav => fav.job.id === jobId);
        if (!favoriteEntry) {
            console.warn('Favorite not found for job:', jobId);
            return false;
        }

        setLoading(true);
        setError(null);
        try {
            await removeFromFavorites(favoriteEntry.id);
            setFavorites(prev => prev.filter(fav => fav.job.id !== jobId));
            return true;
        } catch (err) {
            console.error('Error removing from favorites:', err);
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const isFavorite = (jobId) => {
        return favorites.some(fav => fav.job.id === jobId);
    };

    const getFavoriteJob = (jobId) => {
        const favoriteEntry = favorites.find(fav => fav.job.id === jobId);
        return favoriteEntry ? favoriteEntry.job : null;
    };

    const value = {
        favorites,
        loading,
        error,
        addFavorite,
        removeFavorite,
        isFavorite,
        loadFavorites,
        getFavoriteJob,
    };

    return <FavoriteContext.Provider value={value}>
        {children}
    </FavoriteContext.Provider>
}
