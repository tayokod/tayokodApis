import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { paginate, sortToOrderBy } from '../../lib/paginate.js';
import { parseId, productCreateSchema, productUpdateSchema, productsQuerySchema } from '../../lib/validate.js';

// get all products (supports ?search=, ?category=, ?minPrice=, ?maxPrice=, ?page=, ?limit=, ?sort=)
export const getProducts = async (req, res) => {
    const { search, category, minPrice, maxPrice, page, limit, sort } =
        productsQuerySchema.parse(req.query);

    const where = {};
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (category) where.category = { equals: category, mode: 'insensitive' };
    if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const result = await paginate(
        prisma.product,
        { where, orderBy: sortToOrderBy(sort) },
        { page, limit }
    );
    res.json(result);
};

// get a product by id
export const getProductById = async (req, res) => {
    const id = parseId(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }
    res.json(product);
};

// create a new product
export const createProduct = async (req, res) => {
    const data = productCreateSchema.parse(req.body);
    const newProduct = await prisma.product.create({ data });
    res.status(201).json(newProduct);
};

// update a product by id
export const updateProduct = async (req, res) => {
    const id = parseId(req.params.id);
    const data = productUpdateSchema.parse(req.body);
    const updatedProduct = await prisma.product.update({ where: { id }, data });
    res.json(updatedProduct);
};

// delete a product by id
export const deleteProduct = async (req, res) => {
    const id = parseId(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
};
