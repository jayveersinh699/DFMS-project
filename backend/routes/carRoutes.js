const express = require('express');
const router = express.Router();
const multer = require('multer');
const Car = require('../models/Car');

// Image Upload Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// GET ALL CARS (Used by Admin & Renter)
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ADD A CAR (Used by Driver)
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { brand, name, type, price, pricePerKm, fuel, ownerId, ownerName, carNumber } = req.body;
    const photo = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : '';

    const newCar = new Car({ brand, name, type, price, pricePerKm, fuel, photo, ownerId, ownerName, carNumber });
    await newCar.save();
    res.json(newCar);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE A CAR (Used by Admin)
router.delete('/:id', async (req, res) => {
    try {
        await Car.findByIdAndDelete(req.params.id);
        res.json({ message: "Car Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;