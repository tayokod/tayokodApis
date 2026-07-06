import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { parseId, foodCreateSchema, foodUpdateSchema, foodsQuerySchema } from '../../lib/validate.js';

// Get all foods with filters, sorting and pagination
export const GetFoodsController = async (req, res) => {
    const query = foodsQuerySchema.parse(req.query);
    const {
        search, name, category, categoryId,
        price, minPrice, maxPrice,
        isAvailable, tags, rating,
        page, limit, sort,
    } = query;

    const filters = {};

    if (categoryId) {
        filters.categoryId = categoryId;
    } else if (category) {
        filters.category = {
            name: {
                contains: category,
                mode: 'insensitive',
            },
        };
    }

    // search and name both match against the food name
    const nameQuery = search ?? name;
    if (nameQuery) {
        filters.name = {
            contains: nameQuery,
            mode: 'insensitive',
        };
    }

    // a price range takes precedence over an exact price
    if (minPrice !== undefined || maxPrice !== undefined) {
        filters.price = {};
        if (minPrice !== undefined) filters.price.gte = minPrice;
        if (maxPrice !== undefined) filters.price.lte = maxPrice;
    } else if (price !== undefined) {
        filters.price = price;
    }

    if (isAvailable !== undefined) {
        filters.isAvailable = isAvailable === 'true';
    }

    if (tags) {
        filters.tags = {
            hasSome: tags.split(','), // e.g. ?tags=spicy,vegan
        };
    }

    if (rating !== undefined) {
        filters.rating = {
            gte: rating,
        };
    }

    let orderBy;
    if (sort) {
        const desc = sort.startsWith('-');
        orderBy = { [desc ? sort.slice(1) : sort]: desc ? 'desc' : 'asc' };
    }

    // Without page/limit keep the original plain-array response
    if (page === undefined && limit === undefined) {
        const foods = await prisma.foods.findMany({
            where: filters,
            include: { category: true },
            orderBy,
        });
        return res.json(foods);
    }

    const currentPage = page ?? 1;
    const pageSize = limit ?? 20;

    const [foods, total] = await Promise.all([
        prisma.foods.findMany({
            where: filters,
            include: { category: true },
            orderBy,
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
        }),
        prisma.foods.count({ where: filters }),
    ]);

    res.json({
        data: foods,
        pagination: {
            page: currentPage,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        },
    });
};

// Post a new food
export const PostFoodsController = async (req, res) => {
    const data = foodCreateSchema.parse(req.body);
    const newFood = await prisma.foods.create({ data });
    res.status(201).json(newFood);
};

// get food by id
export const GetFoodByIdController = async (req, res) => {
    const id = parseId(req.params.id);
    const food = await prisma.foods.findUnique({
        where: { id },
        include: {
            category: true,
        },
    });
    if (!food) {
        throw new ApiError(404, 'Food not found');
    }
    res.json(food);
};

// update a food by id
export const UpdateFoodController = async (req, res) => {
    const id = parseId(req.params.id);
    const data = foodUpdateSchema.parse(req.body);
    const updatedFood = await prisma.foods.update({
        where: { id },
        data,
    });
    res.json(updatedFood);
};

// delete a food by id
export const DeleteFoodController = async (req, res) => {
    const id = parseId(req.params.id);
    await prisma.foods.delete({ where: { id } });
    res.status(204).send();
};

// search foods by category name
export const searchFoodsByCategoryNameController = async (req, res) => {
    const { categoryName } = req.params;

    const foods = await prisma.foods.findMany({
        where: { category: { name: categoryName } },
        include: {
            category: true,
        },
    });

    if (!foods.length) {
        throw new ApiError(404, 'No foods found for this category');
    }

    res.json(foods);
};
