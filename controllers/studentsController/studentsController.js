import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { paginate } from '../../lib/paginate.js';
import { parseId, studentCreateSchema, studentUpdateSchema, studentsQuerySchema } from '../../lib/validate.js';

// get all students (supports ?search=, ?className=, ?gender=, ?city=, ?page=, ?limit=)
export const getStudents = async (req, res) => {
    const { search, className, gender, city, page, limit } =
        studentsQuerySchema.parse(req.query);

    const where = {};
    if (search) where.fullName = { contains: search, mode: 'insensitive' };
    if (className) where.className = { equals: className, mode: 'insensitive' };
    if (gender) where.gender = { equals: gender, mode: 'insensitive' };
    if (city) where.city = { equals: city, mode: 'insensitive' };

    const result = await paginate(prisma.student, { where }, { page, limit });
    res.json(result);
};

// get a student by id
export const getStudentById = async (req, res) => {
    const id = parseId(req.params.id);
    const student = await prisma.student.findUnique({
        where: { id },
        include: { marks: true },
    });
    if (!student) {
        throw new ApiError(404, 'Student not found');
    }
    res.json(student);
};

// get the marks of a student
export const getStudentMarks = async (req, res) => {
    const id = parseId(req.params.id);
    const student = await prisma.student.findUnique({
        where: { id },
        include: { marks: true },
    });
    if (!student) {
        throw new ApiError(404, 'Student not found');
    }
    res.json(student.marks);
};

// create a new student
export const createStudent = async (req, res) => {
    const data = studentCreateSchema.parse(req.body);
    const newStudent = await prisma.student.create({ data });
    res.status(201).json(newStudent);
};

// update a student by id
export const updateStudent = async (req, res) => {
    const id = parseId(req.params.id);
    const data = studentUpdateSchema.parse(req.body);
    const updatedStudent = await prisma.student.update({ where: { id }, data });
    res.json(updatedStudent);
};

// delete a student by id (their marks are deleted too)
export const deleteStudent = async (req, res) => {
    const id = parseId(req.params.id);
    await prisma.student.delete({ where: { id } });
    res.status(204).send();
};
