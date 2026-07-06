import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { paginate } from '../../lib/paginate.js';
import { parseId, cityCreateSchema, cityUpdateSchema, citiesQuerySchema } from '../../lib/validate.js';

// get all cities (supports ?search=, ?country=, ?page=, ?limit=)
export const getCities = async (req, res) => {
    const { search, country, page, limit } = citiesQuerySchema.parse(req.query);

    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (country) where.country = { equals: country, mode: 'insensitive' };

    const result = await paginate(prisma.city, { where }, { page, limit });
    res.json(result);
};

// get a city by id
export const getCityById = async (req, res) => {
    const id = parseId(req.params.id);
    const city = await prisma.city.findUnique({ where: { id } });
    if (!city) {
        throw new ApiError(404, 'City not found');
    }
    res.json(city);
};

// create a new city
export const createCity = async (req, res) => {
    const data = cityCreateSchema.parse(req.body);
    const newCity = await prisma.city.create({ data });
    res.status(201).json(newCity);
};

// update a city by id
export const updateCity = async (req, res) => {
    const id = parseId(req.params.id);
    const data = cityUpdateSchema.parse(req.body);
    const updatedCity = await prisma.city.update({ where: { id }, data });
    res.json(updatedCity);
};

// delete a city by id
export const deleteCity = async (req, res) => {
    const id = parseId(req.params.id);
    await prisma.city.delete({ where: { id } });
    res.status(204).send();
};
