import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import User from '../models/user.model';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res
      .status(201)
      .json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: (error as Error).message || 'Error registering user',
      });
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: '1h',
    });
    return res.json({ success: true, token });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        error: (error as Error).message || 'Error logging in',
      });
  }
};
