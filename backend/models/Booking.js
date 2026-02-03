const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  carName: String, // Store snapshot of name in case car is deleted later
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // DATES
  dates: {
    start: String,
    end: String
  },

  // TRIP DETAILS (This was likely missing!)
  distanceKm: { type: Number, default: 0 }, 
  
  // MONEY
  totalPrice: Number,

  // STATUS
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected', 'completed'],
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);