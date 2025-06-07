import express from 'express';
import { Rule } from '../models/Rule';
import { GridData } from '../models/GridData';
import { Text } from '../models/Text';

const router = express.Router();

// Reset database (clear all collections)
router.post('/reset', async (_req, res) => {
  try {
    await Promise.all([
      Rule.deleteMany({}),
      GridData.deleteMany({}),
      Text.deleteMany({})
    ]);
    res.json({ message: 'Database reset successful' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error resetting database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 