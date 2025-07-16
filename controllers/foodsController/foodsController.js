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
        const foods = await prisma.foods.findMany({
            include: {
                category: true,
            },
        });
        res.json(foods);
    } catch (error) {
        console.error('Error fetching foods:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } 
}

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

