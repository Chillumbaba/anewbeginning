import express from 'express';
import { GridData } from '../models/GridData';

const router = express.Router();

// Get all grid data
router.get('/', async (req, res) => {
  try {
    const gridData = await GridData.find().sort({ date: -1, rule: 1 });
    res.json(gridData);
  } catch (error) {
    console.error('Error fetching grid data:', error);
    res.status(500).json({ 
      message: 'Error fetching grid data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update or create grid data
router.post('/', async (req, res) => {
  try {
    const { date, rule, status } = req.body;

    // Validate required fields
    if (!date || !rule || !status) {
      return res.status(400).json({ message: 'Date, rule, and status are required' });
    }

    // Validate status value
    if (!['blank', 'tick', 'cross'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Try to find existing data
    const existingData = await GridData.findOne({ date, rule });
    
    if (existingData) {
      // Update existing data
      existingData.status = status;
      const updatedData = await existingData.save();
      console.log('Updated grid data:', updatedData);
      res.json(updatedData);
    } else {
      // Create new data
      const newGridData = new GridData({ date, rule, status });
      const savedData = await newGridData.save();
      console.log('Created new grid data:', savedData);
      res.status(201).json(savedData);
    }
  } catch (error) {
    console.error('Error updating grid data:', error);
    res.status(500).json({ 
      message: 'Error updating grid data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete grid data for a specific date and rule
router.delete('/:date/:rule', async (req, res) => {
  try {
    const { date, rule } = req.params;
    const result = await GridData.findOneAndDelete({ date, rule: parseInt(rule, 10) });
    
    if (!result) {
      return res.status(404).json({ message: 'Grid data not found' });
    }
    
    res.json({ message: 'Grid data deleted successfully' });
  } catch (error) {
    console.error('Error deleting grid data:', error);
    res.status(500).json({ 
      message: 'Error deleting grid data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 