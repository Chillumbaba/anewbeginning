import express from 'express';
import { GridData } from '../models/GridData';

const router = express.Router();

// Get all grid data
router.get('/', async (req, res) => {
  try {
    const gridData = await GridData.find();
    res.json(gridData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching grid data' });
  }
});

// Update or create grid data
router.post('/', async (req, res) => {
  try {
    const { date, rule, status } = req.body;
    
    const existingData = await GridData.findOne({ date, rule });
    
    if (existingData) {
      existingData.status = status;
      await existingData.save();
      res.json(existingData);
    } else {
      const newGridData = new GridData({ date, rule, status });
      await newGridData.save();
      res.json(newGridData);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating grid data' });
  }
});

export default router; 