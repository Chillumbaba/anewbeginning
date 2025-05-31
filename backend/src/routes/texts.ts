import express from 'express';
import { Text } from '../models/Text';

const router = express.Router();

// Get all texts
router.get('/', async (req, res) => {
  try {
    const texts = await Text.find().sort({ createdAt: -1 });
    res.json(texts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching texts' });
  }
});

// Create a new text
router.post('/', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const text = new Text({ content });
    const savedText = await text.save();
    res.status(201).json(savedText);
  } catch (error) {
    res.status(500).json({ message: 'Error creating text' });
  }
});

export default router; 