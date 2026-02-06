const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  carName: String,
  renterId: { type: String, required: true },
  ownerId: { type: String, required: true },
  dates: { start: String, end: String },
  distanceKm: Number,
  totalPrice: Number,
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected', 'ongoing', 'completed'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['unpaid', 'escrow', 'paid_to_driver'], 
    default: 'unpaid' 
  },
  otp: { type: String }, // Used for trip completion handshake
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);