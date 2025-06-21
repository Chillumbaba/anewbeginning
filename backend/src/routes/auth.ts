import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth verification
const verifyGoogleToken = async (token: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (error) {
    throw new Error('Invalid Google token');
  }
};

// Sign in/Sign up with Google
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const payload = await verifyGoogleToken(token);
    
    if (!payload) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        email,
        name,
        picture,
        googleId,
        isAdmin: email === 'krishnan.paddy@gmail.com' // Set admin based on email
      });
    } else {
      // Update existing user's Google ID if needed
      if (user.googleId !== googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router; 