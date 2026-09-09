import { useState,useEffect } from "react";
import axios from "axios";
import {addToCart} from "../Api/cart.js";
import {addToFavorite} from "../Api/favorite.js";
import"../css/books.css"

export default function Books(){
    const [message, setmessage] = useState("");
    const [foundBook, setFoundBook] = useState(null);
    const [book, setBook] = useState([]);
    const[cartQuantity , setCartQuantity] = useState({})
    
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const isAdmin = user?.role === "Admin";

    async function fetchBooks() {
        try {
            const books = await axios.get('http://localhost:5000/api/books');
            setBook(books.data);
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    }

    useEffect(() => {
        fetchBooks();
    }, []);

    function DisplayBook() {

       return(
        <div className="books-grid"> 
            {book.map((b) => (
                <div className="book-card" key={b.id}>
                    <h2>{b.title}</h2>
                    <h4>by {b.author}</h4>
                    <p> <strong>Price:</strong>{b.price}</p>
                
                    {!isAdmin &&(
                        <div className="book-actions">
                                <input type="number" min={1} value={cartQuantity[b.id] || 1} onChange={(e) => setCartQuantity({...cartQuantity, [b.id]: Number(e.target.value)})}/>
                                <button type="button" onClick={() => addToCart(user.id, {...b, quantity: cartQuantity[b.id] || 1})}>cart</button>
                            <button type="button" onClick={() => addToFavorite(user.id, b) }> fav</button>
                        </div>
                    )
                    }
                </div>
            ))
            
            }
        </div>
       )
    }

    return(
        <div className="books-page">
            <div className="book-search">
                <input type="text" name="search" placeholder="Search for books..." />
                <button type="submit" onClick={(e) => {
                    e.preventDefault();
                    const searchValue = document.querySelector('input[name="search"]').value.toLowerCase();
                    const result = book.find((b) => b.title.toLowerCase().includes(searchValue) || b.author.toLowerCase().includes(searchValue));
            
                    if (!result) {
                        setmessage("Book not found.");
                        setFoundBook(null);
                    } else {
                        setFoundBook(result);
                        setmessage("");
                    }
                }}> Search </button>
                <button
                    onClick={() => {
                        setFoundBook(null);
                        setmessage("");
                    }}
                >
                    Show All Books
                </button>
            </div>
            {message && <p className="book-message">{message}</p>}

            {foundBook && (
                <div className="found-book">
                    <div className="book-card">
                        <h2>{foundBook.title}</h2>
                        <h4>by {foundBook.author}</h4>
                        <p><strong>Genre: {foundBook.genre}</strong></p>
                        <p>{foundBook.summary}</p>
                        {!isAdmin &&(
                        <div className="book-actions">
                                <input type="number" min={1} value={cartQuantity[foundBook.id] || 1} onChange={(e) => setCartQuantity({...cartQuantity, [foundBook.id]: Number(e.target.value)})}/>
                                <button type="button" onClick={() => addToCart(user.id, {...foundBook, quantity: cartQuantity[foundBook.id] || 1})}>cart</button>
                            <button type="button" onClick={() => addToFavorite(user.id, foundBook) }> fav</button>
                        </div>
                        )} 
                    </div> 
                </div>
            )}
            {!foundBook && <DisplayBook/>}
            
        </div>
    );
}