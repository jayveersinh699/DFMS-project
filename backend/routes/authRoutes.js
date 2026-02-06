const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, 'qr-' + Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });
// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (email === 'admin@dfms.com') {
        return res.status(400).json({ message: "Cannot register this email." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ user: newUser, message: "Account created!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// LOGIN (NOW WITH STRICT ROLE CHECK)
router.post('/login', async (req, res) => {
  try {
    // We now extract 'role' from the request too
    const { email, password, role } = req.body;

    // 1. SECURE ADMIN CHECK
    if (email === 'admin@dfms.com' && password === 'admin123') {
        return res.json({
            user: { _id: '000_ADMIN', name: 'System Administrator', email: 'admin@dfms.com', role: 'admin' },
            message: "Welcome, Commander."
        });
    }

    // 2. Normal User Check
    const user = await User.findOne({ email });
    
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. FIX: STRICT ROLE CHECK
    // If the user selects "Rider" but their account is "Driver" (owner), BLOCK THEM.
    if (role && user.role !== role) {
        const correctRole = user.role === 'owner' ? 'Driver' : 'Rider';
        return res.status(403).json({ 
            message: `Wrong Login! This email belongs to a ${correctRole} account.` 
        });
    }

    res.json({ user, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/update-qr/:id', upload.single('qrCode'), async (req, res) => {
    try {
        const qrUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        const user = await User.findByIdAndUpdate(req.params.id, { qrCode: qrUrl }, { new: true });
        res.json({ message: "QR Code Updated", qrCode: user.qrCode });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;