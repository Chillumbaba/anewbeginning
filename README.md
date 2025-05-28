# A New Beginning

A task tracking application with a frontend built in React and a backend in Node.js.

## Project Structure

This is a monorepo containing:
- `frontend/`: React application
- `backend/`: Node.js API server

## Deployment on Render

The application is deployed on Render with two services:

### Frontend Service (anewbeginning-frontend)

Available at: https://anewbeginning-frontend.onrender.com

Settings:
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Start Command: `npm run serve`

Environment Variables:
- `NODE_ENV`: production
- `REACT_APP_API_URL`: https://anewbeginning.onrender.com

### Backend Service (anewbeginning-backend)

Available at: https://anewbeginning.onrender.com

Settings:
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `node dist/index.js`

Environment Variables:
- `JWT_SECRET`: [secure secret]
- `MONGODB_URI`: [MongoDB connection string]
- `NODE_ENV`: production
- `PORT`: 10000

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Create `.env` files:
   - Frontend: Create `frontend/.env` with:
     ```
     REACT_APP_API_URL=http://localhost:3001
     ```
   - Backend: Create `backend/.env` with:
     ```
     JWT_SECRET=[your-secret]
     MONGODB_URI=[your-mongodb-uri]
     NODE_ENV=development
     PORT=3001
     ```

4. Start the development servers:
   ```bash
   # Start backend
   cd backend
   npm run dev

   # Start frontend (in a new terminal)
   cd frontend
   npm start
   ```

## Deployment Process

1. Push your changes to GitHub
2. Render will automatically deploy both services when changes are pushed to the main branch
3. Monitor the deployment status in the Render dashboard 