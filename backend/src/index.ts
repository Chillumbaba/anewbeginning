import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import gridDataRoutes from './routes/gridData';
import rulesRoutes from './routes/rules';
import textsRoutes from './routes/texts';
import { Rule } from './models/Rule';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://KP:myvibingpassword1@cluster0.p65cujw.mongodb.net/anewbeginning?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Initialize default rules
    await Rule.createDefaultRules();
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// API Routes
app.use('/api/grid-data', gridDataRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/texts', textsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 