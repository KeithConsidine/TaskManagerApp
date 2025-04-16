const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    // Validate request exists
    if (!req.body) {
      return res.status(400).json({ msg: 'No request body received' });
    }

    const { name, email, password } = req.body;
    
    // Validate all fields exist and are strings
    if (!name || !email || !password || 
        typeof name !== 'string' || 
        typeof email !== 'string' || 
        typeof password !== 'string') {
      return res.status(400).json({ msg: 'All fields must be valid strings' });
    }

    // Normalize and validate email
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ msg: 'Password must be at least 8 characters' });
    }

    // Check for existing user 
    let existing;
    try {
      existing = await User.findOne({ email: normalizedEmail }).maxTimeMS(5000);
    } catch (dbErr) {
      console.error('Database query failed:', dbErr);
      return res.status(503).json({ msg: 'Service unavailable' });
    }

    if (existing) {
      return res.status(400).json({ msg: 'Email already in use' });
    }

    // Hash password 
    let hashed;
    try {
      hashed = await bcrypt.hash(password, 10);
    } catch (hashErr) {
      console.error('Password hashing failed:', hashErr);
      return res.status(500).json({ msg: 'Registration failed' });
    }

    // Create user with timeout
    let user;
    try {
      user = await User.create({ 
        name: name.trim(),
        email: normalizedEmail,
        password: hashed
      });
    } catch (createErr) {
      console.error('User creation failed:', createErr);
      return res.status(500).json({ 
        msg: 'Registration failed',
        error: createErr.message
      });
    }

    const responseUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    return res.status(201).json({ user: responseUser });

  } catch (err) {
    console.error('UNEXPECTED REGISTRATION ERROR:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      rawError: err
    });
    
    return res.status(500).json({ 
      msg: 'Unexpected registration error',
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message
      })
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate the input data
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

    res.json({ user });
  } catch (err) {
    console.error('Error during login:', err);  
    res.status(500).json({ msg: 'Error logging in' });
  }
};
