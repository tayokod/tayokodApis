import express from 'express';
import {
    getJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
} from '../../controllers/jobsController/jobsController.js';
const router = express.Router();

// get all jobs (supports ?search=, ?type=, ?location=, ?companyId=, ?page=, ?limit=)
router.get('/jobs', getJobs);

// get a job by id
router.get('/jobs/:id', getJobById);

// create a new job
router.post('/jobs', createJob);

// update a job by id
router.patch('/jobs/:id', updateJob);

// delete a job by id
router.delete('/jobs/:id', deleteJob);

export default router;
