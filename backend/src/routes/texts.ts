import express from 'express';
import { Text } from '../models/Text';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all texts for current user
router.get('/', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  try {
    const texts = await Text.find({ userId: (req.user as any)._id }).sort({ createdAt: -1 });
    res.json(texts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching texts' });
  }
});

// Create a new text for current user
router.post('/', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const text = new Text({ userId: (req.user as any)._id, content });
    const savedText = await text.save();
    res.status(201).json(savedText);
  } catch (error) {
    res.status(500).json({ message: 'Error creating text' });
  }
});

export default router; 