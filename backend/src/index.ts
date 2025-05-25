import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://anewbeginning-frontend.onrender.com'
    : 'http://localhost:3000'
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anewbeginning')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: Error) => console.error('MongoDB connection error:', err));

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Your routes will go here

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 