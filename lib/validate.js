import { z } from 'zod';
import { ApiError } from './errors.js';

const idSchema = z.coerce.number().int().positive();

// Route :id params — returns the numeric id or fails with a 400
export function parseId(value, name = 'id') {
  const result = idSchema.safeParse(value);
  if (!result.success) {
    throw new ApiError(400, `${name} must be a positive integer`);
  }
  return result.data;
}

const page = z.coerce.number().int().min(1).optional();
const limit = z.coerce.number().int().min(1).max(100).optional();

// Updates reuse the create schema with every field optional,
// but the body must not be empty
const asUpdateSchema = (schema) =>
  schema.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

// ---------- categories ----------

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const categoryUpdateSchema = asUpdateSchema(categoryCreateSchema);

// ---------- foods ----------

export const foodCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  price: z.number().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  isAvailable: z.boolean().optional(),
  ingredients: z.array(z.string()).optional(),
});

export const foodUpdateSchema = asUpdateSchema(foodCreateSchema);

export const foodsQuerySchema = z.object({
  search: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().nonnegative().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  isAvailable: z.enum(['true', 'false']).optional(),
  tags: z.string().min(1).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  page,
  limit,
  sort: z
    .enum(['name', '-name', 'price', '-price', 'rating', '-rating', 'createdAt', '-createdAt'])
    .optional(),
});

// ---------- cities ----------

export const cityCreateSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1).optional(),
  population: z.number().int().nonnegative().optional(),
});

export const cityUpdateSchema = asUpdateSchema(cityCreateSchema);

export const citiesQuerySchema = z.object({
  search: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  page,
  limit,
});

// ---------- products ----------

export const productCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  image: z.string().optional(),
  category: z.string().min(1),
  rating: z.number().min(0).max(5).optional(),
  stock: z.number().int().nonnegative().optional(),
});

export const productUpdateSchema = asUpdateSchema(productCreateSchema);

export const productsQuerySchema = z.object({
  search: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page,
  limit,
  sort: z
    .enum(['title', '-title', 'price', '-price', 'rating', '-rating', 'createdAt', '-createdAt'])
    .optional(),
});

// ---------- students ----------

export const studentCreateSchema = z.object({
  fullName: z.string().min(1),
  className: z.string().min(1),
  gender: z.string().min(1),
  city: z.string().min(1),
  email: z.email().optional(),
});

export const studentUpdateSchema = asUpdateSchema(studentCreateSchema);

export const studentsQuerySchema = z.object({
  search: z.string().min(1).optional(),
  className: z.string().min(1).optional(),
  gender: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  page,
  limit,
});

// ---------- marks ----------

export const markCreateSchema = z.object({
  studentId: z.number().int().positive(),
  subject: z.string().min(1),
  score: z.number().min(0).max(100),
  status: z.enum(['Passed', 'Failed']).optional(),
});

export const markUpdateSchema = asUpdateSchema(markCreateSchema);

export const marksQuerySchema = z.object({
  studentId: z.coerce.number().int().positive().optional(),
  subject: z.string().min(1).optional(),
  status: z.enum(['Passed', 'Failed']).optional(),
  page,
  limit,
});

// ---------- authors ----------

export const authorCreateSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
});

export const authorUpdateSchema = asUpdateSchema(authorCreateSchema);

export const authorsQuerySchema = z.object({
  search: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  page,
  limit,
});

// ---------- books ----------

export const bookCreateSchema = z.object({
  title: z.string().min(1),
  genre: z.string().min(1),
  authorId: z.number().int().positive(),
  publishedYear: z.number().int().min(1000).max(2100),
  image: z.string().optional(),
});

export const bookUpdateSchema = asUpdateSchema(bookCreateSchema);

export const booksQuerySchema = z.object({
  search: z.string().min(1).optional(),
  genre: z.string().min(1).optional(),
  authorId: z.coerce.number().int().positive().optional(),
  page,
  limit,
});

// ---------- companies ----------

export const companyCreateSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  website: z.string().min(1).optional(),
});

export const companyUpdateSchema = asUpdateSchema(companyCreateSchema);

export const companiesQuerySchema = z.object({
  search: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  page,
  limit,
});

// ---------- jobs ----------

export const jobCreateSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  location: z.string().min(1),
  salary: z.number().nonnegative().optional(),
  companyId: z.number().int().positive(),
  description: z.string().min(1),
});

export const jobUpdateSchema = asUpdateSchema(jobCreateSchema);

export const jobsQuerySchema = z.object({
  search: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  companyId: z.coerce.number().int().positive().optional(),
  page,
  limit,
});
