import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// Debug logging middleware - log all requests
app.use((req, res, next) => {
    console.log(`\n[Request] ==================`);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log(`Base URL: ${req.baseUrl}`);
    console.log(`Path: ${req.path}`);
    console.log(`Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Query:', req.query);
    console.log('Body:', req.body);
    console.log(`[Request] ==================\n`);
    next();
});

// CORS configuration
const corsOptions = {
    origin: '*',  // Allow all origins for debugging
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 86400  // Cache preflight requests for 24 hours
};

console.log('[Setup] Configuring CORS:', corsOptions);
app.use(cors(corsOptions));
app.use(express.json());

// Register routes
console.log('[Setup] Registering routes...');

// Health check route - register this first
app.get('/api/health', (req, res) => {
    console.log('[Route] Health check route accessed');
    res.setHeader('Content-Type', 'application/json');
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        request: {
            path: req.path,
            baseUrl: req.baseUrl,
            originalUrl: req.originalUrl
        }
    });
});

// Root route
app.get('/', (req, res) => {
    console.log('[Route] Root route accessed');
    res.json({
        message: 'A New Beginning API',
        status: 'running',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            health: '/api/health'
        }
    });
});

// Log registered routes
app._router.stack.forEach((r: any) => {
    if (r.route && r.route.path) {
        console.log('[Setup] Route registered:', r.route.path);
    }
});

// 404 handler - register this last
app.use((req, res) => {
    console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Not Found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Error]', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// Start server
app.listen(port, () => {
    console.log('\n[Server] Starting...');
    console.log(`[Server] Running on port ${port}`);
    console.log('[Server] Environment:', process.env.NODE_ENV || 'development');
    console.log('[Server] Available routes:');
    console.log('- GET /');
    console.log('- GET /api/health');
    console.log('\n[Server] Ready for requests!\n');
}); 