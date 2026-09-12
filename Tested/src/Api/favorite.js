import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/favorites` : 'http://localhost:5000/api/favorites';

export async function getFavoriteBooks(userId) {
    try {
        const response = await axios.get(`${BASE_URL}/${userId}`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("currentToken")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching favorite books:", error);
        return [];
    }
}

export async function addToFavorite(userId, book) {
    try {
        const response = await axios.post(`${BASE_URL}/${userId}`, book,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("currentToken")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error adding to favorites:", error);
        throw error;
    }
}

export async function removeFromFavorite(userId, bookId) {
    try {
        const response = await axios.delete(`${BASE_URL}/${userId}/${bookId}`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("currentToken")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error removing from favorites:", error);
    }
}