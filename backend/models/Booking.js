const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  carId: { type: String, required: true },
  carName: { type: String, required: true },
  renterId: { type: String, required: true },
  ownerId: { type: String, required: true },
  dates: {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);