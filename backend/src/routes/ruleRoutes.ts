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
    const rule = new Rule(req.body);
    const savedRule = await rule.save();
    res.status(201).json(savedRule);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'An error occurred' });
  }
});

// Update a rule
router.put('/rules/:id', async (req: Request, res: Response) => {
  try {
    const updatedRule = await Rule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
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