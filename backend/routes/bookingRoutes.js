const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car');

// 1. ADMIN ROUTE (Must be first)
router.get('/all', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. CREATE REQUEST (The Fix is Here)
router.post('/request', async (req, res) => {
  try {
    const { carId, dates, distanceKm } = req.body;
    
    // A. Find the Car to get the Real Owner
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // B. Calculate Price
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const validDays = days > 0 ? days : 1;
    
    const driverCost = validDays * car.price;
    const companyCost = (distanceKm || 0) * (car.pricePerKm || 10);
    const truePrice = driverCost + companyCost; 

    // C. Create Booking with OWNER ID attached
    const newBooking = new Booking({
      ...req.body,
      ownerId: car.ownerId, // <--- CRITICAL FIX: Links request to Driver
      ownerName: car.ownerName,
      carName: `${car.brand} ${car.name}`,
      totalPrice: truePrice,
      status: 'pending'
    });
    
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET USER/DRIVER BOOKINGS
router.get('/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { renterId: req.params.userId },
        { ownerId: req.params.userId } // This will now work because we saved it above
      ]
    }).sort({ _id: -1 });
    
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. UPDATE STATUS
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

module.exports = router;