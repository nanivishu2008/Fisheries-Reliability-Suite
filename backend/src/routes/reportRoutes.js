import { Router } from 'express';
import {
  getReliabilityMetrics,
  submitReliabilityFeedback,
  getReportSummary,
  exportReportCsv,
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/metrics', getReliabilityMetrics);
router.post('/feedback', submitReliabilityFeedback);
router.get('/summary', getReportSummary);
router.get('/export-csv', exportReportCsv);

export default router;
