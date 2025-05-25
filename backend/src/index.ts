import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Debug logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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

// Root route
app.get('/', (req: Request, res: Response) => {
  console.log('Root route accessed');
  res.json({
    message: 'A New Beginning API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      // Add other endpoints here as we create them
    }
  });
});

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  console.log('Health check route accessed');
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not Found', path: req.path });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Available routes:');
  console.log('- GET /');
  console.log('- GET /api/health');
}); 