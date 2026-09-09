import {
    getFavoriteBooks,
    removeFromFavorite
} from "../Api/favorite.js";
import "../css/homecontext.css";

import { useState, useEffect } from "react";
import { getAnnouncements } from "../Api/announcement.js";

function Homecontent() {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    const [homeDisplay, setHomeDisplay] = useState("Announcements");
    const [announcements, setAnnouncements] = useState([]);
    const [favorite, setFavorite] = useState([]);


    async function handleRemoveFavorite(bookId) {
        try {
            await removeFromFavorite(user.id, bookId);

            setFavorite((currentFavorites) =>
                currentFavorites.filter(
                    (book) => book.id !== bookId
                )
            );
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    }

    useEffect(() => {
        async function fetchAnnouncements() {
            try {
                const response = await getAnnouncements();
                setAnnouncements(response);
            } catch (error) {
                console.error("Error fetching announcements:", error);
            }
        }

        fetchAnnouncements();
    }, []);

    useEffect(() => {
        async function fetchFavorites() {
            try {
                const response = await getFavoriteBooks(user.id);

                setFavorite(
                    Array.isArray(response) ? response : []
                );

            } catch (error) {
                console.error("Error fetching favorite books:", error);
            }
        }

        fetchFavorites();
    }, [user.id]);

    return (
        <main className="home-content">
            <div className="welcome">
                <h2>
                    Hello, {user ? user.name : "Guest"}!
                    Welcome to the Epp Store.
                </h2>
            </div>

            <div className="home-tabs">
                <button
                    type="button"
                    className={homeDisplay === "Announcements" ? "active" : ""}
                    onClick={() =>
                        setHomeDisplay("Announcements")
                    }
                >
                    Announcements
                </button>
            

            
                <button
                    type="button"
                    className={homeDisplay === "My Books" ? "active" : ""}
                    onClick={() =>
                        setHomeDisplay("My Books")
                    }
                >
                    My Books
                </button>
            </div>

            <section>
                {homeDisplay === "Announcements" && (
                    <div className="home-section">
                        <div className="section-heading">
                            <h2>Announcements</h2>

                            <p>
                                Here are the latest announcements!
                            </p>
                        </div>

                        {announcements.length === 0 ? (
                            <p className="empty-message">No announcements available.</p>
                        ) : (
                            <div className="announcement-grid">
                                {announcements.map((announcement) => (
                                    <div className="announcement-card" key={announcement.id}>
                                        <h3>📚 New Book Available</h3>

                                        <h4>
                                            {announcement.title}
                                        </h4>

                                        <p>
                                            {announcement.title} has been
                                            added to our{" "}
                                            {announcement.genre} section!
                                        </p>

                                        <p>
                                            {announcement.summary}
                                        </p>

                                        <small>
                                            {announcement.date}
                                        </small>

                                        <hr />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            <section>
                {homeDisplay === "My Books" && (
                    <div className="home-section">
                        <div className="section-heading">
                          <h2>My Favorite Books</h2>
                          <p>
                            Here are your favorite books!
                          </p>
                        </div>

                        {favorite.length === 0 ? (
                            <p className="empty-message">
                                You don't have any favorite books yet.
                            </p>
                        ) : (
                            <div className="favorite-grid">
                                {favorite.map((book) => (
                                    <div className="favorite-card" key={book.id}>
                                        <h3>{book.title}</h3>

                                        <button
                                            type="button"
                                            className="remove-favorite"
                                            onClick={() =>
                                                handleRemoveFavorite(book.id)
                                            }
                                        >
                                            Remove
                                        </button>

                                        <p>
                                            <strong>Author:</strong>{" "}
                                            {book.author}
                                        </p>

                                        <p>
                                            <strong>Price:</strong>{" "}
                                            {book.price}
                                        </p>
                                    </div>

                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Homecontent;