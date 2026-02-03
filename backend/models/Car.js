const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  ownerId: { type: String, required: true },
  ownerName: { type: String, required: true },
  brand: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, default: 'Sedan' },
  fuel: { type: String, default: 'Petrol' },
  price: { type: Number, required: true }, // Driver's Daily Rate
  pricePerKm: { type: Number, required: true, default: 10 }, // Company/Distance Rate
  carNumber: { type: String, required: true },
  photo: { type: String, required: true },
  driverProvided: { type: String, default: 'no' },
  fuelPolicy: { type: String, default: 'excluded' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Car', CarSchema);