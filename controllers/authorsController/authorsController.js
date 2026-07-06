import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { paginate } from '../../lib/paginate.js';
import { parseId, authorCreateSchema, authorUpdateSchema, authorsQuerySchema } from '../../lib/validate.js';

// get all authors (supports ?search=, ?country=, ?page=, ?limit=)
export const getAuthors = async (req, res) => {
    const { search, country, page, limit } = authorsQuerySchema.parse(req.query);

    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (country) where.country = { equals: country, mode: 'insensitive' };

    const result = await paginate(prisma.author, { where }, { page, limit });
    res.json(result);
};

// get an author by id
export const getAuthorById = async (req, res) => {
    const id = parseId(req.params.id);
    const author = await prisma.author.findUnique({
        where: { id },
        include: { books: true },
    });
    if (!author) {
        throw new ApiError(404, 'Author not found');
    }
    res.json(author);
};

// get the books of an author
export const getAuthorBooks = async (req, res) => {
    const id = parseId(req.params.id);
    const author = await prisma.author.findUnique({
        where: { id },
        include: { books: true },
    });
    if (!author) {
        throw new ApiError(404, 'Author not found');
    }
    res.json(author.books);
};

// create a new author
export const createAuthor = async (req, res) => {
    const data = authorCreateSchema.parse(req.body);
    const newAuthor = await prisma.author.create({ data });
    res.status(201).json(newAuthor);
};

// update an author by id
export const updateAuthor = async (req, res) => {
    const id = parseId(req.params.id);
    const data = authorUpdateSchema.parse(req.body);
    const updatedAuthor = await prisma.author.update({ where: { id }, data });
    res.json(updatedAuthor);
};

// delete an author by id (their books are deleted too)
export const deleteAuthor = async (req, res) => {
    const id = parseId(req.params.id);
    await prisma.author.delete({ where: { id } });
    res.status(204).send();
};
