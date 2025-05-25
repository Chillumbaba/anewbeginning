# A New Beginning

A simple web application that allows users to save text entries to a MongoDB database. Built with React TypeScript frontend and Node.js TypeScript backend.

## Project Structure
```
your-repo/
+-- frontend/           # React TypeScript frontend
¦   +-- package.json   # Frontend dependencies + scripts
¦   +-- tsconfig.json  # Frontend TS config
¦   +-- public/        # Static files
¦   +-- src/           # Source code
+-- backend/           # Node.js TypeScript backend
¦   +-- package.json   # Backend dependencies + scripts
¦   +-- tsconfig.json  # Backend TS config
¦   +-- src/           # Source code
+-- .gitignore
+-- README.md
```

## Local Development Setup

1. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
cd frontend && npm install
cd ..

# Install backend dependencies
cd backend && npm install
```

2. Create a `.env` file in the backend directory:
```
MONGODB_URI=your_mongodb_uri
PORT=3001
NODE_ENV=development
```

3. Start the development servers:

In one terminal:
```bash
cd backend && npm run start:dev
```

In another terminal:
```bash
cd frontend && npm start
```

## Deployment on Render

### Backend Service (anewbeginning-backend)
1. Service Name: anewbeginning-backend
2. Connect to your GitHub repository
3. Use the following settings:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/index.js`
   - Environment Variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `NODE_ENV`: production
     - `PORT`: 10000

### Frontend Service (anewbeginning-frontend)
1. Service Name: anewbeginning-frontend
2. Connect to your GitHub repository
3. Use the following settings:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `serve -s build`
   - Environment Variables:
     - `REACT_APP_API_URL`: https://anewbeginning-backend.onrender.com

## Environment Variables

### Backend
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Set to 'production' in production environment

### Frontend
- `REACT_APP_API_URL`: https://anewbeginning-backend.onrender.com (in production)

## Development Notes
- Frontend runs on port 3000 by default
- Backend runs on port 3001 by default
- Frontend has proxy configuration to backend for development
- CORS is configured for both development and production
- TypeScript is configured for both frontend and backend
- Production URLs:
  - Frontend: https://anewbeginning-frontend.onrender.com
  - Backend: https://anewbeginning-backend.onrender.com 