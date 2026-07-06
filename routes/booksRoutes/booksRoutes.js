import express from 'express';
import {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
} from '../../controllers/booksController/booksController.js';
const router = express.Router();

// get all books (supports ?search=, ?genre=, ?authorId=, ?page=, ?limit=)
router.get('/books', getBooks);

// get a book by id
router.get('/books/:id', getBookById);

// create a new book
router.post('/books', createBook);

// update a book by id
router.patch('/books/:id', updateBook);

// delete a book by id
router.delete('/books/:id', deleteBook);

export default router;
