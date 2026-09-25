import { useState, useEffect } from "react";
import axios from "axios";
import "../css/inventory.css"

export default function Inventory(){
    const [title, setTitle] = useState("");
    const [genre, setGenre] = useState("");
    const [summary, setSummary] = useState("");
    const [author, setAuthor] = useState("");
    const [inventory, setInventory] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [message, setMessage] = useState("");
    const [price, setPrice] = useState(0)
    const [showForm, setShowform] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 6;


    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleAddBook = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append("title", title);
        formData.append("genre", genre);
        formData.append("summary", summary);
        formData.append("author", author);
        formData.append("price", price);

        if(imageFile){
            formData.append("image", imageFile);
        }
        
        try {
            if(editIndex !== null){
                const bookId = inventory[editIndex].id;
                const response = await axios.put(`${apiUrl}/api/books/${bookId}`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("currentToken")}`
                    }
                });
                const updatedInventory = [...inventory];
        
                updatedInventory[editIndex] = response.data.book;
                setInventory(updatedInventory);
                setMessage("Book updated successfully");
            }else{
                const response = await axios.post(`${apiUrl}/api/books/add`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("currentToken")}`
                    }
                });
                setInventory([...inventory, response.data.book]);
            }

            setMessage("");
            setTitle("");
            setGenre("");
            setSummary("");
            setAuthor("");
            setPrice(0);
            setImageFile(null)
            setEditIndex(null);
            setShowform(false);
        }catch (error) {
            console.error("Error adding/updating book:", error);
            console.log(error.response?.data);
            setMessage(error.response?.data?.message || "Failed to save.please try again.");
        }
    };
     
    const editBook = (book) => {
        const bookToEdit = book;
        setTitle(bookToEdit.title);

        setGenre(bookToEdit.genre);
        setSummary(bookToEdit.summary);
        setAuthor(bookToEdit.author);
        setPrice(bookToEdit.price)
        setImageFile(null);
        setEditIndex(inventory.findIndex((b) => b.id === book.id));
        setShowform(true);

    };

    const deleteBook = async (book) => {
        // Implement delete functionality here
        try {
            await axios.delete(`${apiUrl}/api/books/${book.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("currentToken")}`
                }
            });
            const updatedInventory = inventory.filter((b) => b.id !== book.id);
            setInventory(updatedInventory);
        } catch (error) {
            console.error("Error deleting book:", error);
            console.log(error.response?.data);
        }


        
        if(editIndex === index){
            setTitle("");
            setGenre("");
            setSummary("");
            setAuthor("");
            setEditIndex(null);
            setPrice(0)
        }

    }
    const totalPages = Math.ceil(inventory.length / booksPerPage);

    const startIndex = (currentPage - 1) * booksPerPage;

    const currentBooks = inventory.slice(
        startIndex,
        startIndex + booksPerPage
    );
 async function fetchInventory() {
        try {
            const response = await axios.get(`${apiUrl}/api/books`);
            console.log(response.data);
            setInventory(response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    }

    useEffect(() => {
        fetchInventory();
    }, []);

    useEffect(() => {
    const totalPages = Math.ceil(inventory.length / booksPerPage);

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }
    }, [inventory, currentPage]);

    return(
        <div className="inventory-page">
            <div className="inventory-head">
                <h2>Inventory Page</h2>
            </div>
            {showForm && (
                <div className="modal">
                    <div className="modal-box">
                        <h3>
                            {editIndex !== null ? "Update Book":"Add Book"}
                        </h3>
                        <div className="book-form">
                            <label>Book Title</label>
                            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required/>

                            <label>Genre</label>
                            <input type="text" placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} required/>

                            <label>Description</label>
                            <textarea placeholder="Summary" value={summary} onChange={(e) => setSummary(e.target.value)} required/>

                            <label>Author</label>
                            <input type="text" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required/>

                            <label>Price</label>
                            <input type="number" placeholder="enter the price" value={price} onChange={(e) => setPrice(Number(e.target.value))} required/>

                            <label>Book Image</label>
                            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}/>
                            {message && <p className="form-message">{message}</p>}
                            <div className="form-button">
                                <button className="save-btn" type="submit" onClick={handleAddBook}>{editIndex !== null ? "Update Book" : "Add Book"} </button>
                                <button className="cancel-btn" type="button" onClick={() => {
                                    setShowform(false);
                                    setEditIndex(null);
                                }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                
            <button 
             className="add-btn"
             onClick={() => {
                setTitle("");
                setGenre("");
                setSummary("");
                setAuthor("");
                setPrice(0);
                setEditIndex(null);
                setImageFile(null);
                setShowform(true);
             }}
            >
                Add Book
            </button>
            <div className="inventory-list">
                {/* Display inventory or other relevant information here */
                 inventory.length > 0 ? (
                    <>
                        <ul>
                            {currentBooks.map((book, index) => (
                                <li className="inventory-card" key={book.id}> 
                                    {book.book_image && (
                                        <img src={book.book_image} alt={book.title} className="book-image" />
                                    )}
                                    <h3>{book.title}</h3>
                                    <p><strong>Genre:</strong> {book.genre}</p>
                                    <div className="summary">
                                        <strong>Summary:</strong>
                                        <p>{book.summary}</p>
                                    </div>
                                    <p><strong>Author:</strong> {book.author}</p>
                                    <p className="price">
                                        <strong>Price:</strong> ₦{Number(book.price).toFixed(2)}
                                    </p>
                                    <div className="book-button">
                                        <button className="edit" onClick={() => editBook(book)}> Edit </button>
                                        <button className="delete" onClick={() => deleteBook(book)}> Delete </button>

                                    </div>
                                </li>
                            ))}
                        </ul>
                        {totalPages > 1 && (
                            <div className="pagination">
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index}
                                        className={
                                            currentPage === index + 1
                                                ? "active-dot"
                                                : ""
                                        }
                                        onClick={() => setCurrentPage(index + 1)}
                                    >
                                        ●
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <p className="empty-inventory">No books in inventory.</p>
                )}
            </div>
        </div>
    );
}
