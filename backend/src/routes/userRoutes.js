import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  patchUserStatus,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('Maintenance Admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/status', patchUserStatus);

export default router;
