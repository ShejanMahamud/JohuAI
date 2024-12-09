import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../config';
import { UserModel } from '../models/user.model';
passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: config.serverUrl + '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, callback) => {
      try {
        const name = profile.displayName;
        const email = profile.emails?.[0].value;
        if (!email) {
          return callback(new Error('No email found'), false);
        }
        let user = await UserModel.findOne({ email });
        if (!user) {
          user = new UserModel({
            name,
            email,
          });
          await user.save();
        }
        const accessToken = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          config.jwtSecret,
          { expiresIn: '24h' },
        );
        const refreshToken = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          config.jwtRefresh,
          { expiresIn: '7d' },
        );
        return callback(null, { accessToken, refreshToken, email: user.email });
      } catch (error) {
        return callback(error, false);
      }
    },
  ),
);
