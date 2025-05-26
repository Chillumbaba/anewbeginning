const express = require('express');
const router = express.Router();
const GridCell = require('../models/GridCell');

// Get all grid cells
router.get('/grid-data', async (req, res) => {
  try {
    const gridCells = await GridCell.find();
    res.json(gridCells);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update or create a grid cell
router.post('/grid-data', async (req, res) => {
  try {
    const { date, rule, status } = req.body;
    
    // Try to find and update the cell, or create if it doesn't exist
    const gridCell = await GridCell.findOneAndUpdate(
      { date, rule },
      { status },
      { new: true, upsert: true }
    );
    
    res.status(200).json(gridCell);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 