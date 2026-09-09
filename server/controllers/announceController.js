import pool from "../config/db.js";

export async function createAnnouncement(book) {
    try {
        const result = await pool.query("INSERT INTO announcements (title, genre, summary) VALUES ($1, $2, $3) RETURNING *", [book.title, book.genre, book.summary]);

        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getAllAnnouncements(req, res) {
    try {
        const result = await pool.query("SELECT * FROM announcements ORDER BY date DESC");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch announcements" });
    }
}