import express from 'express';
import {
    getCompanies,
    getCompanyById,
    getCompanyJobs,
    createCompany,
    updateCompany,
    deleteCompany,
} from '../../controllers/companiesController/companiesController.js';
const router = express.Router();

// get all companies (supports ?search=, ?location=, ?page=, ?limit=)
router.get('/companies', getCompanies);

// get a company by id
router.get('/companies/:id', getCompanyById);

// get the jobs of a company
router.get('/companies/:id/jobs', getCompanyJobs);

// create a new company
router.post('/companies', createCompany);

// update a company by id
router.patch('/companies/:id', updateCompany);

// delete a company by id
router.delete('/companies/:id', deleteCompany);

export default router;
