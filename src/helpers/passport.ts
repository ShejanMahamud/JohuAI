/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from 'passport';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../config';
import { authenticateUser } from '../helpers/authenticateUser'; // Import the reusable logic

const googleStrategy = new GoogleStrategy(
  {
    clientID: config.googleClientId,
    clientSecret: config.googleClientSecret,
    callbackURL: config.serverUrl + '/auth/google/callback',
  },
  async (_accessToken, _refreshToken, profile, done) => {
    await authenticateUser(profile, done);
  },
);

const githubStrategy = new GithubStrategy(
  {
    clientID: config.githubClientId,
    clientSecret: config.githubClientSecret,
    callbackURL: config.serverUrl + '/auth/github/callback',
  },

  async (
    _accessToken: any,
    _refreshToken: any,
    profile: any,
    done: (error: any, user?: any, info?: any) => void,
  ) => {
    await authenticateUser(profile, done);
  },
);

export const initializePassport = async () => {
  passport.use(googleStrategy);
  passport.use(githubStrategy);
};
