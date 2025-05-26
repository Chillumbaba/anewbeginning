import { Router, Request, Response } from 'express';
import { Text } from '../models/Text';

const router = Router();

// Get all texts
router.get('/texts', async (_req: Request, res: Response) => {
  try {
    const texts = await Text.find().sort({ createdAt: -1 });
    res.json(texts);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
  }
});

// Create a new text
router.post('/texts', async (req: Request, res: Response) => {
  try {
    const text = new Text({
      content: req.body.content
    });
    const savedText = await text.save();
    res.status(201).json(savedText);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'An error occurred' });
  }
});

export default router; 