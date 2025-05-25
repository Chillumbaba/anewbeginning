# A New Beginning

A simple web application that allows users to save text entries to a MongoDB database. Built with React frontend and Node.js backend.

## Project Structure
- `client/` - React frontend application
- `server/` - Node.js backend server

## Local Development Setup

1. Install dependencies:
```bash
npm run install:all
```

2. Create a `.env` file in the server directory with your environment variables:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

3. Start the development servers:
```bash
npm start
```

## Deployment on Render

### Backend Service
1. Create a new Web Service on Render
2. Connect to your GitHub repository
3. Use the following settings:
   - Build Command: `./build.sh`
   - Start Command: `cd server && npm start`
   - Environment Variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: Your JWT secret
     - `NODE_ENV`: production
     - `PORT`: 5000

### Frontend
The frontend will be built and served by the backend service. No separate frontend service is needed.

## Environment Variables
The following environment variables are required:

### Server
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Set to 'production' in production environment

### Client (Production)
The frontend will automatically use the correct API URL based on the environment. 