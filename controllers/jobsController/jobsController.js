import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { paginate } from '../../lib/paginate.js';
import { parseId, jobCreateSchema, jobUpdateSchema, jobsQuerySchema } from '../../lib/validate.js';

// get all jobs (supports ?search=, ?type=, ?location=, ?companyId=, ?page=, ?limit=)
export const getJobs = async (req, res) => {
    const { search, type, location, companyId, page, limit } = jobsQuerySchema.parse(req.query);

    const where = {};
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (type) where.type = { equals: type, mode: 'insensitive' };
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (companyId) where.companyId = companyId;

    const result = await paginate(
        prisma.job,
        { where, include: { company: true } },
        { page, limit }
    );
    res.json(result);
};

// get a job by id
export const getJobById = async (req, res) => {
    const id = parseId(req.params.id);
    const job = await prisma.job.findUnique({
        where: { id },
        include: { company: true },
    });
    if (!job) {
        throw new ApiError(404, 'Job not found');
    }
    res.json(job);
};

// create a new job
export const createJob = async (req, res) => {
    const data = jobCreateSchema.parse(req.body);
    const newJob = await prisma.job.create({
        data,
        include: { company: true },
    });
    res.status(201).json(newJob);
};

// update a job by id
export const updateJob = async (req, res) => {
    const id = parseId(req.params.id);
    const data = jobUpdateSchema.parse(req.body);
    const updatedJob = await prisma.job.update({ where: { id }, data });
    res.json(updatedJob);
};

// delete a job by id
export const deleteJob = async (req, res) => {
    const id = parseId(req.params.id);
    await prisma.job.delete({ where: { id } });
    res.status(204).send();
};
