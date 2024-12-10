import express from 'express';
import { generateUsageReport } from '../controllers/usageReportController.js';

const router = express.Router();

// Endpoint: POST /api/inventory/usage-report
router.post('/usage-report', generateUsageReport);

export default router;
