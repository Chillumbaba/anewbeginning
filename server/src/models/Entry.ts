import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Entry = mongoose.model('Entry', entrySchema); 