import { describe, it, expect, vi } from 'vitest';
import { paginate, sortToOrderBy } from '../../lib/paginate.js';

// ---------- paginate ----------

describe('paginate', () => {
  function mockModel(data, total) {
    return {
      findMany: vi.fn().mockResolvedValue(data),
      count: vi.fn().mockResolvedValue(total),
    };
  }

  it('returns a plain array when no page or limit is provided', async () => {
    const items = [{ id: 1 }, { id: 2 }];
    const model = mockModel(items, 2);

    const result = await paginate(model, { where: {} });

    expect(result).toEqual(items);
    expect(Array.isArray(result)).toBe(true);
    expect(model.findMany).toHaveBeenCalledWith({
      where: {},
      include: undefined,
      orderBy: undefined,
    });
  });

  it('returns a pagination envelope when page is provided', async () => {
    const items = [{ id: 1 }];
    const model = mockModel(items, 15);

    const result = await paginate(model, { where: {} }, { page: 1, limit: 10 });

    expect(result).toEqual({
      data: items,
      pagination: { page: 1, limit: 10, total: 15, totalPages: 2 },
    });
  });

  it('returns a pagination envelope when limit is provided', async () => {
    const items = [{ id: 1 }];
    const model = mockModel(items, 50);

    const result = await paginate(model, { where: {} }, { limit: 25 });

    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(25);
    expect(result.pagination.total).toBe(50);
    expect(result.pagination.totalPages).toBe(2);
  });

  it('defaults to page 1 when only limit is given', async () => {
    const model = mockModel([], 0);
    const result = await paginate(model, {}, { limit: 10 });
    expect(result.pagination.page).toBe(1);
  });

  it('defaults limit to 20 when only page is given', async () => {
    const model = mockModel([], 0);
    const result = await paginate(model, {}, { page: 3 });
    expect(result.pagination.limit).toBe(20);
  });

  it('applies skip/take for pagination', async () => {
    const model = mockModel([], 100);
    await paginate(model, { where: {} }, { page: 3, limit: 10 });

    expect(model.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('passes include and orderBy through', async () => {
    const model = mockModel([], 0);
    const include = { author: true };
    const orderBy = { title: 'asc' };

    await paginate(model, { where: {}, include, orderBy }, { page: 1, limit: 5 });

    expect(model.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include, orderBy })
    );
  });

  it('uses default where {} when omitted', async () => {
    const model = mockModel([], 0);
    await paginate(model, {}, { page: 1, limit: 5 });
    expect(model.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  it('calculates totalPages correctly for edge cases', async () => {
    const model = mockModel([], 1);

    const result = await paginate(model, {}, { page: 1, limit: 100 });
    expect(result.pagination.totalPages).toBe(1);
  });

  it('returns empty data when total is 0', async () => {
    const model = mockModel([], 0);
    const result = await paginate(model, {}, { page: 1, limit: 10 });

    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });
});

// ---------- sortToOrderBy ----------

describe('sortToOrderBy', () => {
  it('returns undefined for falsy input', () => {
    expect(sortToOrderBy(undefined)).toBeUndefined();
    expect(sortToOrderBy(null)).toBeUndefined();
    expect(sortToOrderBy('')).toBeUndefined();
  });

  it('converts "price" to ascending', () => {
    expect(sortToOrderBy('price')).toEqual({ price: 'asc' });
  });

  it('converts "-price" to descending', () => {
    expect(sortToOrderBy('-price')).toEqual({ price: 'desc' });
  });

  it('converts "name" to ascending', () => {
    expect(sortToOrderBy('name')).toEqual({ name: 'asc' });
  });

  it('converts "-name" to descending', () => {
    expect(sortToOrderBy('-name')).toEqual({ name: 'desc' });
  });

  it('converts "createdAt" to ascending', () => {
    expect(sortToOrderBy('createdAt')).toEqual({ createdAt: 'asc' });
  });

  it('converts "-createdAt" to descending', () => {
    expect(sortToOrderBy('-createdAt')).toEqual({ createdAt: 'desc' });
  });

  it('handles "rating" and "-rating"', () => {
    expect(sortToOrderBy('rating')).toEqual({ rating: 'asc' });
    expect(sortToOrderBy('-rating')).toEqual({ rating: 'desc' });
  });
});
