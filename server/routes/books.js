import express from 'express';
import { addBooks, getAllBooks, updateBook, deleteBook, bookImage } from '../controllers/bookController.js';
import { authenticateToken, allowAdmin } from '../middleware/authMiddleware.js';
import upload from "../middleware/upload.js"

const bookRouter = express.Router();

bookRouter.post('/add', authenticateToken, allowAdmin, addBooks);
bookRouter.get('/',  getAllBooks);
bookRouter.put('/:id', authenticateToken, allowAdmin, updateBook);
bookRouter.delete('/:id', authenticateToken, allowAdmin, deleteBook);
bookRouter.put("/:id/image", authenticateToken,allowAdmin, upload.single("image"), bookImage);

export default bookRouter;