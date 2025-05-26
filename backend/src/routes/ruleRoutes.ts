import { Router, Request, Response } from 'express';
import { Rule } from '../models/Rule';

const router = Router();

// Get all rules
router.get('/rules', async (_req: Request, res: Response) => {
  try {
    const rules = await Rule.find().sort('number');
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
  }
});

// Create a new rule
router.post('/rules', async (req: Request, res: Response) => {
  try {
    // Validate required fields
    const { number, name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (typeof number !== 'number' || isNaN(number)) {
      return res.status(400).json({ message: 'Valid number is required' });
    }

    // Check if number already exists
    const existingRule = await Rule.findOne({ number });
    if (existingRule) {
      return res.status(400).json({ message: 'A rule with this number already exists' });
    }

    console.log('Creating new rule:', req.body);
    const rule = new Rule(req.body);
    const savedRule = await rule.save();
    console.log('Rule created:', savedRule);
    res.status(201).json(savedRule);
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(400).json({ message: error instanceof Error ? error.message : 'An error occurred' });
  }
});

// Update a rule
router.put('/rules/:id', async (req: Request, res: Response) => {
  try {
    const updatedRule = await Rule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    res.json(updatedRule);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'An error occurred' });
  }
});

// Delete a rule
router.delete('/rules/:id', async (req: Request, res: Response) => {
  try {
    const deletedRule = await Rule.findByIdAndDelete(req.params.id);
    if (!deletedRule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'An error occurred' });
  }
});

// Initialize default rules
router.post('/rules/init', async (_req: Request, res: Response) => {
  try {
    await Rule.createDefaultRules();
    const rules = await Rule.find().sort('number');
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
  }
});

export default router; 