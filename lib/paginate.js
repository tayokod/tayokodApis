// Shared list helper: without page/limit it returns a plain array,
// with page/limit it returns { data, pagination }
export async function paginate(model, { where = {}, include, orderBy } = {}, { page, limit } = {}) {
  if (page === undefined && limit === undefined) {
    return model.findMany({ where, include, orderBy });
  }

  const currentPage = page ?? 1;
  const pageSize = limit ?? 20;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      include,
      orderBy,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    model.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

// Turns "price" into { price: 'asc' } and "-price" into { price: 'desc' }
export function sortToOrderBy(sort) {
  if (!sort) return undefined;
  const desc = sort.startsWith('-');
  return { [desc ? sort.slice(1) : sort]: desc ? 'desc' : 'asc' };
}
