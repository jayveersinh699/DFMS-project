const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// 1. SEND A MESSAGE
router.post('/', async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET MESSAGES FOR A SPECIFIC TRIP
router.get('/:bookingId', async (req, res) => {
  try {
    const messages = await Message.find({ 
      bookingId: req.params.bookingId 
    }).sort({ createdAt: 1 }); // Oldest first (like WhatsApp)
    res.json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;