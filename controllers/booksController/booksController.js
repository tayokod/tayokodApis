import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { paginate } from '../../lib/paginate.js';
import { parseId, bookCreateSchema, bookUpdateSchema, booksQuerySchema } from '../../lib/validate.js';

// get all books (supports ?search=, ?genre=, ?authorId=, ?page=, ?limit=)
export const getBooks = async (req, res) => {
    const { search, genre, authorId, page, limit } = booksQuerySchema.parse(req.query);

    const where = {};
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (genre) where.genre = { equals: genre, mode: 'insensitive' };
    if (authorId) where.authorId = authorId;

    const result = await paginate(
        prisma.book,
        { where, include: { author: true } },
        { page, limit }
    );
    res.json(result);
};

// get a book by id
export const getBookById = async (req, res) => {
    const id = parseId(req.params.id);
    const book = await prisma.book.findUnique({
        where: { id },
        include: { author: true },
    });
    if (!book) {
        throw new ApiError(404, 'Book not found');
    }
    res.json(book);
};

// create a new book
export const createBook = async (req, res) => {
    const data = bookCreateSchema.parse(req.body);
    const newBook = await prisma.book.create({
        data,
        include: { author: true },
    });
    res.status(201).json(newBook);
};

// update a book by id
export const updateBook = async (req, res) => {
    const id = parseId(req.params.id);
    const data = bookUpdateSchema.parse(req.body);
    const updatedBook = await prisma.book.update({ where: { id }, data });
    res.json(updatedBook);
};

// delete a book by id
export const deleteBook = async (req, res) => {
    const id = parseId(req.params.id);
    await prisma.book.delete({ where: { id } });
    res.status(204).send();
};
