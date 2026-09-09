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
    const [message, setMessage] = useState("");
    const [price, setPrice] = useState(0)
    const [showForm, setShowform] = useState(false);

    const handleAddBook = async (e) => {
        e.preventDefault();
        const bookData = {
            title,
            genre,
            summary,
            author,
            price
        };
        

        try {
            if(editIndex !== null){
                const bookId = inventory[editIndex].id;
                const response = await axios.put(`http://localhost:5000/api/books/${bookId}`, bookData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("currentToken")}`
                    }
                });
                const updatedInventory = [...inventory];
        
                updatedInventory[editIndex] = response.data.book;
                setInventory(updatedInventory);
                setMessage("Book updated successfully");
            }else{
                const response = await axios.post("http://localhost:5000/api/books/add", bookData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("currentToken")}`
                    }
                });
                setInventory([...inventory, response.data]);
            }

            setMessage("");
            setTitle("");
            setGenre("");
            setSummary("");
            setAuthor("");
            setPrice(0);
            setEditIndex(null);
            setShowform(false);
        }catch (error) {
            console.error("Error adding/updating book:", error);
            console.log(error.response?.data);
            setMessage(error.response?.data?.message || "Failed to save.please try again.");
        }
    };
     
    const editBook = (index) => {
        const bookToEdit = inventory[index];
        setTitle(bookToEdit.title);

        setGenre(bookToEdit.genre);
        setSummary(bookToEdit.summary);
        setAuthor(bookToEdit.author);
        setEditIndex(index);
        setPrice(bookToEdit.price)
        setShowform(true);

    }

    const deleteBook = async (index) => {
        // Implement delete functionality here
        try {
            const bookToDelete = inventory[index];
            await axios.delete(`http://localhost:5000/api/books/${bookToDelete.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("currentToken")}`
                }
            });
            const updatedInventory = inventory.filter((_, i) => i !== index);
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
 async function fetchInventory() {
        try {
            const response = await axios.get('http://localhost:5000/api/books');
            console.log(response.data);
            setInventory(response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    }

    useEffect(() => {
        fetchInventory();
    }, []);

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
                setShowform(true);
             }}
            >
                Add Book
            </button>
            <div className="inventory-list">
                {/* Display inventory or other relevant information here */
                 inventory.length > 0 ? (
                    <ul>
                        {inventory.map((book, index) => (
                            <li className="inventory-card" key={book.id}>
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
                                    <button className="edit" onClick={() => editBook(index)}> Edit </button>
                                    <button className="delete" onClick={() => deleteBook(index)}> Delete </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-inventory">No books in inventory.</p>
                )}
            </div>
        </div>
    );
}
