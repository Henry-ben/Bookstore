import express from 'express';
import { addBooks, getAllBooks, updateBook, deleteBook } from '../controllers/bookController.js';
import { authenticateToken, allowAdmin } from '../middleware/authMiddleware.js';

const bookRouter = express.Router();

bookRouter.post('/add', authenticateToken, allowAdmin, addBooks);
bookRouter.get('/',  getAllBooks);
bookRouter.put('/:id', authenticateToken, allowAdmin, updateBook);
bookRouter.delete('/:id', authenticateToken, allowAdmin, deleteBook);

export default bookRouter;