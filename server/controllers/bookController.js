import pool from "../config/db.js";
import { createAnnouncement } from "./announceController.js";
import supabase from "../config/supabase.js";

export async function addBooks(req, res) {
    const { title, author, genre, summary, price} = req.body;

    const existingBook = await pool.query("SELECT * FROM books WHERE LOWER(title) = LOWER($1)", [title]);

    if (existingBook.rows.length > 0) {
        return res.status(400).json({ message: "Book already exists." });
    }

    const result = await pool.query(
        "INSERT INTO books (title, author, genre, summary, price) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [title, author, genre, summary, price]
    );
    const newBook = result.rows[0];
    //automatically add the new book to announcements
    await createAnnouncement(newBook);
    res.status(201).json({ message: "Book added successfully" , book: newBook});
}

export async function getAllBooks(req, res) {
    try {
        const result = await pool.query("SELECT * FROM books");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export async function deleteBook(req, res) {
    try {
        const { id } = req.params;
      const result = await pool.query("DELETE FROM books WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Book not found." });
        }
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export async function updateBook(req, res) {
    try {
        const { id } = req.params;
        const { title, author, genre, summary, price } = req.body;
        const result = await pool.query(
            "UPDATE books SET title = $1, author = $2, genre = $3, summary = $4, price = $5 WHERE id = $6 RETURNING *",
            [title, author, genre, summary, price, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Book not found." });
        }
        res.json({ message: "Book updated successfully", book: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export async function bookImage(req, res) {
    try{
        const {id} = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded"});
        }

        const oldBook = await pool.query(
            "SELECT book_image FROM books WHERE id = $1", [id]
        );

        if(oldBook.rows,length === 0) {
            return res.status(404).json({ message: "Book not found"});
        }

        const oldImageUrl = oldBook.rows[0].book_image;

        const fileExtension = req.file.originalname.split(".").pop();

        const fileName = `book_${id}_${Date.now()}.${fileExtension}`;

        const { error: uploadError} = await supabase.storage.from("book_image").upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true
        });

        if(uploadError){
            console.error("Supabase upload error:", uploadError);
            return res.status(500).json({message: "Error uploading book image"});
        }

        const {data} = supabase.storage.from("book_image").getPublicUrl(fileName);

        const imageUrl = data.publicUrl;

        const result = await pool.query(`
            UPDATE books
            SET book_image = $1
            WHERE id = $2
            RETURNING *
            `, [imageUrl, id]);

        const updateBook = result.rows[0];

        if(oldImageUrl){
            try{
                const oldFileName = oldImageUrl.split("/").pop();

                if(oldFileName){
                    const {error: deleteError} = await supabase.storage.from("book_image").remove([oldFileName]);

                    if (deleteError) {
                        console.error("Error deleting old book image:", deleteError);
                    }else{
                        console.log("Old book image deleted:", oldFileName);
                    }
                }
            }catch (deleteError){
                console.error(
                    "Error deleting old book image:", deleteError
                );
            }
        }

        res.json ({
            message: "Book image update successfully",
            book: updateBook
        });
    }catch (error) {
        console.error("Error updating book image:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
    
}