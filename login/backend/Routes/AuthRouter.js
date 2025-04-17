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

// Fetch a single user by ID
router.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch a single photographer by ID
router.get('/photographers/:photographerId', async (req, res) => {
    try {
        const { photographerId } = req.params;
        const photographer = await User.findById(photographerId);
        
        if (!photographer) {
            return res.status(404).json({ message: 'Photographer not found' });
        }
        
        if (photographer.category !== 'photographer') {
            return res.status(400).json({ message: 'User is not a photographer' });
        }
        
        res.status(200).json(photographer);
    } catch (error) {
        console.error('Error fetching photographer by ID:', error);
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

        // Get user data (without password) to send back
        const userData = {
            name: user.name,
            email: user.email
        };

        console.log('Login successful:', { 
            token, 
            userId: user._id, 
            category: user.category,
            userData
        });
        
        res.status(200).json({ 
            token, 
            userId: user._id.toString(), 
            category: user.category,
            userData,
            message: 'Login successful' 
        });
    } catch (error) {
        console.error('Server error during login:', error.message); // Log the exact error message
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Test User Route (for development purposes only)
router.post('/create-test-users', async (req, res) => {
    try {
        console.log('Creating test users for development...');
        
        // Check if test users already exist
        const existingUser = await User.findOne({ email: 'test@example.com' });
        const existingPhotographer = await User.findOne({ email: 'photographer@example.com' });
        
        let createdUsers = [];
        
        // Create test user if it doesn't exist
        if (!existingUser) {
            const testUser = new User({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                category: 'user'
            });
            
            await testUser.save();
            createdUsers.push('test@example.com (user)');
            console.log('Created test user: test@example.com');
        } else {
            console.log('Test user already exists: test@example.com');
        }
        
        // Create test photographer if it doesn't exist
        if (!existingPhotographer) {
            const testPhotographer = new User({
                name: 'Test Photographer',
                email: 'photographer@example.com',
                password: 'password123',
                category: 'photographer'
            });
            
            await testPhotographer.save();
            createdUsers.push('photographer@example.com (photographer)');
            console.log('Created test photographer: photographer@example.com');
        } else {
            console.log('Test photographer already exists: photographer@example.com');
        }
        
        return res.status(200).json({
            message: createdUsers.length > 0 
                ? `Created test users: ${createdUsers.join(', ')}` 
                : 'Test users already exist',
            usersCreated: createdUsers.length
        });
    } catch (error) {
        console.error('Error creating test users:', error.message);
        return res.status(500).json({ message: 'Server error during test user creation' });
    }
});

module.exports = router;