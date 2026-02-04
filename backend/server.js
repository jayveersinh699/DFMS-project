const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
                 // <--- ADD THIS
const app = express();
app.use(express.json());
app.use(cors());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CONNECT TO MONGO
mongoose.connect('mongodb://127.0.0.1:27017/dfms')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// ROUTES
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // NEW: ADMIN ROUTE

// NEW: Quick route for Admin to see all bookings
app.use('/api/bookings/all', async (req, res) => {
    const bookings = await require('./models/Booking').find();
    res.json(bookings);
});

app.listen(5000, () => console.log('Server running on port 5000'));
const chatRoutes = require('./routes/chatRoutes'); // <--- ADD THIS
app.use('/api/chat', chatRoutes);                  // <--- ADD THIS