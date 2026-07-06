import express from 'express';
import {
    getAuthors,
    getAuthorById,
    getAuthorBooks,
    createAuthor,
    updateAuthor,
    deleteAuthor,
} from '../../controllers/authorsController/authorsController.js';
const router = express.Router();

// get all authors (supports ?search=, ?country=, ?page=, ?limit=)
router.get('/authors', getAuthors);

// get an author by id
router.get('/authors/:id', getAuthorById);

// get the books of an author
router.get('/authors/:id/books', getAuthorBooks);

// create a new author
router.post('/authors', createAuthor);

// update an author by id
router.patch('/authors/:id', updateAuthor);

// delete an author by id
router.delete('/authors/:id', deleteAuthor);

export default router;
