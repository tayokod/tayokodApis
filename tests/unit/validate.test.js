import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import { ApiError } from '../../lib/errors.js';
import {
  parseId,
  categoryCreateSchema,
  categoryUpdateSchema,
  foodCreateSchema,
  foodUpdateSchema,
  foodsQuerySchema,
  bookCreateSchema,
  bookUpdateSchema,
  booksQuerySchema,
  markCreateSchema,
  markUpdateSchema,
  studentCreateSchema,
  studentUpdateSchema,
  jobCreateSchema,
  jobUpdateSchema,
} from '../../lib/validate.js';

// ---------- parseId ----------

describe('parseId', () => {
  it('accepts a positive integer string', () => {
    expect(parseId('42')).toBe(42);
  });

  it('accepts a positive integer number', () => {
    expect(parseId(7)).toBe(7);
  });

  it('coerces numeric strings', () => {
    expect(parseId('1')).toBe(1);
  });

  it('throws ApiError(400) for zero', () => {
    expect(() => parseId('0')).toThrow(ApiError);
    expect(() => parseId('0')).toThrow('id must be a positive integer');
  });

  it('throws ApiError(400) for negative numbers', () => {
    expect(() => parseId('-5')).toThrow(ApiError);
  });

  it('throws ApiError(400) for non-numeric strings', () => {
    expect(() => parseId('abc')).toThrow(ApiError);
  });

  it('throws ApiError(400) for floats', () => {
    expect(() => parseId('3.14')).toThrow(ApiError);
  });

  it('uses custom name in error message', () => {
    expect(() => parseId('abc', 'studentId')).toThrow('studentId must be a positive integer');
  });
});

// ---------- categoryCreateSchema ----------

describe('categoryCreateSchema', () => {
  it('accepts valid data', () => {
    const result = categoryCreateSchema.parse({ name: 'Quraac', slug: 'quraac' });
    expect(result).toEqual({ name: 'Quraac', slug: 'quraac' });
  });

  it('accepts optional fields', () => {
    const result = categoryCreateSchema.parse({
      name: 'Qado',
      slug: 'qado',
      description: 'Lunch',
      image: 'http://example.com/img.jpg',
    });
    expect(result.description).toBe('Lunch');
  });

  it('rejects empty name', () => {
    expect(() => categoryCreateSchema.parse({ name: '', slug: 'x' })).toThrow(ZodError);
  });

  it('rejects empty slug', () => {
    expect(() => categoryCreateSchema.parse({ name: 'X', slug: '' })).toThrow(ZodError);
  });

  it('rejects missing required fields', () => {
    expect(() => categoryCreateSchema.parse({})).toThrow(ZodError);
  });
});

// ---------- categoryUpdateSchema ----------

describe('categoryUpdateSchema', () => {
  it('accepts partial data', () => {
    const result = categoryUpdateSchema.parse({ name: 'Updated' });
    expect(result).toEqual({ name: 'Updated' });
  });

  it('accepts multiple fields', () => {
    const result = categoryUpdateSchema.parse({ name: 'New', slug: 'new' });
    expect(result).toEqual({ name: 'New', slug: 'new' });
  });

  it('rejects empty object', () => {
    expect(() => categoryUpdateSchema.parse({})).toThrow(ZodError);
  });

  it('rejects empty string values', () => {
    expect(() => categoryUpdateSchema.parse({ name: '' })).toThrow(ZodError);
  });
});

// ---------- foodCreateSchema ----------

describe('foodCreateSchema', () => {
  it('accepts minimal valid data', () => {
    const result = foodCreateSchema.parse({ name: 'Canjeero' });
    expect(result.name).toBe('Canjeero');
  });

  it('accepts all optional fields', () => {
    const result = foodCreateSchema.parse({
      name: 'Shaah',
      description: 'Tea',
      price: 2.5,
      rating: 4.8,
      isAvailable: true,
      tags: ['drink'],
      ingredients: ['tea', 'milk'],
      categoryId: 1,
    });
    expect(result.price).toBe(2.5);
    expect(result.tags).toEqual(['drink']);
  });

  it('rejects negative price', () => {
    expect(() => foodCreateSchema.parse({ name: 'X', price: -1 })).toThrow(ZodError);
  });

  it('rejects rating above 5', () => {
    expect(() => foodCreateSchema.parse({ name: 'X', rating: 6 })).toThrow(ZodError);
  });
});

// ---------- foodUpdateSchema ----------

describe('foodUpdateSchema', () => {
  it('accepts partial data', () => {
    const result = foodUpdateSchema.parse({ price: 10 });
    expect(result).toEqual({ price: 10 });
  });

  it('rejects empty object', () => {
    expect(() => foodUpdateSchema.parse({})).toThrow(ZodError);
  });
});

// ---------- foodsQuerySchema ----------

describe('foodsQuerySchema', () => {
  it('accepts empty query (all optional)', () => {
    const result = foodsQuerySchema.parse({});
    expect(result).toEqual({});
  });

  it('accepts all filter params', () => {
    const result = foodsQuerySchema.parse({
      search: 'tea',
      category: 'Quraac',
      minPrice: '1',
      maxPrice: '10',
      isAvailable: 'true',
      tags: 'drink',
      rating: '4',
      page: '2',
      limit: '5',
      sort: '-price',
    });
    expect(result.minPrice).toBe(1);
    expect(result.maxPrice).toBe(10);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
  });

  it('rejects invalid sort value', () => {
    expect(() => foodsQuerySchema.parse({ sort: 'invalid' })).toThrow(ZodError);
  });

  it('rejects invalid isAvailable value', () => {
    expect(() => foodsQuerySchema.parse({ isAvailable: 'yes' })).toThrow(ZodError);
  });

  it('rejects limit above 100', () => {
    expect(() => foodsQuerySchema.parse({ limit: '101' })).toThrow(ZodError);
  });
});

// ---------- bookCreateSchema ----------

describe('bookCreateSchema', () => {
  it('accepts valid data', () => {
    const result = bookCreateSchema.parse({
      title: 'Learning JavaScript',
      genre: 'programming',
      authorId: 1,
      publishedYear: 2020,
    });
    expect(result.title).toBe('Learning JavaScript');
  });

  it('rejects publishedYear below 1000', () => {
    expect(() =>
      bookCreateSchema.parse({
        title: 'X',
        genre: 'Y',
        authorId: 1,
        publishedYear: 999,
      })
    ).toThrow(ZodError);
  });

  it('rejects publishedYear above 2100', () => {
    expect(() =>
      bookCreateSchema.parse({
        title: 'X',
        genre: 'Y',
        authorId: 1,
        publishedYear: 2101,
      })
    ).toThrow(ZodError);
  });

  it('rejects missing authorId', () => {
    expect(() =>
      bookCreateSchema.parse({
        title: 'X',
        genre: 'Y',
        publishedYear: 2020,
      })
    ).toThrow(ZodError);
  });
});

// ---------- bookUpdateSchema ----------

describe('bookUpdateSchema', () => {
  it('accepts partial update', () => {
    const result = bookUpdateSchema.parse({ title: 'Updated Title' });
    expect(result).toEqual({ title: 'Updated Title' });
  });

  it('rejects empty object', () => {
    expect(() => bookUpdateSchema.parse({})).toThrow(ZodError);
  });
});

// ---------- booksQuerySchema ----------

describe('booksQuerySchema', () => {
  it('accepts empty query', () => {
    expect(booksQuerySchema.parse({})).toEqual({});
  });

  it('accepts all params', () => {
    const result = booksQuerySchema.parse({
      search: 'javascript',
      genre: 'programming',
      authorId: '3',
      page: '1',
      limit: '10',
    });
    expect(result.authorId).toBe(3);
  });
});

// ---------- markCreateSchema ----------

describe('markCreateSchema', () => {
  it('accepts valid data', () => {
    const result = markCreateSchema.parse({
      studentId: 1,
      subject: 'Math',
      score: 85,
    });
    expect(result.score).toBe(85);
    expect(result.status).toBeUndefined();
  });

  it('accepts explicit status', () => {
    const result = markCreateSchema.parse({
      studentId: 1,
      subject: 'Math',
      score: 40,
      status: 'Failed',
    });
    expect(result.status).toBe('Failed');
  });

  it('rejects score above 100', () => {
    expect(() =>
      markCreateSchema.parse({ studentId: 1, subject: 'X', score: 101 })
    ).toThrow(ZodError);
  });

  it('rejects negative score', () => {
    expect(() =>
      markCreateSchema.parse({ studentId: 1, subject: 'X', score: -1 })
    ).toThrow(ZodError);
  });

  it('rejects invalid status', () => {
    expect(() =>
      markCreateSchema.parse({ studentId: 1, subject: 'X', score: 50, status: 'Pending' })
    ).toThrow(ZodError);
  });
});

// ---------- markUpdateSchema ----------

describe('markUpdateSchema', () => {
  it('accepts partial update', () => {
    const result = markUpdateSchema.parse({ score: 90 });
    expect(result).toEqual({ score: 90 });
  });

  it('rejects empty object', () => {
    expect(() => markUpdateSchema.parse({})).toThrow(ZodError);
  });
});

// ---------- studentCreateSchema ----------

describe('studentCreateSchema', () => {
  it('accepts valid data', () => {
    const result = studentCreateSchema.parse({
      fullName: 'Ahmed Abdullahi',
      className: 'Grade 10A',
      gender: 'male',
      city: 'Jigjiga',
    });
    expect(result.fullName).toBe('Ahmed Abdullahi');
  });

  it('accepts optional email', () => {
    const result = studentCreateSchema.parse({
      fullName: 'X',
      className: 'Y',
      gender: 'male',
      city: 'Z',
      email: 'test@example.com',
    });
    expect(result.email).toBe('test@example.com');
  });

  it('rejects invalid email format', () => {
    expect(() =>
      studentCreateSchema.parse({
        fullName: 'X',
        className: 'Y',
        gender: 'male',
        city: 'Z',
        email: 'not-an-email',
      })
    ).toThrow(ZodError);
  });
});

// ---------- jobCreateSchema ----------

describe('jobCreateSchema', () => {
  it('accepts valid data', () => {
    const result = jobCreateSchema.parse({
      title: 'Frontend Developer',
      type: 'full-time',
      location: 'Remote',
      companyId: 1,
      description: 'Build UIs',
    });
    expect(result.title).toBe('Frontend Developer');
  });

  it('accepts optional salary', () => {
    const result = jobCreateSchema.parse({
      title: 'X',
      type: 'Y',
      location: 'Z',
      salary: 50000,
      companyId: 1,
      description: 'Do things',
    });
    expect(result.salary).toBe(50000);
  });

  it('rejects negative salary', () => {
    expect(() =>
      jobCreateSchema.parse({
        title: 'X',
        type: 'Y',
        location: 'Z',
        salary: -1,
        companyId: 1,
        description: 'Do things',
      })
    ).toThrow(ZodError);
  });
});
