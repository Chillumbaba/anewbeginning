import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://anewbeginning-frontend.onrender.com'
    : 'http://localhost:3000'
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.json({
    message: 'A New Beginning API',
    status: 'running',
    endpoints: {
      health: '/api/health'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  console.log('Health check route accessed');
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Available routes:');
  console.log('- GET /');
  console.log('- GET /api/health');
}); 