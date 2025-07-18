import { Router } from 'express';
import { 
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage
} from '../controllers/messageController';
import { validateMessage } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(authenticateToken);

router.get('/:groupId', getMessages);
router.post('/:groupId', validateMessage, sendMessage);
router.put('/:messageId', validateMessage, editMessage);
router.delete('/:messageId', deleteMessage);

export default router;
