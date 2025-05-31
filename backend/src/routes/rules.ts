import express from 'express';
import { Rule } from '../models/Rule';

const router = express.Router();

// Get all rules
router.get('/', async (req, res) => {
  try {
    const rules = await Rule.find().sort('number');
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rules' });
  }
});

// Create a new rule
router.post('/', async (req, res) => {
  try {
    const { number, name, description, active } = req.body;
    const newRule = new Rule({ number, name, description, active });
    await newRule.save();
    res.status(201).json(newRule);
  } catch (error) {
    res.status(500).json({ message: 'Error creating rule' });
  }
});

// Update a rule
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { number, name, description, active } = req.body;
    const updatedRule = await Rule.findByIdAndUpdate(
      id,
      { number, name, description, active },
      { new: true }
    );
    if (!updatedRule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    res.json(updatedRule);
  } catch (error) {
    res.status(500).json({ message: 'Error updating rule' });
  }
});

// Delete a rule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRule = await Rule.findByIdAndDelete(id);
    if (!deletedRule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting rule' });
  }
});

export default router; 