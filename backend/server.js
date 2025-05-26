const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const gridRoutes = require('./routes/gridRoutes');
const textRoutes = require('./routes/textRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = 'mongodb+srv://KP:myvibingpassword1@cluster0.p65cujw.mongodb.net/anewbeginning?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
.then(() => console.log('Successfully connected to MongoDB Atlas'))
.catch(err => {
  console.error('MongoDB Atlas connection error:', err);
  process.exit(1);
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Task Tracker API' });
});

// Routes
app.use('/api', gridRoutes);
app.use('/api', textRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 