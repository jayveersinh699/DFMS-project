const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, 'car-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// ADD CAR
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const photoUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : 'https://placehold.co/600x400';
    const newCar = await new Car({ ...req.body, photo: photoUrl }).save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET ALL CARS
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE CAR
router.delete('/:id', async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: "Car deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;