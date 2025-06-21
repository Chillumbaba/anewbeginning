import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import gridDataRoutes from './routes/gridData';
import rulesRoutes from './routes/rules';
import textsRoutes from './routes/texts';
import statisticsRoutes from './routes/statistics';
import testDbRoutes from './routes/testDb';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import { Rule } from './models/Rule';
import { User } from './models/User';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.text({ type: 'text/csv' }));
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anewbeginning';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Initialize default admin user
    await User.createDefaultAdmin();
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// API Routes
console.log('Registering routes...');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/grid-data', gridDataRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/texts', textsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/test-db', testDbRoutes);

console.log('Routes registered');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Debug route to catch unmatched routes
app.use((req, res, next) => {
  console.log('No route matched for:', req.method, req.url);
  console.log('Available routes:', app._router.stack.map((r: any) => r.route?.path || r.regexp?.toString()).filter(Boolean));
  next();
});

app.listen(port, () => {
  console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
}); 