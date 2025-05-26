import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import gridRoutes from './routes/gridRoutes';
import textRoutes from './routes/textRoutes';
import ruleRoutes from './routes/ruleRoutes';
import { Rule } from './models/Rule';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasktracker';

mongoose.connect(MONGODB_URI)
.then(async () => {
  console.log('Successfully connected to MongoDB Atlas');
  // Initialize default rules
  await Rule.createDefaultRules();
})
.catch(err => {
  console.error('MongoDB Atlas connection error:', err);
  process.exit(1);
});

// API Routes
app.use('/api', gridRoutes);
app.use('/api', textRoutes);
app.use('/api', ruleRoutes);

// Root API route
app.get('/api', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Task Tracker API' });
});

// Root route redirect
app.get('/', (_req: Request, res: Response) => {
  res.redirect('/api');
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 