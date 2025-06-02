const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, voterID, password } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { voterID }] });
    
    if (user) {
      return res.status(400).json({ 
        message: 'User with this email or voter ID already exists' 
      });
    }
    
    // Create new user
    user = new User({
      fullName,
      email,
      voterID,
      password
    });
    
    await user.save();
    
    // TODO: In a production environment, send verification email here
    
    res.status(201).json({ 
      message: 'Registration successful! Please check your email to verify your account.' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { voterID, password } = req.body;
    
    // Find user
    const user = await User.findOne({ voterID });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is verified
    if (!user.isVerified && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }
    
    // Generate JWT token with role information
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        voterID: user.voterID 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    // Return user data with role information
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        voterID: user.voterID,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

module.exports = router;
