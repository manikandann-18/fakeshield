import express from 'express';
import { createPost, getPosts, likePost, commentPost, verifyPostContent, verifyTextDirectly, deletePost } from '../controllers/postController.js';
import { verifyToken } from '../middleware/auth.js';
const router = express.Router();

router.post('/', verifyToken, createPost);
router.get('/', verifyToken, getPosts);
router.post('/verify-text', verifyToken, verifyTextDirectly);
router.put('/:id/like', verifyToken, likePost);
router.post('/:id/comment', verifyToken, commentPost);
router.post('/:id/verify', verifyToken, verifyPostContent);
router.delete('/:id', verifyToken, deletePost);

export default router;
