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

// Populate test data
router.post('/populate', async (_req, res) => {
  try {
    // Create test rules
    const rules = await Rule.create([
      { number: 1, name: 'Alcohol limit', description: 'Stay within your limits', active: true },
      { number: 2, name: 'Yoga', description: 'Practice yoga daily', active: true },
      { number: 3, name: 'Meditation', description: 'Daily meditation', active: true },
      { number: 4, name: 'Food', description: 'Healthy eating habits', active: true }
    ]);

    // Create some test grid data
    const today = new Date();
    const gridData = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      for (const rule of rules) {
        gridData.push({
          date: dateStr,
          rule: rule.number,
          status: Math.random() > 0.3 ? 'tick' : 'cross'
        });
      }
    }
    
    await GridData.create(gridData);

    // Create some test texts
    await Text.create([
      { content: 'Test entry 1' },
      { content: 'Test entry 2' },
      { content: 'Test entry 3' }
    ]);

    res.json({ 
      message: 'Test data populated successfully',
      summary: {
        rules: rules.length,
        gridData: gridData.length,
        texts: 3
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error populating test data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 