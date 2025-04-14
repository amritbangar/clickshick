const express = require('express');
const router = express.Router();
const User = require('../Models/User'); // Import the User model
const jwt = require('jsonwebtoken');

// Fetch All Users Route
router.get('/users', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users from the database
        res.status(200).json(users); // Return the list of users
    } catch (error) {
        console.error('Error fetching users:', error.message); // Log the exact error message
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user.toObject();
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all photographers
router.get('/photographers', async (req, res) => {
    try {
        const photographers = await User.find({ category: 'photographer' });
        
        // Map to remove passwords and add default fields
        const formattedPhotographers = photographers.map(photographer => {
            const { password, ...photographerData } = photographer.toObject();
            
            // Add default fields if they don't exist
            return {
                ...photographerData,
                specialization: photographerData.specialization || 'General Photography',
                experience: photographerData.experience || '2+ years',
                rating: photographerData.rating || 4.5,
                priceRange: photographerData.priceRange || '₹20,000 - ₹40,000',
                location: photographerData.location || 'India',
                portfolio: photographerData.portfolio || '#',
                imageUrl: photographerData.imageUrl || 'https://randomuser.me/api/portraits/men/32.jpg'
            };
        });
        
        res.status(200).json(formattedPhotographers);
    } catch (error) {
        console.error('Error fetching photographers:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Sign Up Route
router.post('/signup', async (req, res) => {
    const { name, email, password, category } = req.body;

    try {
        console.log('Signup request received:', req.body);

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Create a new user
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password, // In a production app, you should hash this password
            category
        });

        // Save the user to database
        await newUser.save();
        console.log('New user created:', { name, email, category });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Server error during signup:', error.message);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Log In Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login request received:', req.body);

        // Convert email to lowercase for case-insensitive lookup
        const user = await User.findOne({ email: email.toLowerCase() });
        console.log('User found in database:', user);

        if (!user) {
            console.log('User not found for email:', email);
            return res.status(400).json({ message: 'User not found' });
        }

        // Compare the provided password with the stored password
        if (user.password !== password) {
            console.log('Invalid credentials for email:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user._id, category: user.category },
            process.env.JWT_SECRET || 'your-secret-key', // Use default if JWT_SECRET is not defined
            { expiresIn: '1h' }
        );

        console.log('Login successful:', { token, userId: user._id, category: user.category });
        res.status(200).json({ token, userId: user._id, category: user.category });
    } catch (error) {
        console.error('Server error during login:', error.message); // Log the exact error message
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;