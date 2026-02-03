const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CONNECT TO MONGO (Fixed: Removed crashing options)
mongoose.connect('mongodb://127.0.0.1:27017/dfms')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// ROUTES
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

app.listen(5000, () => console.log('Server running on port 5000'));