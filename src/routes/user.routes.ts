import { Router } from 'express';

import { getAllUsers, getAUser } from '../controllers/user.controller';
import authenticateToken from '../middlewares/auth.middleware';

const router = Router();

// Get all users
router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getAUser);

export default router;
