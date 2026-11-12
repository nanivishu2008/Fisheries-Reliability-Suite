import { Router } from 'express';
import {
  runPredictionEvaluation,
  getPredictions,
  getRecommendations,
  acceptRecommendation,
  rejectRecommendation,
  overrideRecommendation,
} from '../controllers/predictionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Failure Predictions
router.get('/predictions', getPredictions);
router.post('/predictions/run-evaluation', authorize('Maintenance Admin', 'Operations Manager'), runPredictionEvaluation);

// AI Recommendations
router.get('/recommendations', getRecommendations);
router.post('/recommendations/:id/accept', authorize('Maintenance Admin', 'Operations Manager'), acceptRecommendation);
router.post('/recommendations/:id/reject', authorize('Maintenance Admin', 'Operations Manager'), rejectRecommendation);
router.post('/recommendations/:id/override', authorize('Maintenance Admin', 'Operations Manager'), overrideRecommendation);

export default router;
