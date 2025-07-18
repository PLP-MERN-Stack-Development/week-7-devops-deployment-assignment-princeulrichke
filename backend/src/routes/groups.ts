import { Router } from 'express';
import { 
  createGroup, 
  getGroups, 
  getGroup,
  joinGroup,
  leaveGroup,
  deleteGroup,
  discoverGroups
} from '../controllers/groupController';
import { validateGroup } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(authenticateToken);

router.post('/', validateGroup, createGroup);
router.get('/', getGroups);
router.get('/discover', discoverGroups); // Add this before /:groupId to avoid conflicts
router.get('/:groupId', getGroup);
router.post('/:groupId/join', joinGroup);
router.delete('/:groupId/leave', leaveGroup);
router.delete('/:groupId', deleteGroup);

export default router;
