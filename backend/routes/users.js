import express from 'express';
import { getUserProfile, updateProfile, followUser, getAllUsers } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getAllUsers);
router.get('/:username', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/:id/follow', verifyToken, followUser);

export default router;
