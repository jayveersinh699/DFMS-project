const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: String,
  text: { type: String, required: true },
}, { timestamps: true }); // Automatically adds 'createdAt' (Time & Date)

module.exports = mongoose.model('Message', messageSchema);