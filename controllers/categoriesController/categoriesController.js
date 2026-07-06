import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { parseId, categoryCreateSchema, categoryUpdateSchema } from '../../lib/validate.js';

// get all categories
export const getCategories = async (req, res) => {
  const categories = await prisma.categories.findMany();
  res.status(200).json(categories);
};

// get a category by id
export const getCategoryById = async (req, res) => {
  const id = parseId(req.params.id);
  const category = await prisma.categories.findUnique({
    where: { id },
    include: { foods: true },
  });
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  res.json(category);
};

// post a new category
export const createCategory = async (req, res) => {
  const data = categoryCreateSchema.parse(req.body);
  const newCategory = await prisma.categories.create({ data });
  res.status(201).json(newCategory);
};

// update a category by id
export const updateCategory = async (req, res) => {
  const id = parseId(req.params.id);
  const data = categoryUpdateSchema.parse(req.body);
  const updatedCategory = await prisma.categories.update({
    where: { id },
    data,
  });
  res.status(200).json(updatedCategory);
};

// delete a category by id
export const deleteCategory = async (req, res) => {
  const id = parseId(req.params.id);
  await prisma.categories.delete({ where: { id } });
  res.status(204).send();
};
