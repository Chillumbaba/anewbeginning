import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// Trust proxy - required for correct protocol detection behind Render's proxy
app.set('trust proxy', true);

// Debug logging middleware - log all requests
app.use((req, res, next) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['host'] || 'unknown';
    
    console.log(`\n[Request] ==================`);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log(`Base URL: ${req.baseUrl}`);
    console.log(`Path: ${req.path}`);
    console.log(`Protocol: ${protocol}`);
    console.log(`Host: ${host}`);
    console.log(`Full URL: ${protocol}://${host}${req.originalUrl}`);
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

// Create API router with debug logging
const apiRouter = express.Router();

// Debug middleware for API router
apiRouter.use((req, res, next) => {
    console.log(`[API Router] Processing request:`);
    console.log(`- Original URL: ${req.originalUrl}`);
    console.log(`- Base URL: ${req.baseUrl}`);
    console.log(`- Path: ${req.path}`);
    next();
});

// Health check route
apiRouter.get('/health', (req, res) => {
    console.log('[Route] Health check route accessed');
    console.log('Health check details:', {
        path: req.path,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
        protocol: req.protocol,
        secure: req.secure
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        request: {
            path: req.path,
            baseUrl: req.baseUrl,
            originalUrl: req.originalUrl,
            protocol: req.protocol,
            secure: req.secure
        }
    });
});

// Mount API router and log the mounting
console.log('[Setup] Mounting API router at /api');
app.use('/api', apiRouter);
console.log('[Setup] API router mounted');

// Test route to check URL handling
app.get('/test', (req, res) => {
    console.log('[Route] Test route accessed');
    res.json({
        message: 'Test endpoint',
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
app.get('/', (req, res) => {
    console.log('[Route] Root route accessed');
    res.json({
        message: 'A New Beginning API',
        status: 'running',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            test: '/test',
            health: '/api/health'
        }
    });
});

// Log all registered routes
console.log('\n[Setup] Registered Routes:');
console.log('[Setup] Main app routes:');
app._router.stack.forEach((middleware: any, index: number) => {
    if (middleware.route) { // routes registered directly on the app
        console.log(`[${index}] ${Object.keys(middleware.route.methods).join(', ')} ${middleware.route.path}`);
    } else if (middleware.name === 'router') { // router middleware
        console.log(`[${index}] Router middleware mounted at: ${middleware.regexp}`);
        middleware.handle.stack.forEach((handler: any, handlerIndex: number) => {
            if (handler.route) {
                console.log(`  [${handlerIndex}] ${Object.keys(handler.route.methods).join(', ')} ${handler.route.path}`);
            }
        });
    } else {
        console.log(`[${index}] Middleware: ${middleware.name}`);
    }
});
console.log('');

// 404 handler - register this last
app.use((req, res) => {
    console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    console.log('Available routes:', app._router.stack
        .filter((r: any) => r.route || r.name === 'router')
        .map((r: any) => r.route ? r.route.path : `[Router ${r.regexp}]`)
    );
    res.status(404).json({
        error: 'Not Found',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        availableRoutes: ['/test', '/api/health', '/']
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
    console.log('- GET /test');
    console.log('- GET /api/health');
    console.log('\n[Server] Ready for requests!\n');
}); 