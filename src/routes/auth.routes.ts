import express from 'express';
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyOtp,
} from '../controllers/auth.controller';
import { configureOAuthRoutes } from '../helpers/configureAuthRoutes';
import { initializePassport } from '../helpers/passport';
initializePassport();
const router = express.Router();
//email and password register
router.post('/register', registerUser);
//email and password login
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/verify-otp', verifyOtp);
// Configure Google OAuth routes
configureOAuthRoutes(router, 'google', ['profile', 'email']);

// Configure GitHub OAuth routes
configureOAuthRoutes(router, 'github', ['user:email']);

export default router;
