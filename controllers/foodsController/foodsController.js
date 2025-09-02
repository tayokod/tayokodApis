import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();





// model foods{
//   id          Int      @id @default(autoincrement())
//   name        String   @unique
//   description String?
//   image       String?
//   price       Float?
//   images     String[] @default([])
//   isAvailable Boolean  @default(true)
//   category     categories? @relation(fields: [categoryId], references: [id])
//   categoryId Int?
//   tags          String[]    @default([])
//   rating        Float       @default(0)
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt
//   ingredients String[] @default([])

// }


// // Get all foods
export const GetFoodsController = async (req, res) => {
    try {
        const { category, name, price, minPrice, maxPrice, isAvailable, tags, rating } = req.query;


        const filters = {};


        if (category) {
            filters.category = {
                name: {
                    contains: category,
                    mode: 'insensitive',
                },
            };
        }


        if (name) {
            filters.name = {
                contains: name,
                mode: 'insensitive',
            };
        }


        if (price) {
            filters.price = Number(price);
        }


        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.gte = Number(minPrice);
            if (maxPrice) filters.price.lte = Number(maxPrice);
        }


        if (isAvailable !== undefined) {
            filters.isAvailable = isAvailable === 'true';
        }


        if (tags) {
            filters.tags = {
                hasSome: tags.split(','), // e.g. ?tags=spicy,vegan
            };
        }


        if (rating) {
            filters.rating = {
                gte: Number(rating),
            };
        }


        const foods = await prisma.foods.findMany({
            where: filters,
            include: { category: true },
        });


        res.json(foods);
    } catch (error) {
        console.error('Error fetching foods with filters:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// // Post a new food
export const PostFoodsController = async (req, res) => {
    const {
        name,
        description,
        image,
        price,
        images,
        categoryId,
        tags,
        rating,
        ingredients
    } = req.body;

    try {
        const newFood = await prisma.foods.create({
            data: {
                name,
                description,
                image,
                price,
                images,
                categoryId,
                tags,
                rating,
                ingredients
            },
        });
        res.status(201).json(newFood);
    } catch (error) {
        console.error('Error creating food:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


// get food by id

export const GetFoodByIdController = async (req, res) => {
    const { id } = req.params;

    try {
        const food = await prisma.foods.findUnique({
            where: { id: +id },
            include: {
                category: true,
            },
        });

        if (!food) {
            return res.status(404).json({ error: 'Food not found' });
        }

        res.json(food);
    } catch (error) {
        console.error('Error fetching food by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


// search foods by category name
export const searchFoodsByCategoryNameController = async (req, res) => {
    const { categoryName } = req.params;

    try {
        const foods = await prisma.foods.findMany({
            where: { category: { name: categoryName } },
            include: {
                category: true,
            },
        });

        if (!foods.length) {
            return res.status(404).json({ error: 'No foods found for this category' });
        }

        return res.json(foods);
    } catch (error) {
        console.error('Error fetching foods by category name:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


// fetch('https://tayokodapi.online/api/products?category=Quraac')



// fetch('https://tayokodapi.online/api/products?name=Canjeero')

// fetch('https://tayokodapi.online/api/products?price=10')
