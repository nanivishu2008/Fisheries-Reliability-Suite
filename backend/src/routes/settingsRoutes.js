import { Router } from 'express';
import {
  getAuditLogs,
  exportAuditLogsCsv,
  getSettings,
  updateSetting,
  getSpareParts,
  createSparePart,
} from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Spare parts can be viewed by all roles (useful in Work Orders & Recommendations)
router.get('/spare-parts', getSpareParts);
router.post('/spare-parts', authorize('Maintenance Admin'), createSparePart);

// Audit logs & System Settings restricted to Maintenance Admin
router.get('/audit-logs', authorize('Maintenance Admin'), getAuditLogs);
router.get('/audit-logs/export-csv', authorize('Maintenance Admin'), exportAuditLogsCsv);
router.get('/settings', authorize('Maintenance Admin'), getSettings);
router.put('/settings', authorize('Maintenance Admin'), updateSetting);

export default router;
