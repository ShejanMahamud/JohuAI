import jwt from 'jsonwebtoken';
import config from '../config';
import { UserModel } from '../models/user.model';

interface Profile {
  displayName: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
}

export const authenticateUser = async (
  profile: Profile,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  done: (error: any, user?: any, info?: any) => void,
) => {
  try {
    const name = profile.displayName;
    const email = profile.emails?.[0].value;
    const profile_picture = profile.photos?.[0].value;

    if (!email) {
      return done(new Error('No email found'), false);
    }

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = new UserModel({
        name,
        email,
        profile_picture,
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

    return done(null, {
      accessToken,
      refreshToken,
      email: user.email,
    });
  } catch (error) {
    return done(error, false);
  }
};
