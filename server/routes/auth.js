import express from "express";
import { registerUser, loginUser, updateProfile, getCart, addToCart, removeFromCart, clearCart, getFavoriteBooks, addToFavorite, removeFromFavorite} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.put("/profile/:id",authenticateToken, updateProfile);

authRouter.get("/cart/:id", authenticateToken, getCart);
authRouter.post("/cart/:id", authenticateToken, addToCart);
authRouter.delete("/cart/:id/:bookId", authenticateToken, removeFromCart);
authRouter.delete("/cart/:id", authenticateToken, clearCart);

authRouter.get("/favorites/:id",authenticateToken, getFavoriteBooks);
authRouter.post("/favorites/:id", authenticateToken, addToFavorite);
authRouter.delete("/favorites/:id/:bookId", authenticateToken, removeFromFavorite);

export default authRouter;