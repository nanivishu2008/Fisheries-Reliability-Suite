import { Router } from 'express';
import {
  getWorkOrders,
  createWorkOrder,
  getWorkOrderById,
  moveWorkOrderStatus,
  approveWorkOrder,
  rejectWorkOrder,
  verifyClosure,
  getCalendarEvents,
} from '../controllers/maintenanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Work Orders
router.get('/work-orders', getWorkOrders);
router.post('/work-orders', authorize('Maintenance Admin', 'Operations Manager'), createWorkOrder);
router.get('/work-orders/:id', getWorkOrderById);
router.patch('/work-orders/:id/move', moveWorkOrderStatus);

// Approvals & Closure (Admin and Operations Manager)
router.post('/work-orders/:id/approve', authorize('Maintenance Admin', 'Operations Manager'), approveWorkOrder);
router.post('/work-orders/:id/reject', authorize('Maintenance Admin', 'Operations Manager'), rejectWorkOrder);
router.post('/work-orders/:id/verify-closure', authorize('Maintenance Admin', 'Operations Manager'), verifyClosure);

// Calendar
router.get('/calendar', getCalendarEvents);

export default router;
