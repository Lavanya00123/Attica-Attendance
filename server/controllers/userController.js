// controllers/userController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Employee = require('../models/employee'); // Import the Employee model
// Function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token valid for 1 day
  });
};

exports.registerUser = async (req, res) => {
  const { employeeId, name, mobileNumber, password } = req.body;

  try {
      // Check if user already exists
      const existingUser = await User.findOne({ employeeId });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create a new user
      const newUser = new User({ employeeId, name, mobileNumber, password: hashedPassword });
      await newUser.save();

      // Create a corresponding employee record
      const newEmployee = new Employee({
          employeeId,
          name, // Include the name here
          callLogs: [], // Initialize empty arrays if needed
          messages: [],
          location: {
              latitude: null, // Or some default value
              longitude: null,
              timestamp: null,
          }
      });

      // Save the employee record
      try {
          await newEmployee.save();
          console.log('New employee created:', newEmployee);
      } catch (error) {
          console.error('Error saving employee:', error);
          return res.status(500).json({ error: 'Failed to create employee record' });
      }

      // Generate and return token
      const token = generateToken(newUser._id);
      res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message });
  }
};




// Register a new user
// exports.registerUser = async (req, res) => {
//   const { employeeId, name, mobileNumber, password } = req.body;
  
//   try {
//     const existingUser = await User.findOne({ employeeId });
//     if (existingUser) return res.status(400).json({ message: 'User already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ employeeId, name, mobileNumber, password: hashedPassword });
//     await newUser.save();

//     // Generate and return token
//     const token = generateToken(newUser._id);

//     res.status(201).json({ message: 'User registered successfully', token });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// Login user
exports.loginUser = async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    const user = await User.findOne({ employeeId });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate and return token
    const token = generateToken(user._id);

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


