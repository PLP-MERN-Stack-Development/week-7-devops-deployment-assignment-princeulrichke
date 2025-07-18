import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
      return;
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Update user online status
    user.isOnline = true;
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // This would be handled by the frontend removing the token
    // and the socket disconnect handler updating the user status
    res.json({ message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
