import { Request, Response, Router } from 'express';
import passport from 'passport';
import {
  socialLoginFailure,
  socialLoginSuccess,
} from '../controllers/auth.controller';

/**
 * Configures OAuth routes dynamically for a given provider.
 * @param router - Express router to attach the routes to.
 * @param provider - The name of the OAuth provider (e.g., 'google', 'github').
 * @param scope - The OAuth scope to request from the provider.
 */
export const configureOAuthRoutes = (
  router: Router,
  provider: string,
  scope: string[],
) => {
  // Login Route
  router.get(
    `/${provider}`,
    passport.authenticate(provider, {
      session: false,
      scope,
    }),
  );

  // Callback Route
  router.get(
    `/${provider}/callback`,
    passport.authenticate(provider, { session: false }),
    (req: Request, res: Response) => {
      if (!req.user) {
        return res.redirect(`/v1/api/auth/${provider}/callback/failure`);
      }
      const { email, accessToken, refreshToken } = req.user as {
        email: string;
        accessToken: string;
        refreshToken: string;
      };
      return res.redirect(
        `/v1/api/auth/${provider}/callback/success?email=${email}&accessToken=${accessToken}&refreshToken=${refreshToken}`,
      );
    },
  );

  // Success and Failure Routes
  router.get(`/${provider}/callback/success`, socialLoginSuccess);
  router.get(`/${provider}/callback/failure`, socialLoginFailure);
};
