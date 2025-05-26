import express, { Router, Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

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

// API test route
apiRouter.get('/test', (req: Request, res: Response) => {
    res.json({
        message: 'API test endpoint',
        url: req.url,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
        path: req.path,
        protocol: req.protocol,
        secure: req.secure,
        headers: req.headers
    });
});

// Mount API router
app.use('/api', apiRouter);

// Root test route
app.get('/test', (req: Request, res: Response) => {
    res.json({
        message: 'Root test endpoint',
        url: req.url,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
        path: req.path,
        protocol: req.protocol,
        secure: req.secure,
        headers: req.headers
    });
});

// Root route
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'A New Beginning API',
        status: 'running',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            test: '/test',
            'api-test': '/api/test',
            health: '/api/health'
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