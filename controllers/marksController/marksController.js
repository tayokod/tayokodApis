import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { paginate } from '../../lib/paginate.js';
import { parseId, markCreateSchema, markUpdateSchema, marksQuerySchema } from '../../lib/validate.js';

// score >= 50 is Passed, below 50 is Failed
const statusFromScore = (score) => (score >= 50 ? 'Passed' : 'Failed');

// get all marks (supports ?studentId=, ?subject=, ?status=, ?page=, ?limit=)
export const getMarks = async (req, res) => {
    const { studentId, subject, status, page, limit } = marksQuerySchema.parse(req.query);

    const where = {};
    if (studentId) where.studentId = studentId;
    if (subject) where.subject = { equals: subject, mode: 'insensitive' };
    if (status) where.status = status;

    const result = await paginate(
        prisma.mark,
        { where, include: { student: true } },
        { page, limit }
    );
    res.json(result);
};

// get a mark by id
export const getMarkById = async (req, res) => {
    const id = parseId(req.params.id);
    const mark = await prisma.mark.findUnique({
        where: { id },
        include: { student: true },
    });
    if (!mark) {
        throw new ApiError(404, 'Mark not found');
    }
    res.json(mark);
};

// create a new mark (status is calculated from the score when not provided)
export const createMark = async (req, res) => {
    const data = markCreateSchema.parse(req.body);
    if (!data.status) {
        data.status = statusFromScore(data.score);
    }
    const newMark = await prisma.mark.create({
        data,
        include: { student: true },
    });
    res.status(201).json(newMark);
};

// update a mark by id (status is recalculated when the score changes)
export const updateMark = async (req, res) => {
    const id = parseId(req.params.id);
    const data = markUpdateSchema.parse(req.body);
    if (data.score !== undefined && data.status === undefined) {
        data.status = statusFromScore(data.score);
    }
    const updatedMark = await prisma.mark.update({ where: { id }, data });
    res.json(updatedMark);
};

// delete a mark by id
export const deleteMark = async (req, res) => {
    const id = parseId(req.params.id);
    await prisma.mark.delete({ where: { id } });
    res.status(204).send();
};
