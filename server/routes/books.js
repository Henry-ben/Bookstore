import express from 'express';
import { addBooks, getAllBooks, updateBook, deleteBook} from '../controllers/bookController.js';
import { authenticateToken, allowAdmin } from '../middleware/authMiddleware.js';
import upload from "../middleware/upload.js"

const bookRouter = express.Router();

bookRouter.post('/add', authenticateToken, allowAdmin, upload.single("image"), addBooks);
bookRouter.get('/',  getAllBooks);
bookRouter.put('/:id', authenticateToken, allowAdmin, upload.single("image"), updateBook);
bookRouter.delete('/:id', authenticateToken, allowAdmin, deleteBook);


export default bookRouter;