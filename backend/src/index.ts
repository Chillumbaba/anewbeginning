import express, { Router, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Text } from './models/Text';

const app = express();
const port = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'your_mongodb_connection_string';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Trust proxy - required for correct protocol detection behind Render's proxy
app.set('trust proxy', true);

// CORS configuration
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json());

// Create API router
const apiRouter = Router();

// Health check route
apiRouter.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Text routes
apiRouter.post('/texts', async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const text = new Text({ content });
        await text.save();
        res.status(201).json(text);
    } catch (error) {
        console.error('Error saving text:', error);
        res.status(500).json({ error: 'Failed to save text' });
    }
});

apiRouter.get('/texts', async (req: Request, res: Response) => {
    try {
        const texts = await Text.find().sort({ createdAt: -1 });
        res.json(texts);
    } catch (error) {
        console.error('Error fetching texts:', error);
        res.status(500).json({ error: 'Failed to fetch texts' });
    }
});

// Mount API router
app.use('/api', apiRouter);

// Root route
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'A New Beginning API',
        status: 'running',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            health: '/api/health',
            texts: '/api/texts'
        }
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('[Error]', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
}); 