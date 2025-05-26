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

// Create API router
const apiRouter = express.Router();

// API router debug middleware
apiRouter.use((req, res, next) => {
    console.log(`\n[API Router] ==================`);
    console.log(`[API Router] Processing request:`);
    console.log(`- Original URL: ${req.originalUrl}`);
    console.log(`- Base URL: ${req.baseUrl}`);
    console.log(`- Path: ${req.path}`);
    console.log(`- Method: ${req.method}`);
    console.log(`- Route Stack:`, apiRouter.stack.map((layer: any) => ({
        name: layer.name,
        path: layer.route?.path,
        methods: layer.route?.methods,
        regexp: layer.regexp?.toString()
    })));
    console.log(`[API Router] ==================\n`);
    next();
});

// API test route
apiRouter.get('/test', (req, res) => {
    console.log('[Route] API test route accessed');
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

// Health check route - match test route structure exactly
apiRouter.get('/health', (req, res) => {
    console.log('[Route] API health route accessed');
    res.json({
        message: 'API health endpoint',
        url: req.url,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
        path: req.path,
        protocol: req.protocol,
        secure: req.secure,
        headers: req.headers,
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Debug middleware to log all route matches
apiRouter.use((req, res, next) => {
    console.log(`\n[API Route Debug] ==================`);
    console.log('Checking route matches for:', req.path);
    apiRouter.stack.forEach((layer: any, index: number) => {
        if (layer.route) {
            const match = layer.regexp.test(req.path);
            console.log(`Route ${index}:`, {
                path: layer.route.path,
                regexp: layer.regexp.toString(),
                matches: match
            });
        }
    });
    console.log(`[API Route Debug] ==================\n`);
    next();
});

// Mount API router
console.log('[Setup] Mounting API router at /api');
app.use('/api', apiRouter);
console.log('[Setup] API router mounted');

// Log registered API routes
console.log('[Setup] API Routes:');
apiRouter.stack.forEach((layer: any, index: number) => {
    if (layer.route) {
        console.log(`[${index}] ${Object.keys(layer.route.methods).join(', ')} ${layer.route.path} (${layer.regexp})`);
    }
});

// Root test route
app.get('/test', (req, res) => {
    console.log('[Route] Root test route accessed');
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
app.get('/', (req, res) => {
    console.log('[Route] Root route accessed');
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

// Log all registered routes
console.log('\n[Setup] All Registered Routes:');
app._router.stack.forEach((middleware: any, index: number) => {
    if (middleware.route) {
        const methods = Object.keys(middleware.route.methods).join(', ');
        console.log(`[${index}] ${methods.toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
        console.log(`[${index}] Router middleware mounted at: ${middleware.regexp}`);
        middleware.handle.stack.forEach((handler: any, handlerIndex: number) => {
            if (handler.route) {
                const methods = Object.keys(handler.route.methods).join(', ');
                const fullPath = `/api${handler.route.path}`;
                console.log(`  [${handlerIndex}] ${methods.toUpperCase()} ${fullPath}`);
            }
        });
    } else {
        console.log(`[${index}] Middleware: ${middleware.name || '<anonymous>'}`);
    }
});
console.log('');

// Route debug middleware - add before 404 handler
app.use((req, res, next) => {
    console.log(`\n[Route Debug] ==================`);
    console.log(`[Route Debug] Request details:`);
    console.log(`- Method: ${req.method}`);
    console.log(`- Original URL: ${req.originalUrl}`);
    console.log(`- Base URL: ${req.baseUrl}`);
    console.log(`- Path: ${req.path}`);
    console.log(`- Route Stack:`, app._router.stack
        .filter((layer: any) => layer.route || layer.name === 'router')
        .map((layer: any) => ({
            name: layer.name,
            regexp: layer.regexp?.toString(),
            path: layer.route?.path,
            matches: layer.regexp?.test(req.path)
        }))
    );
    console.log(`[Route Debug] ==================\n`);
    next();
});

// 404 handler - register this last
app.use((req, res) => {
    console.log(`\n[404] ==================`);
    console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    console.log(`[404] Base URL: ${req.baseUrl}`);
    console.log(`[404] Path: ${req.path}`);
    console.log(`[404] Method: ${req.method}`);
    console.log(`[404] Protocol: ${req.protocol}`);
    console.log(`[404] Headers:`, JSON.stringify(req.headers, null, 2));
    
    // Log registered routes and their match status
    console.log('[404] Available routes and match status:');
    app._router.stack.forEach((layer: any, index: number) => {
        if (layer.route) {
            const matches = layer.regexp.test(req.path);
            console.log(`  [${index}] Route ${layer.route.path} - Matches: ${matches}`);
        } else if (layer.name === 'router') {
            console.log(`  [${index}] Router at ${layer.regexp}:`);
            const routerMatches = layer.regexp.test(req.path);
            console.log(`    Router match: ${routerMatches}`);
            layer.handle.stack.forEach((routerLayer: any, routerIndex: number) => {
                if (routerLayer.route) {
                    const matches = routerLayer.regexp.test(req.path.replace('/api', ''));
                    console.log(`    [${routerIndex}] ${routerLayer.route.path} - Matches: ${matches}`);
                }
            });
        }
    });
    console.log('[404] ==================\n');

    res.status(404).json({
        error: 'Not Found',
        path: req.originalUrl,
        baseUrl: req.baseUrl,
        routePath: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        availableRoutes: ['/test', '/api/test', '/api/health', '/']
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
    console.log('- GET /api/test');
    console.log('- GET /api/health');
    console.log('\n[Server] Ready for requests!\n');
}); 