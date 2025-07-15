import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();





// get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.categories.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};



// post a new category
export const createCategory = async (req, res) => {
    const { name , description, slug, image} = req.body;
    try {
        const newCategory = await prisma.categories.create({
        data: { 
            name,
            description,
            slug,
            image,

        },
        });
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
    }


