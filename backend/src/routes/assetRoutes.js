import { Router } from 'express';
import {
  getAssets,
  getAssetStats,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  patchAssetStatus,
} from '../controllers/assetController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAssets);
router.get('/stats', getAssetStats);
router.get('/:id', getAssetById);

// Maintenance Admin can create, modify, and delete assets
router.post('/', authorize('Maintenance Admin'), createAsset);
router.put('/:id', authorize('Maintenance Admin', 'Operations Manager'), updateAsset);
router.delete('/:id', authorize('Maintenance Admin'), deleteAsset);
router.patch('/:id/status', authorize('Maintenance Admin', 'Operations Manager', 'Technician'), patchAssetStatus);

export default router;
