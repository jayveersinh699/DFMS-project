const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car'); 

// CREATE REQUEST
router.post('/request', async (req, res) => {
  try {
    const { carId, dates, distanceKm } = req.body;
    
    // Validate Car exists
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Calculate Price
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
      totalPrice: truePrice,
      status: 'pending' // Ensures it shows up as a request
    });
    
    const savedBooking = await newBooking.save();
    console.log("New Booking Saved:", savedBooking); // Check backend terminal for this!
    
    res.status(201).json(savedBooking);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET OWNER REQUESTS
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const requests = await Booking.find({ ownerId: req.params.ownerId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET RENTER HISTORY
router.get('/renter/:renterId', async (req, res) => {
  const trips = await Booking.find({ renterId: req.params.renterId }).sort({ createdAt: -1 });
  res.json(trips);
});

// UPDATE STATUS
router.put('/:id', async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(booking);
});

module.exports = router;