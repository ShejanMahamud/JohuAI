import express from 'express';
import passport from 'passport';
import {
  googleLoginFailure,
  googleLoginSuccess,
  loginUser,
  registerUser,
} from '../controllers/auth.controller';
import authenticateToken from '../middlewares/auth.middleware';

const router = express.Router();
//email and password register
router.post('/register', authenticateToken, registerUser);
//email and password login
router.post('/login', authenticateToken, loginUser);
//google login authentication
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);
//google login authentication callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/google/callback/success',
    failureRedirect: '/auth/google/callback/failure',
  }),
);
//google login authentication success
router.get('/google/callback/success', googleLoginSuccess);
//google login authentication failure
router.get('/google/callback/failure', googleLoginFailure);
export default router;
