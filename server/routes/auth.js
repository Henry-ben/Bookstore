import express from "express";
import { registerUser, loginUser, updateProfile,profileImage, getCart, addToCart, removeFromCart, clearCart, getFavoriteBooks, addToFavorite, removeFromFavorite, getProfile, deleteAccount} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/profile/:id", authenticateToken, getProfile);
authRouter.put("/profile/:id",authenticateToken, updateProfile);
authRouter.put("/profile/:id/image", authenticateToken, upload.single("image"), profileImage);
authRouter.delete("/profile/:id", authenticateToken, deleteAccount);

authRouter.get("/cart/:id", authenticateToken, getCart);
authRouter.post("/cart/:id", authenticateToken, addToCart);
authRouter.delete("/cart/:id/:bookId", authenticateToken, removeFromCart);
authRouter.delete("/cart/:id", authenticateToken, clearCart);

authRouter.get("/favorites/:id",authenticateToken, getFavoriteBooks);
authRouter.post("/favorites/:id", authenticateToken, addToFavorite);
authRouter.delete("/favorites/:id/:bookId", authenticateToken, removeFromFavorite);

export default authRouter;