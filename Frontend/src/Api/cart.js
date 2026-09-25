import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth/cart` : 'http://localhost:5000/api/auth/cart';

export async function getCart(userId) {
    try {
        const response = await axios.get(`${BASE_URL}/${userId}`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("currentToken")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching cart:", error);
        return [];
    }
}

export async function addToCart(userId, book) {
    try {
        const response = await axios.post(`${BASE_URL}/${userId}`, {book:book},{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("currentToken")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
}

export async function removeFromCart(userId, bookId) {
    try {
        const response = await axios.delete(`${BASE_URL}/${userId}/${bookId}`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("currentToken")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error removing from cart:", error);
        throw error;
    }
}

export async function clearCart(userId) {
    try {
        const response = await axios.delete(`${BASE_URL}/${userId}`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("currentToken")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
}