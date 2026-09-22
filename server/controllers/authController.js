import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import supabase from "../config/supabase.js";

//register user
export async function registerUser(req, res) {

    try {
            const { name, email, phoneNumber, password, role } = req.body;

            const cleanPhone = phoneNumber.trim();

            if (!name || !email || !cleanPhone || !password) {
                return res.status(400).json({
                    message: "All fields are required"
                });
            }

            //check if user already exists
            const existingUser = await pool.query("SELECT * FROM users WHERE phone_number = $1", [cleanPhone]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ message: "User already exists" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const result = await pool.query(
                "INSERT INTO users (name, email, phone_number, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                [name, email, cleanPhone, hashedPassword, role]
            );
            res.status(201).json({ message: "Registration successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }

    //login user
    export async function loginUser(req, res) {
        try {
            const { phoneNumber, password } = req.body;
            
            const result = await pool.query("SELECT * FROM users WHERE phone_number = $1", [phoneNumber]);
            const user = result.rows[0];
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: "Incorrect password" });
            }
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });
            res.json({ 
                token ,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phone_number,
                    role: user.role,
                    profileImage: user.profile_image
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }

    export async function getProfile(req, res) {
    try {
        if (String(req.user.id) !== String(req.params.id)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const result = await pool.query(`
            SELECT
                id,
                name,
                email,
                phone_number,
                role,
                profile_image
            FROM users
            WHERE id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phone_number,
                role: user.role,
                profileImage: user.profile_image
            }
        });

    } catch (error) {
        console.error("Error getting profile:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
}
    //update user profile
    export async function updateProfile(req, res) {
        try {

            if(String(req.user.id) !== String(req.params.id)){
                return res.status(403).json({
                    message: "Access denied"
                })
            }

            const { name, email, phoneNumber } = req.body;
            
            const result = await pool.query(`
                UPDATE users
                SET name = $1, email = $2, phone_number = $3
                WHERE id = $4
                RETURNING id, name, email, phone_number, role, profile_image
            `, [name, email, phoneNumber, req.params.id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const user = result.rows[0];
            res.json({ 
                message: "Profile  updated successfully", 
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phone_number,
                    role: user.role,
                    profileImage: user.profile_image
                }
             });
            
        } catch (error) {
            console.error("Error updating profile:", error);
            res.status(500).json({
                message: "Server error"
            })
            
        }
        
    }

    
    //uploading profile image
    export async function profileImage(req, res) {
        try {

            if(String(req.user.id) !== String(req.params.id)){
                return res.status(403).json({
                    message: "Access denied"
                })
            }
            if (!req.file) {
                return res.status(400).json({ message: "No image uploaded" });
            }

            const userId = req.params.id;

            const fileExtension = req.file.originalname.split('.').pop();

            const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;

            const{error: uploadError} = await supabase.storage
                .from('profile_image')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true
                });

                if(uploadError){
                    console.error("Supabase upload error:", uploadError);
                    return res.status(500).json({ message: "Error uploading image" });
                }

                const {data} = supabase.storage
                    .from('profile_image')
                    .getPublicUrl(fileName);
                
                const imageUrl = data.publicUrl;

                const result = await pool.query(`
                    UPDATE users
                    SET profile_image = $1
                    WHERE id = $2
                    RETURNING id, name, email, phone_number AS "phoneNumber", role, profile_image
                `, [imageUrl, userId]);

                if (result.rows.length === 0) {
                    return res.status(404).json({ message: "User not found" });
                }

                const user = result.rows[0];
                res.json({ 
                    message: "Profile image updated successfully",
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        role: user.role,
                        profileImage: user.profile_image
                    }
                 });
        }catch (error) {
            console.error("Error updating profile image:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
            
    //cart and favorite books management
    export async function getCart(req, res) {
        try {

            if(String(req.user.id) !== String(req.params.id)){
                return res.status(403).json({
                    message: "Access denied"
                })
            }
            const result = await pool.query(`
                SELECT
                ci.id,
                ci.user_id,
                ci.book_id,
                ci.quantity,
                b.title,
                b.author,
                b.genre,
                b.summary,
                b.price
                FROM cart_items ci
                JOIN books b ON ci.book_id = b.id
                WHERE ci.user_id = $1
                ORDER BY ci.id DESC
             `, [req.params.id]
            );

            const cart = result.rows.map(item => ({
                id: item.book_id,
                title: item.title,
                author: item.author,
                genre: item.genre,
                summary: item.summary,
                price: item.price,
                quantity: item.quantity
            }));

            res.json(cart);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }

    export async function addToCart(req, res) {
        try {

            if(String(req.user.id) !== String(req.params.id)){
                return res.status(403).json({
                    message: "Access denied"
                })
            }
            
            const { book } = req.body;

            if (!book || !book.id) {
                return res.status(400).json({ message: "book data is required" });
            }

            const quantity = Number(book.quantity) || 1;

            const bookResult = await pool.query("SELECT * FROM books WHERE id = $1", [book.id]);

            if(bookResult.rows.length === 0){
                return res.status(404).json({ message: "Book not found" });
            }

            const existingCartItem = await pool.query(
                "SELECT * FROM cart_items WHERE user_id = $1 AND book_id = $2",
                [req.params.id, book.id]
            );

            if (existingCartItem.rows.length > 0) {

                await pool.query(
                    "UPDATE cart_items SET quantity = quantity + $1 WHERE user_id = $2 AND book_id = $3",
                    [quantity, req.params.id, book.id]
                );
            } else {
                await pool.query(
                    "INSERT INTO cart_items (user_id, book_id, quantity) VALUES ($1, $2, $3)",
                    [req.params.id, book.id, quantity]
                );
            }

            const result = await pool.query(`
                SELECT
                ci.book_id,
                ci.quantity,
                b.title,
                b.author,
                b.genre,
                b.summary,
                b.price
                FROM cart_items ci
                JOIN books b ON ci.book_id = b.id
                WHERE ci.user_id = $1
                ORDER BY ci.id DESC
             `, [req.params.id]
            );

            const cart = result.rows.map(item => ({
                id: item.book_id,
                title: item.title,
                author: item.author,
                genre: item.genre,
                summary: item.summary,
                price: item.price,
                quantity: item.quantity
            }));

            res.json(cart);
        } catch (error) {
            console.error("Error adding to cart:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    export async function removeFromCart(req, res) {
        try {
            if(String(req.user.id) !== String(req.params.id)){
                return res.status(403).json({
                    message: "Access denied"
                })
            }
            
            const result = await pool.query(
                "DELETE FROM cart_items WHERE user_id = $1 AND book_id = $2 RETURNING *",
                [req.params.id, req.params.bookId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Book not found in cart" });
            }

            res.json({ message: "Book removed from cart successfully" });
            
        } catch (error) {
            console.error("Error removing from cart:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    export async function clearCart(req, res) {
        try {

            if(String(req.user.id) !== String(req.params.id)){
                return res.status(403).json({
                    message: "Access denied"
                })
            }
            
            await pool.query(
                "DELETE FROM cart_items WHERE user_id = $1",
                [req.params.id]
            );
            res.json({ message: "Cart cleared successfully" });
        } catch (error) {
            console.error("Error clearing cart:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    export async function getFavoriteBooks(req, res) {
        try {

            if(String(req.user.id) !== String(req.params.id)){
                return res.status(403).json({
                    message: "Access denied"
                })
            }

            const result = await pool.query(`
                SELECT
                f.book_id,
                b.title,
                b.author,
                b.genre,
                b.summary,
                b.price
                FROM favorites f
                JOIN books b ON f.book_id = b.id
                WHERE f.user_id = $1
                ORDER BY f.id DESC
             `, [req.params.id]
            );

            const favoriteBooks = result.rows.map(book => ({
                id: book.book_id,
                title: book.title,
                author: book.author,
                genre: book.genre,
                summary: book.summary,
                price: book.price
            }));
            res.json(favoriteBooks);
        } catch (error) {
            console.error("Error getting favorite books:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    export async function addToFavorite(req, res) {
        try {

            if(String(req.user.id) !== String(req.params.id)){
                return res.status(403).json({
                    message: "Access denied"
                })
            }
            const book = req.body;

            if (!book || !book.id) {
                return res.status(400).json({ message: "book data is required" });
            }

            const bookResult = await pool.query("SELECT * FROM books WHERE id = $1", [book.id]);

            if(bookResult.rows.length === 0){
                return res.status(404).json({ message: "Book not found" });
            }

            await pool.query(
                "INSERT INTO favorites(user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [req.params.id, book.id]
            );

            const result = await pool.query(`
                SELECT
                f.book_id,
                b.title,
                b.author,
                b.genre,
                b.summary,
                b.price
                FROM favorites f
                JOIN books b ON f.book_id = b.id
                WHERE f.user_id = $1
                ORDER BY f.id DESC
             `, [req.params.id]
            );

            const favoriteBooks = result.rows.map(book => ({
                id: book.book_id,
                title: book.title,
                author: book.author,
                genre: book.genre,
                summary: book.summary,
                price: book.price
            }));
            res.json(favoriteBooks);
        } catch (error) {
            console.error("Error removing book from favorites:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    export async function removeFromFavorite(req, res) {
        try {

            if(String(req.user.id) !== String(req.params.id)){
                return res.status(403).json({
                    message: "Access denied"
                })
            }

            const result = await pool.query(
                "DELETE FROM favorites WHERE user_id = $1 AND book_id = $2 RETURNING *",
                [req.params.id, req.params.bookId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Book not found in favorites" });
            }

            const favoriteResult = await pool.query(`
                SELECT
                f.book_id,
                b.title,
                b.author,
                b.genre,
                b.summary,
                b.price
                FROM favorites f
                JOIN books b ON f.book_id = b.id
                WHERE f.user_id = $1
                ORDER BY f.id DESC
             `, [req.params.id]
            );

            const favoriteBooks = favoriteResult.rows.map(book => ({
                id: book.book_id,
                title: book.title,
                author: book.author,
                genre: book.genre,
                summary: book.summary,
                price: book.price
            }));
            res.json(favoriteBooks);
        } catch (error) {
            console.error("Error removing book from favorites:", error);
            res.status(500).json({ message: "Server error" });
        }
    }