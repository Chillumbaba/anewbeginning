const mongoose = require('mongoose');

const gridCellSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  rule: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['blank', 'tick', 'cross'],
    default: 'blank'
  }
}, {
  timestamps: true
});

// Create a compound index for unique combinations of date and rule
gridCellSchema.index({ date: 1, rule: 1 }, { unique: true });

module.exports = mongoose.model('GridCell', gridCellSchema); 