import { Router } from 'express';
import {
  recordTelemetry,
  getTelemetryTrends,
  recordBreakdown,
  getBreakdowns,
  createInspection,
  getInspections,
} from '../controllers/telemetryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Telemetry
router.post('/telemetry', recordTelemetry);
router.get('/telemetry/:assetId/trends', getTelemetryTrends);

// Breakdowns
router.post('/breakdowns', recordBreakdown);
router.get('/breakdowns', getBreakdowns);

// Inspections
router.post('/inspections', createInspection);
router.get('/inspections', getInspections);

export default router;
