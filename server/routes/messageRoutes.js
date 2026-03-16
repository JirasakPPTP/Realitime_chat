import express from 'express';
import {
  getConversations,
  getDirectMessages,
  getRoomMessages,
  getUsers,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/users', getUsers);
router.get('/rooms/:roomId', getRoomMessages);
router.get('/direct/:userId', getDirectMessages);
router.get('/conversations', getConversations);

export default router;
