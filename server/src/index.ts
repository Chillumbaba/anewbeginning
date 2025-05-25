import express from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { Entry } from './models/Entry';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
// In production, no need for CORS since frontend is served by backend
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:3000'
  }));
}
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Successfully connected to MongoDB');
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Routes
app.post('/api/entries', async (req: Request, res: Response) => {
  try {
    console.log('Received POST request with body:', req.body);
    const { text } = req.body;
    
    if (!text) {
      console.log('Text is missing in request');
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const entry = new Entry({ text });
    console.log('Created new entry:', entry);
    
    const savedEntry = await entry.save();
    console.log('Successfully saved entry:', savedEntry);
    
    res.status(201).json(savedEntry);
  } catch (error: any) {
    console.error('Error saving entry:', error.message);
    res.status(500).json({ error: 'Error saving entry', details: error.message });
  }
});

app.get('/api/entries', async (req: Request, res: Response) => {
  try {
    const entries = await Entry.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (error: any) {
    console.error('Error fetching entries:', error.message);
    res.status(500).json({ error: 'Error fetching entries' });
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log('Environment check:');
      console.log('- PORT:', process.env.PORT);
      console.log('- MongoDB URI exists:', !!process.env.MONGODB_URI);
      console.log('- NODE_ENV:', process.env.NODE_ENV);
    });
  } catch (error: any) {
    console.error('Server startup error:', error.message);
    process.exit(1);
  }
};

startServer(); 