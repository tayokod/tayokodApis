import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { paginate } from '../../lib/paginate.js';
import { parseId, companyCreateSchema, companyUpdateSchema, companiesQuerySchema } from '../../lib/validate.js';

// get all companies (supports ?search=, ?location=, ?page=, ?limit=)
export const getCompanies = async (req, res) => {
    const { search, location, page, limit } = companiesQuerySchema.parse(req.query);

    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (location) where.location = { contains: location, mode: 'insensitive' };

    const result = await paginate(prisma.company, { where }, { page, limit });
    res.json(result);
};

// get a company by id
export const getCompanyById = async (req, res) => {
    const id = parseId(req.params.id);
    const company = await prisma.company.findUnique({
        where: { id },
        include: { jobs: true },
    });
    if (!company) {
        throw new ApiError(404, 'Company not found');
    }
    res.json(company);
};

// get the jobs of a company
export const getCompanyJobs = async (req, res) => {
    const id = parseId(req.params.id);
    const company = await prisma.company.findUnique({
        where: { id },
        include: { jobs: true },
    });
    if (!company) {
        throw new ApiError(404, 'Company not found');
    }
    res.json(company.jobs);
};

// create a new company
export const createCompany = async (req, res) => {
    const data = companyCreateSchema.parse(req.body);
    const newCompany = await prisma.company.create({ data });
    res.status(201).json(newCompany);
};

// update a company by id
export const updateCompany = async (req, res) => {
    const id = parseId(req.params.id);
    const data = companyUpdateSchema.parse(req.body);
    const updatedCompany = await prisma.company.update({ where: { id }, data });
    res.json(updatedCompany);
};

// delete a company by id (its jobs are deleted too)
export const deleteCompany = async (req, res) => {
    const id = parseId(req.params.id);
    await prisma.company.delete({ where: { id } });
    res.status(204).send();
};
