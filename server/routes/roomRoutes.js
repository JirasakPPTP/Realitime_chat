import express from 'express';
import { createRoom, getRooms, joinRoom, leaveRoom } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getRooms);
router.post('/', createRoom);
router.post('/:roomId/join', joinRoom);
router.post('/:roomId/leave', leaveRoom);

export default router;
