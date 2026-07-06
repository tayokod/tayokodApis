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

// ---------- regions ----------

export const regionCreateSchema = z.object({
  name: z.string().min(1),
  capital: z.string().min(1),
  population: z.string().optional(),
  areaKm2: z.number().nonnegative().optional(),
  populationDensity: z.number().nonnegative().optional(),
  languages: z.array(z.string()).optional(),
  administrationType: z.string().min(1),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  flag: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const regionUpdateSchema = regionCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' }
);

// ---------- zones ----------

export const zoneCreateSchema = z.object({
  name: z.string().min(1),
  regionId: z.number().int().positive(),
  population: z.number().int().nonnegative().optional(),
  areaKm2: z.number().nonnegative().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const zoneUpdateSchema = zoneCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' }
);

export const zonesQuerySchema = z.object({
  regionId: z.coerce.number().int().positive().optional(),
  page,
  limit,
});

// ---------- categories ----------

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' }
);

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

export const foodUpdateSchema = foodCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' }
);

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
    .enum([
      'name', '-name',
      'price', '-price',
      'rating', '-rating',
      'createdAt', '-createdAt',
    ])
    .optional(),
});
