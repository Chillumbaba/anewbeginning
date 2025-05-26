# A New Beginning

A monorepo containing both frontend and backend services for the A New Beginning application.

## Project Structure

```
.
├── frontend/         # React frontend application
├── backend/         # Express backend application
└── package.json     # Root package.json for monorepo management
```

## Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd anewbeginning
```

2. Install dependencies:
```bash
npm install
```

3. Start development servers:
```bash
npm run dev
```

## Deployment

The application is deployed on Render.com with two services:

### Frontend Service (anewbeginning-frontend)

- URL: https://anewbeginning-frontend.onrender.com
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Start Command: `npm run serve`

Environment Variables:
- `NODE_ENV`: production
- `REACT_APP_API_URL`: https://anewbeginning.onrender.com

### Backend Service (anewbeginning-backend)

- URL: https://anewbeginning.onrender.com
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `node dist/index.js`

Environment Variables:
- `JWT_SECRET`: [secure secret]
- `MONGODB_URI`: [MongoDB connection string]
- `NODE_ENV`: production
- `PORT`: 10000

## Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run start:frontend` - Start frontend development server
- `npm run start:backend` - Start backend development server
- `npm run build:frontend` - Build frontend for production
- `npm run build:backend` - Build backend for production
- `npm run serve:frontend` - Serve frontend production build

## Contributing

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git add .
git commit -m "Description of your changes"
```

3. Push to your branch:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request on GitHub

## Environment Setup

### Frontend (.env.production)
```
REACT_APP_API_URL=https://anewbeginning.onrender.com
```

### Backend (.env.production)
```
JWT_SECRET=<secure-secret>
MONGODB_URI=<mongodb-connection-string>
NODE_ENV=production
PORT=10000
```

Note: Environment variables should be configured in Render.com's service settings and not committed to the repository. 