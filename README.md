# A New Beginning

A habit tracking application inspired by Benjamin Franklin's virtue tracking system.

## Project Structure

This is a monorepo containing both frontend and backend code:

- `/frontend`: React frontend application
- `/backend`: Node.js/Express backend application

## Deployment

The application is deployed on Render with two services:

### Frontend Service (anewbeginning-frontend)

- **URL**: https://anewbeginning-frontend.onrender.com
- **Settings**:
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Start Command: `npm run serve`
- **Environment Variables**:
  - `NODE_ENV`: production
  - `REACT_APP_API_URL`: https://anewbeginning.onrender.com

### Backend Service (anewbeginning-backend)

- **URL**: https://anewbeginning.onrender.com
- **Settings**:
  - Root Directory: `backend`
  - Build Command: `npm install && npm run build`
  - Start Command: `node dist/index.js`
- **Environment Variables**:
  - `NODE_ENV`: production
  - `PORT`: 10000
  - `MONGODB_URI`: (configured in Render dashboard)
  - `JWT_SECRET`: (configured in Render dashboard)

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Chillumbaba/anewbeginning.git
   cd anewbeginning
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Start the development servers:
   ```bash
   # Start backend (from backend directory)
   npm run dev

   # Start frontend (from frontend directory)
   npm start
   ```

The frontend will be available at http://localhost:3000 and the backend at http://localhost:3001. 