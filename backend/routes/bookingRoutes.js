const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car'); // Import Car model for validation

// 1. CREATE REQUEST (Secure Version - Uses Your Math Logic)
router.post('/request', async (req, res) => {
  try {
    const { carId, dates, distanceKm } = req.body;
    
    // Validate Car exists
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Calculate Price on Server (Secure)
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const validDays = days > 0 ? days : 1;
    
    const driverCost = validDays * car.price;
    const companyCost = (distanceKm || 0) * (car.pricePerKm || 10);
    const truePrice = driverCost + companyCost; 

    // Save to Database
    const newBooking = new Booking({
      ...req.body,
      totalPrice: truePrice, // Overwrite frontend price with secure server price
      status: 'pending'
    });
    
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. SMART FETCH (Combined Renter & Owner - Required for Dashboard)
router.get('/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { renterId: req.params.userId },
        { ownerId: req.params.userId }
      ]
    }).sort({ _id: -1 });
    
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. UPDATE STATUS (Accept/Reject Logic)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        res.json(updatedBooking);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. ADMIN ROUTE
router.get('/all', async (req, res) => {
    const bookings = await Booking.find();
    res.json(bookings);
});

module.exports = router;