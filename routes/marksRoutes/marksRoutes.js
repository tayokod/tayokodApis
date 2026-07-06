import express from 'express';
import {
    getMarks,
    getMarkById,
    createMark,
    updateMark,
    deleteMark,
} from '../../controllers/marksController/marksController.js';
const router = express.Router();

// get all marks (supports ?studentId=, ?subject=, ?status=, ?page=, ?limit=)
router.get('/marks', getMarks);

// get a mark by id
router.get('/marks/:id', getMarkById);

// create a new mark
router.post('/marks', createMark);

// update a mark by id
router.patch('/marks/:id', updateMark);

// delete a mark by id
router.delete('/marks/:id', deleteMark);

export default router;
