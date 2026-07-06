import express from 'express';
import {
    getStudents,
    getStudentById,
    getStudentMarks,
    createStudent,
    updateStudent,
    deleteStudent,
} from '../../controllers/studentsController/studentsController.js';
const router = express.Router();

// get all students (supports ?search=, ?className=, ?gender=, ?city=, ?page=, ?limit=)
router.get('/students', getStudents);

// get a student by id
router.get('/students/:id', getStudentById);

// get the marks of a student
router.get('/students/:id/marks', getStudentMarks);

// create a new student
router.post('/students', createStudent);

// update a student by id
router.patch('/students/:id', updateStudent);

// delete a student by id
router.delete('/students/:id', deleteStudent);

export default router;
