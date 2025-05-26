const express = require('express');
const router = express.Router();
const Text = require('../models/Text');

// Get all texts
router.get('/texts', async (req, res) => {
  try {
    const texts = await Text.find().sort({ createdAt: -1 });
    res.json(texts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new text
router.post('/texts', async (req, res) => {
  try {
    const text = new Text({
      content: req.body.content
    });
    const savedText = await text.save();
    res.status(201).json(savedText);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 