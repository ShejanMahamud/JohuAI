import express from 'express';
import passport from 'passport';
import {
  googleLoginFailure,
  googleLoginSuccess,
  loginUser,
  registerUser,
} from '../controllers/auth.controller';
import { initializePassport } from '../helpers/passport';
initializePassport();
const router = express.Router();
//email and password register
router.post('/register', registerUser);
//email and password login
router.post('/login', loginUser);
//google login authentication
router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
  }),
);

//google login authentication callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
  }),
  (req, res) => {
    if (!req.user) {
      return res.redirect('/v1/api/auth/google/callback/failure');
    }
    const { email, accessToken, refreshToken } = req.user as {
      email: string;
      accessToken: string;
      refreshToken: string;
    };
    if (req.user) {
      return res.redirect(
        `/v1/api/auth/google/callback/success?email=${email}&accessToken=${accessToken}&refreshToken=${refreshToken}`,
      );
    }
  },
);
//google login authentication success
router.get('/google/callback/success', googleLoginSuccess);
//google login authentication failure
router.get('/google/callback/failure', googleLoginFailure);
export default router;
