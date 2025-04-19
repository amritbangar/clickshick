// UserDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotographerPopup from './PhotographerPopup';
import axios from 'axios';

const UserDashboard = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [photographers, setPhotographers] = useState([]);
    const [activeTab, setActiveTab] = useState('bookings');
    const [user, setUser] = useState(null);
    const [favoritePhotographers, setFavoritePhotographers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [alertMessage, setAlertMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
            navigate('/login');
            return;
        }

        // Set auth header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user details
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const response = await axios.get(`http://localhost:8080/api/auth/users/${userId}`);
                setUser(response.data);
                
                // Save the user's name to localStorage for use in bookings
                if (response.data && response.data.name) {
                    localStorage.setItem('userName', response.data.name);
                    console.log(`User name saved to localStorage: ${response.data.name}`);
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                // If there's an error, try a simpler approach - show basic user info
                setUser({ name: localStorage.getItem('userName') || 'User' });
            }
        };

        fetchUserData();
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Get user ID from localStorage
            const userId = localStorage.getItem('userId');
            
            if (!userId) {
                throw new Error('User ID not found');
            }
            
            try {
                // Try to fetch bookings from API - filter by current user
                const bookingsResponse = await axios.get(`http://localhost:8080/api/bookings?userId=${userId}`);
                console.log('Fetched bookings:', bookingsResponse.data);
                
                if (Array.isArray(bookingsResponse.data)) {
                    // Transform booking data to match expected format
                    const formattedBookings = bookingsResponse.data.map(booking => ({
                        id: booking._id,
                        photographyType: booking.photographyType || 'General Photography',
                        date: booking.date || 'Not specified',
                        location: booking.location || 'Not specified',
                        status: booking.status || 'Pending',
                        photographer: booking.photographer || 'Not assigned',
                        photographerRating: booking.photographerRating || 4.5,
                        price: booking.budgetRange || 'To be confirmed',
                        package: booking.package || 'Standard'
                    }));
                    
                    setBookings(formattedBookings);
                } else {
                    // Generate mock booking data
                    console.log('No bookings found, using mock data');
                    setBookings(generateMockBookings());
                }
            } catch (error) {
                console.error('Failed to fetch bookings, using mock data:', error);
                // Create mock booking data
                setBookings(generateMockBookings());
            }
            
            try {
                // Try to fetch photographers from API
                const photographersResponse = await axios.get('http://localhost:8080/api/auth/photographers');
                
                if (Array.isArray(photographersResponse.data)) {
                    // Transform photographer data if needed
                    const formattedPhotographers = photographersResponse.data.map((photographer, index) => {
                        // Use a different local image for each photographer, cycling through our 3 images
                        const imageIndex = (index % 3) + 1;
                        const localImage = require(`../image/photo${imageIndex}.jpg`);
                        
                        return {
                            id: photographer._id,
                            name: photographer.name || 'Unknown',
                            specialization1: photographer.specialization || 'General',
                            specialization2: photographer.secondarySpecialization,
                            experience: photographer.experience || '2+ years',
                            rating: photographer.rating || 4.5,
                            priceRange: photographer.priceRange || '₹20,000 - ₹40,000',
                            location: photographer.location || 'Unknown',
                            portfolio: photographer.portfolio || '#',
                            profileImage: localImage, // Always use local image
                            bio: photographer.bio || 'Professional photographer with experience in various photography styles.'
                        };
                    });
                    
                    setPhotographers(formattedPhotographers);
                } else {
                    // If no photographers found, use mock data
                    setPhotographers(generateMockPhotographers());
                }
            } catch (error) {
                console.error('Failed to fetch photographers, using mock data:', error);
                setPhotographers(generateMockPhotographers());
            }
        } catch (error) {
            console.error('Failed to fetch data from API:', error);
            setBookings(generateMockBookings());
            setPhotographers(generateMockPhotographers());
        } finally {
            setLoading(false);
        }
    };

    // Function to generate mock booking data
    const generateMockBookings = () => {
        // Get the photographers first
        const mockPhotographers = generateMockPhotographers();
        const firstPhotographer = mockPhotographers[0]; // Rahul Sharma
        
        return [
            {
                id: '1',
                photographyType: 'Wedding Photography',
                date: '2024-05-15',
                location: 'New Delhi',
                status: 'Confirmed',
                photographer: firstPhotographer.name, // Use Rahul Sharma's name
                photographerRating: firstPhotographer.rating, // Use his actual rating
                price: '₹45,000',
                package: 'Premium'
            },
            {
                id: '2',
                photographyType: 'Portrait Photography',
                date: '2024-06-10',
                location: 'Mumbai',
                status: 'Pending',
                photographer: 'Not assigned',
                photographerRating: 0,
                price: '₹15,000',
                package: 'Standard'
            }
        ];
    };

    // Function to generate mock photographer data
    const generateMockPhotographers = () => {
        return [
            {
                id: '1',
                name: 'Rahul Sharma',
                specialization1: 'Wedding Photography',
                specialization2: 'Portrait',
                experience: '8+ years',
                rating: 4.9,
                priceRange: '₹30,000 - ₹50,000',
                location: 'New Delhi',
                portfolio: '#',
                profileImage: require('../image/photo1.jpg'),
                bio: 'Award-winning photographer with over 8 years of experience specializing in premium wedding photography and capturing life\'s most precious moments.'
            },
            {
                id: '2',
                name: 'Priya Patel',
                specialization1: 'Fashion',
                specialization2: 'Corporate',
                experience: '6+ years',
                rating: 4.8,
                priceRange: '₹25,000 - ₹45,000',
                location: 'Mumbai',
                portfolio: '#',
                profileImage: require('../image/photo2.jpg'),
                bio: 'Specializing in high-end fashion and commercial photography with a unique contemporary style that has been featured in leading magazines.'
            },
            {
                id: '3',
                name: 'Aryan Singh',
                specialization1: 'Wildlife',
                specialization2: 'Nature',
                experience: '7+ years',
                rating: 4.7,
                priceRange: '₹20,000 - ₹40,000',
                location: 'Bangalore',
                portfolio: '#',
                profileImage: require('../image/photo3.jpg'),
                bio: 'National Geographic contributor specializing in wildlife and nature photography with a focus on conservation and environmental storytelling.'
            }
        ];
    };

    const handlePopupSubmit = async (formData) => {
        try {
            console.log("Form data received in UserDashboard:", formData);
            
            // Make sure we have the pin code - log it to help with debugging
            if (formData.pinCode) {
                console.log(`Booking has pin code: ${formData.pinCode}`);
            } else {
                console.warn("Warning: Booking doesn't have a PIN code!");
                setAlertMessage({
                    type: 'warning',
                    title: 'Missing PIN Code',
                    message: 'Your booking does not have a PIN code. Photographers may not be able to find it.'
                });
                return; // Prevent submission without pin code
            }
            
            // Validate contact number
            if (!formData.contactNumber || formData.contactNumber.length !== 10) {
                console.warn("Warning: Invalid contact number!");
                setAlertMessage({
                    type: 'warning',
                    title: 'Invalid Contact Number',
                    message: 'Please provide a valid 10-digit contact number.'
                });
                return; // Prevent submission without valid contact number
            }
            
            // Get the user ID and user data from localStorage or state
            const userId = localStorage.getItem('userId');
            const userName = user?.name || localStorage.getItem('userName') || 'Anonymous User';
            
            // Get user contact information from state or form data
            const contactInfo = {
                email: user?.email || localStorage.getItem('userEmail') || 'Not provided',
                phone: formData.contactNumber || 'Not provided'
            };
            
            // Add user ID, name, and contact info to the booking data
            const bookingData = {
                ...formData,
                userId,
                userName,
                userContactEmail: contactInfo.email,
                userContactPhone: contactInfo.phone,
                status: 'Pending',
                createdAt: new Date().toISOString()
            };
            
            console.log("Sending booking data to API with user:", userName);
            console.log("Full booking data:", bookingData);
            
            // Post to API
            const response = await axios.post('http://localhost:8080/api/bookings', bookingData);
            
            if (response.status === 201) {
                console.log("Booking saved successfully!", response.data);
                
                // Save the pin code to localStorage for future use
                if (formData.pinCode) {
                    localStorage.setItem('lastUsedPinCode', formData.pinCode);
                }
                
                // Show success alert message instead of using window.alert
                setAlertMessage({
                    type: 'success',
                    title: 'Booking Saved!',
                    message: 'Your booking request has been submitted successfully and photographers in your area will be notified.'
                });
                
                // Auto-hide alert after 5 seconds
                setTimeout(() => {
                    setAlertMessage(null);
                }, 5000);
                
                fetchData(); // Refresh bookings after new booking
            } else {
                console.error("Unexpected response status:", response.status);
                setAlertMessage({
                    type: 'danger',
                    title: 'Booking Failed',
                    message: 'Failed to save booking. Please try again.'
                });
            }
        } catch (error) {
            console.error('Error saving booking:', error.response?.data || error.message);
            setAlertMessage({
                type: 'danger',
                title: 'Booking Failed',
                message: 'Failed to save booking. Please try again.'
            });
        } finally {
            setShowPopup(false); // Close the popup after submission
        }
    };

    const handleOpenPopup = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleLogout = () => {
        // Clear any authentication tokens or session data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userCategory');
        navigate('/login'); // Redirect to the login page
    };

    // Function to determine status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return '#28a745'; // green
            case 'pending':
                return '#ffc107'; // yellow
            case 'completed':
                return '#17a2b8'; // blue
            case 'cancelled':
                return '#dc3545'; // red
            default:
                return '#6c757d'; // gray
        }
    };

    // Function to render star rating
    const renderStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<i key={`full-${i}`} className="fas fa-star text-warning"></i>);
        }
        
        if (halfStar) {
            stars.push(<i key="half" className="fas fa-star-half-alt text-warning"></i>);
        }
        
        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<i key={`empty-${i}`} className="far fa-star text-warning"></i>);
        }
        
        return stars;
    };

    // Toggle favorite photographer
    const toggleFavorite = async (photographerId) => {
        try {
            const isFavorite = favoritePhotographers.some(p => p.id === photographerId);
            
            if (isFavorite) {
                // Remove from favorites
                await axios.delete(`http://localhost:8080/api/users/favorites/${photographerId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setFavoritePhotographers(favoritePhotographers.filter(p => p.id !== photographerId));
            } else {
                // Find the photographer from our list
                const photographer = photographers.find(p => p.id === photographerId);
                
                // Instead of waiting for API, add directly to state for immediate feedback
                const favoritePhotographer = {
                    ...photographer,
                    // Ensure we're using a local image
                    profileImage: photographer.id === '1' ? require('../image/photo1.jpg') :
                                  photographer.id === '2' ? require('../image/photo2.jpg') :
                                  require('../image/photo3.jpg')
                };
                
                // Also try to save to API if available
                try {
                    await axios.post(
                        'http://localhost:8080/api/users/favorites',
                        { photographerId },
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
                } catch (apiError) {
                    console.error("API error when saving favorite:", apiError);
                    // Continue with local state update even if API fails
                }
                
                setFavoritePhotographers([...favoritePhotographers, favoritePhotographer]);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            alert("Failed to update favorites. Please try again.");
        }
    };

    // Book a specific photographer
    const bookPhotographer = (photographer) => {
        setShowPopup(true);
    };

    // Add an immediate notification to test the UI without showing alerts
    useEffect(() => {
        // Get actual photographers to use in notifications
        const actualPhotographers = generateMockPhotographers();
        const rahulSharma = actualPhotographers[0]; // This will be Rahul Sharma based on the mock data
        
        // Initialize with mock notification data for development
        const mockNotifications = [
            {
                _id: '1',
                message: `Your booking has been accepted by ${rahulSharma.name}. Your session is now confirmed!`,
                createdAt: new Date().toISOString(),
                isRead: false,
                type: 'booking_accepted',
                bookingId: '1', // Match with first booking id in mock data
                photographerId: rahulSharma.id,
                photographerName: rahulSharma.name
            },
            {
                _id: '2',
                message: 'New photography portfolio added by Priya Patel that matches your interests.',
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                isRead: true,
                type: 'new_portfolio'
            },
            {
                _id: '3',
                message: 'Your booking request for Portrait Photography has been received.',
                createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                isRead: true,
                type: 'booking_received'
            }
        ];
        
        // We don't need to modify the bookings here since they'll be set 
        // with the correct photographer name from generateMockBookings

        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(notif => !notif.isRead).length);
        
        // Process the unread notification but DO NOT show alert
        const unreadNotification = mockNotifications.find(notif => !notif.isRead);
        if (unreadNotification) {
            // Update booking status without showing alert
            showNotificationAlert(unreadNotification);
        }

        // Add a mock favorite photographer
        const mockFavorite = {
            id: '2',
            name: 'Priya Patel',
            specialization1: 'Fashion',
            specialization2: 'Corporate',
            experience: '6+ years',
            rating: 4.8,
            priceRange: '₹25,000 - ₹45,000',
            location: 'Mumbai',
            portfolio: '#',
            profileImage: require('../image/photo2.jpg'),
            bio: 'Specializing in high-end fashion and commercial photography with a unique contemporary style that has been featured in leading magazines.'
        };
        setFavoritePhotographers([mockFavorite]);

        // Setup polling for new notifications (after initial mock data is set)
        const notificationInterval = setInterval(() => {
            fetchNotifications();
        }, 30000); // Check every 30 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(notificationInterval);
    }, []); // Only run once on component mount

    // Toggle notification dropdown
    const toggleNotifications = () => {
        // If we're opening the dropdown, make sure we have notifications to show
        if (!showNotifications) {
            fetchNotifications();
        }
        setShowNotifications(!showNotifications);
    };

    // Modified fetchNotifications to remove automatic alerts
    const fetchNotifications = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;
            
            try {
                // Attempt to fetch from API
                const response = await axios.get(`http://localhost:8080/api/notifications?userId=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    timeout: 3000 // Set a 3 second timeout to fail fast when server is down
                });
                
                if (Array.isArray(response.data) && response.data.length > 0) {
                    // Check if we have new notifications
                    const currentNotifications = notifications;
                    const newNotifications = response.data;
                    
                    // Find any new unread notifications that weren't in our previous list
                    const brandNewNotifications = newNotifications.filter(
                        newNotif => !newNotif.isRead && 
                        !currentNotifications.some(oldNotif => oldNotif._id === newNotif._id)
                    );
                    
                    // Update notifications state
                    setNotifications(newNotifications);
                    setUnreadCount(newNotifications.filter(notif => !notif.isRead).length);
                    
                    // Process new notifications for booking status updates, but DON'T show alerts
                    if (brandNewNotifications.length > 0) {
                        console.log("New notifications received:", brandNewNotifications);
                        
                        // Process booking accepted notification first if it exists
                        const acceptedNotification = brandNewNotifications.find(
                            notif => notif.type === 'booking_accepted'
                        );
                        
                        if (acceptedNotification) {
                            showNotificationAlert(acceptedNotification);
                        } else if (brandNewNotifications.length > 0) {
                            // Otherwise process the first new notification
                            showNotificationAlert(brandNewNotifications[0]);
                        }
                        
                        // Refresh bookings to get latest status
                        fetchData();
                    }
                } else if (process.env.NODE_ENV === 'development') {
                    // For development: simulate a new booking acceptance notification every 2 minutes
                    // This ensures we can test the notification UI even without a backend
                    const now = new Date();
                    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago
                    const lastNotificationTime = localStorage.getItem('lastNotificationTime');
                    
                    if (!lastNotificationTime || new Date(lastNotificationTime) < twoMinutesAgo) {
                        // Get a booking that's in pending status to simulate it being accepted
                        const pendingBooking = bookings.find(b => b.status?.toLowerCase() === 'pending');
                        
                        if (pendingBooking) {
                            // Try to find a real photographer from our list
                            const availablePhotographers = photographers.length > 0 ? 
                                photographers : generateMockPhotographers();
                            
                            // Select a random photographer from our photographers list
                            const randomPhotographer = availablePhotographers[
                                Math.floor(Math.random() * availablePhotographers.length)
                            ];
                            
                            const photographerName = randomPhotographer.name;
                            
                            const mockAcceptedNotification = {
                                _id: 'mock-' + Date.now(),
                                message: `Your booking has been accepted by ${photographerName}. Your session is now confirmed!`,
                                createdAt: new Date().toISOString(),
                                isRead: false,
                                type: 'booking_accepted',
                                bookingId: pendingBooking.id || pendingBooking._id,
                                photographerId: randomPhotographer.id || randomPhotographer._id,
                                photographerName: photographerName
                            };
                            
                            const updatedNotifications = [mockAcceptedNotification, ...notifications];
                            setNotifications(updatedNotifications);
                            setUnreadCount(updatedNotifications.filter(notif => !notif.isRead).length);
                            
                            // Process the notification but don't show alert
                            showNotificationAlert(mockAcceptedNotification);
                            
                            // Store the time we showed this notification
                            localStorage.setItem('lastNotificationTime', now.toISOString());
                        }
                    }
                }
            } catch (error) {
                // Only log detailed errors during development, not in production
                if (process.env.NODE_ENV === 'development') {
                    console.error('Failed to fetch notifications from API:', error);
                }
            }
        } catch (error) {
            console.error('Failed to process notifications:', error);
        }
    };

    // Function to show notification alert
    const showNotificationAlert = (notification) => {
        console.log("Processing notification:", notification);
        
        // Only update the booking status, DON'T show alert messages automatically
        if (notification.type === 'booking_accepted') {
            // Get photographer name directly from notification if available,
            // otherwise extract it from the message
            let photographerName = notification.photographerName;
            
            if (!photographerName) {
                const messageRegex = /Your booking has been accepted by (.+?)\./;
                const match = notification.message.match(messageRegex);
                photographerName = match ? match[1] : 'Unknown';
            }
            
            // Try to find the photographer in our list to get their rating
            let photographerRating = 4.8; // Default rating
            const matchedPhotographer = photographers.find(p => 
                p.name === photographerName || p.id === notification.photographerId
            );
            
            if (matchedPhotographer) {
                photographerRating = matchedPhotographer.rating;
            }
            
            // Update the corresponding booking status and photographer
            if (notification.bookingId) {
                const updatedBookings = bookings.map(booking => {
                    // Check if this is the booking that was accepted
                    if (booking.id === notification.bookingId || booking._id === notification.bookingId) {
                        console.log(`Updating booking ${booking.id} status to Confirmed with photographer ${photographerName}`);
                        return { 
                            ...booking, 
                            status: 'Confirmed', 
                            photographer: photographerName,
                            photographerRating: photographerRating
                        };
                    }
                    return booking;
                });
                
                // Update state with the modified bookings
                console.log("Updated bookings:", updatedBookings);
                setBookings(updatedBookings);
                
                // Force a refresh to re-fetch data from server if possible
                setTimeout(fetchData, 1000);
            }
        } else if (notification.type === 'booking_rejected') {
            // Update the corresponding booking status
            if (notification.bookingId) {
                const updatedBookings = bookings.map(booking => 
                    booking.id === notification.bookingId || booking._id === notification.bookingId ? 
                    { ...booking, status: 'Cancelled' } : booking
                );
                setBookings(updatedBookings);
                
                // Force a refresh to re-fetch data from server if possible
                setTimeout(fetchData, 1000);
            }
        }
        
        // REMOVED: No longer automatically showing alert messages here
    };

    // Mark notification as read - Modified to show alerts when clicked
    const markAsRead = async (notificationId) => {
        try {
            // Find the notification that was clicked
            const notification = notifications.find(notif => notif._id === notificationId);
            
            // Show alert for the clicked notification
            if (notification) {
                if (notification.type === 'booking_accepted') {
                    setAlertMessage({
                        type: 'success',
                        title: 'Booking Accepted!',
                        message: notification.message
                    });
                } else if (notification.type === 'booking_rejected') {
                    setAlertMessage({
                        type: 'danger',
                        title: 'Booking Declined',
                        message: notification.message
                    });
                } else {
                    setAlertMessage({
                        type: 'info',
                        title: 'Notification',
                        message: notification.message
                    });
                }
                
                // Auto-hide alert after 5 seconds
                setTimeout(() => {
                    setAlertMessage(null);
                }, 5000);
            }

            await axios.put(`http://localhost:8080/api/notifications/${notificationId}`, 
                { isRead: true },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            // Update notification in state
            const updatedNotifications = notifications.map(notif => 
                notif._id === notificationId ? { ...notif, isRead: true } : notif
            );
            
            setNotifications(updatedNotifications);
            setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;
            
            await axios.put(`http://localhost:8080/api/notifications/read-all/${userId}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            // Update all notifications in state
            const updatedNotifications = notifications.map(notif => ({ ...notif, isRead: true }));
            setNotifications(updatedNotifications);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    // Modified refreshBookings function to also fetch notifications
    const refreshBookings = async () => {
        await fetchData();
        await fetchNotifications();
    };

    return (
        <div className="dashboard-container" style={{ 
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            backgroundColor: 'var(--primary-color)'
        }}>
            {/* Top Navigation Bar */}
            <div style={{
                backgroundColor: 'var(--primary-color)',
                color: 'var(--accent-color-2)',
                padding: '15px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                        <i className="fas fa-camera" style={{ marginRight: '10px' }}></i>
                        clickshick.com
                    </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Add Book Session Button */}
                  <button 
                        onClick={handleOpenPopup}
                    style={{ 
                            backgroundColor: 'var(--accent-color-1)',
                            color: 'var(--primary-color)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            marginRight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="fas fa-calendar-plus" style={{ marginRight: '8px' }}></i>
                        Book Session
                    </button>
                    
                    {/* Notifications icon */}
                    <div style={{ position: 'relative', marginRight: '20px', cursor: 'pointer' }} onClick={toggleNotifications}>
                        <i className="fas fa-bell" style={{ fontSize: '1.4rem' }}></i>
                    {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                backgroundColor: 'var(--accent-color-1)',
                                color: 'var(--primary-color)',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                            }}>
                        {unreadCount}
                      </span>
                    )}
                </div>

                    {/* User info with dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-color-1)',
                            color: 'var(--primary-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '10px',
                            fontWeight: 'bold'
                        }}>
                            {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
                        <span style={{ fontWeight: 'bold' }}>
                            {user ? user.name : 'User'}
                        </span>
                        <i className="fas fa-chevron-down" style={{ marginLeft: '8px', fontSize: '0.8rem' }}></i>
                    </div>
                </div>
            </div>
            
            {/* Main content area */}
            <div style={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
                {/* Sidebar */}
                <div style={{
                    width: '250px',
                    backgroundColor: '#5C90A3',
                    padding: '20px 0',
                    color: '#FFFFFF'
                }}>
                    <div style={{ 
                        margin: '0 20px 20px 20px', 
                        borderBottom: '1px solid rgba(255,255,255,0.2)',
                        padding: '0 0 16px 0',
                    }}>
                        <h3 style={{ 
                            margin: '0 0 8px 0', 
                            fontSize: '1.3rem', 
                            color: '#FFFFFF', 
                            fontWeight: 'bold',
                            letterSpacing: '0.5px'
                        }}>User Dashboard</h3>
                        <p style={{ 
                            margin: 0, 
                            fontSize: '0.9rem', 
                            color: '#FFFFFF',
                            opacity: 0.9
                        }}>Manage your photo sessions</p>
                    </div>
                    
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{
                            padding: '12px 20px',
                            backgroundColor: activeTab === 'bookings' ? 'rgba(255,255,255,0.15)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                            color: '#FFFFFF',
                            fontWeight: activeTab === 'bookings' ? 'bold' : 'normal',
                            borderLeft: activeTab === 'bookings' ? '4px solid #FFFFFF' : '4px solid transparent',
                        }} onClick={() => setActiveTab('bookings')}>
                            <i className="fas fa-calendar-alt" style={{ marginRight: '10px', width: '20px', textAlign: 'center', color: '#FFFFFF' }}></i>
                            My Bookings
                        </li>
                        <li style={{
                            padding: '12px 20px',
                            backgroundColor: activeTab === 'photographers' ? 'rgba(255,255,255,0.15)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                            color: '#FFFFFF',
                            fontWeight: activeTab === 'photographers' ? 'bold' : 'normal',
                            borderLeft: activeTab === 'photographers' ? '4px solid #FFFFFF' : '4px solid transparent',
                        }} onClick={() => setActiveTab('photographers')}>
                            <i className="fas fa-camera" style={{ marginRight: '10px', width: '20px', textAlign: 'center', color: '#FFFFFF' }}></i>
                            Find Photographers
                        </li>
                        <li style={{
                            padding: '12px 20px',
                            backgroundColor: activeTab === 'favorites' ? 'rgba(255,255,255,0.15)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                            color: '#FFFFFF',
                            fontWeight: activeTab === 'favorites' ? 'bold' : 'normal',
                            borderLeft: activeTab === 'favorites' ? '4px solid #FFFFFF' : '4px solid transparent',
                        }} onClick={() => setActiveTab('favorites')}>
                            <i className="fas fa-heart" style={{ marginRight: '10px', width: '20px', textAlign: 'center', color: '#FFFFFF' }}></i>
                            Favorites
                        </li>
                        <li style={{
                            padding: '12px 20px',
                            marginTop: '20px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                            color: '#FFFFFF',
                            fontWeight: 'normal',
                            backgroundColor: 'transparent',
                            borderTop: '1px solid rgba(255,255,255,0.2)',
                        }} onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt" style={{ marginRight: '10px', width: '20px', textAlign: 'center', color: '#FFFFFF' }}></i>
                            Logout
                        </li>
                    </ul>
                </div>

            {/* Notification Alert */}
            {alertMessage && (
                <div className={`alert alert-${alertMessage.type} alert-dismissible fade show m-3`} role="alert">
                    <strong>{alertMessage.title}</strong> {alertMessage.message}
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setAlertMessage(null)}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            )}

            {/* Notification Dropdown */}
            {showNotifications && (
                <div className="container position-relative">
                    <div className="notification-dropdown bg-white shadow-lg p-3" 
                        style={{ 
                            position: 'absolute', 
                            right: '15px',
                            top: '0',
                            width: '350px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            borderRadius: '8px'
                        }}>
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                            <h6 className="mb-0 font-weight-bold">Notifications</h6>
                            {unreadCount > 0 && (
                                <button 
                                    className="btn btn-sm btn-link p-0 text-muted" 
                                    onClick={markAllAsRead}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                        
                        {notifications && notifications.length > 0 ? (
                            notifications.map((notification, index) => (
                                <div 
                                    key={index} 
                                    className={`notification-item p-2 mb-2 rounded ${!notification.isRead ? 'bg-light' : ''}`}
                                    onClick={() => markAsRead(notification._id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex">
                                        <div className="me-3">
                                            {notification.type === 'booking_accepted' ? (
                                                <i className="fas fa-check-circle text-success fa-lg"></i>
                                            ) : notification.type === 'booking_rejected' ? (
                                                <i className="fas fa-times-circle text-danger fa-lg"></i>
                                            ) : (
                                                <i className="fas fa-info-circle text-primary fa-lg"></i>
                                            )}
                                        </div>
        <div>
                                            <p className="mb-1">{notification.message}</p>
                                            <small className="text-muted d-block">{new Date(notification.createdAt).toLocaleString()}</small>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted my-3">No notifications yet</p>
                        )}
                    </div>
                </div>
            )}

                {/* Remove the Navigation Tabs section */}
                <div className="container-fluid py-4" style={{ flex: 1, overflowY: 'auto' }}>
                {loading ? (
                    <div className="text-center p-5">
                        <div className="spinner-border" style={{ color: '#6200ea' }} role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-3">Loading your dashboard...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === "bookings" && (
                            <>
                                <div className="row mx-2 mb-4">
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card shadow-sm text-white" style={{ 
                                            backgroundColor: '#5C90A3',
                                            borderRadius: '10px'
                                        }}>
                                            <div className="card-body">
                                                <h5 className="card-title">Total Bookings</h5>
                                                <h2>{bookings.length}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card shadow-sm text-white" style={{ 
                                            backgroundColor: '#5C90A3',
                                            borderRadius: '10px'
                                        }}>
                                            <div className="card-body">
                                                <h5 className="card-title">Confirmed</h5>
                                                <h2>{bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card shadow-sm text-white" style={{ 
                                            backgroundColor: '#5C90A3',
                                            borderRadius: '10px'
                                        }}>
                                            <div className="card-body">
                                                <h5 className="card-title">Pending</h5>
                                                <h2>{bookings.filter(b => b.status?.toLowerCase() === 'pending').length}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card shadow-sm text-white" style={{ 
                                            backgroundColor: '#5C90A3',
                                            borderRadius: '10px'
                                        }}>
                                            <div className="card-body">
                                                <h5 className="card-title">Completed</h5>
                                                <h2>{bookings.filter(b => b.status?.toLowerCase() === 'completed').length}</h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row mx-2">
                                    {bookings.length > 0 ? (
                                        bookings.map((booking, index) => (
                                            <div key={index} className="col-xl-4 col-lg-6 col-md-6 mb-4">
                                                <div className="card h-100 shadow-sm" style={{ 
                                                    borderRadius: '10px',
                                                    transition: 'all 0.3s ease',
                                                    border: 'none',
                                                    transform: 'scale(1)',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <div className="card-header" style={{ 
                                                        background: getStatusColor(booking.status),
                                                        color: '#fff',
                                                        borderTopLeftRadius: '10px',
                                                        borderTopRightRadius: '10px',
                                                        padding: '0.75rem 1rem'
                                                    }}>
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="fw-bold">{booking.photographyType}</span>
                                                            <span className="badge bg-light text-dark px-2 py-1">{booking.status}</span>
                                                        </div>
                                                        <div className="small">
                                                            <i className="fas fa-camera me-1"></i> {booking.photographer || 'Not assigned'}
                                                        </div>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="booking-info">
                                                            <div className="d-flex mb-2">
                                                                <div className="info-label" style={{ width: '140px', fontWeight: 'bold' }}>Date:</div>
                                                                <div>{booking.date}</div>
                                                            </div>
                                                            <div className="d-flex mb-2">
                                                                <div className="info-label" style={{ width: '140px', fontWeight: 'bold' }}>Location:</div>
                                                                <div>{booking.location}</div>
                                                            </div>
                                                            <div className="d-flex mb-2">
                                                                <div className="info-label" style={{ width: '140px', fontWeight: 'bold' }}>Rating:</div>
                                                                <div className="d-flex align-items-center">
                                                                    {renderStarRating(booking.photographerRating)}
                                                                    <span className="ml-1">({booking.photographerRating})</span>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex mb-2">
                                                                <div className="info-label" style={{ width: '140px', fontWeight: 'bold' }}>Package:</div>
                                                                <div>{booking.package}</div>
                                                            </div>
                                                            <div className="d-flex mb-2">
                                                                <div className="info-label" style={{ width: '140px', fontWeight: 'bold' }}>Price:</div>
                                                                <div className="font-weight-bold">{booking.price}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="card-footer bg-white d-flex justify-content-between" style={{ borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
                                                        <button className="btn btn-sm btn-outline-primary">
                                                            <i className="fas fa-phone-alt mr-1"></i> Contact
                                                        </button>
                                                        {booking.status?.toLowerCase() === 'pending' && (
                                                            <button className="btn btn-sm btn-outline-danger">
                                                                <i className="fas fa-times-circle mr-1"></i> Cancel
                                                            </button>
                                                        )}
                                                        {booking.status?.toLowerCase() === 'completed' && (
                                                            <button className="btn btn-sm btn-outline-warning">
                                                                <i className="fas fa-star mr-1"></i> Rate
                                                            </button>
                                                        )}
                                                        {booking.status?.toLowerCase() === 'confirmed' && (
                                                            <button className="btn btn-sm btn-outline-success">
                                                                <i className="fas fa-check-circle mr-1"></i> Details
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12 text-center mt-5">
                                            <div className="alert alert-info p-5" style={{ background: 'rgba(98, 0, 234, 0.1)', border: '1px solid #6200ea' }}>
                                                <i className="fas fa-info-circle fa-3x mb-3" style={{ color: '#6200ea' }}></i>
                                                <h4>No bookings available</h4>
                                                <p>You haven't made any photography bookings yet.</p>
            <button
                                                    className="btn mt-2" 
                                                    onClick={handleOpenPopup}
                                                    style={{ backgroundColor: 'rgba(106, 17, 203, 0.9)', color: 'white' }}
            >
                                                    <i className="fas fa-camera mr-2"></i>
                                                    Book Session
            </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === "photographers" && (
                            <div className="row mx-2">
                                <div className="col-12 mb-4">
                                    <h3 style={{ color: 'white' }}>
                                        <i className="fas fa-camera-retro mr-2"></i>
                                        Top Photographers
                                    </h3>
                                    <p style={{ color: 'white' }}>Discover talented photographers for your next session.</p>
                                </div>
                                
                                {photographers.length > 0 ? (
                                    photographers.map((photographer, index) => (
                                        <div key={index} className="col-xl-4 col-lg-6 col-md-6 mb-4">
                                            <div className="card h-100 shadow-sm" style={{ 
                                                borderRadius: '10px',
                                                transition: 'all 0.3s ease',
                                                border: 'none',
                                                transform: 'scale(1)',
                                                overflow: 'hidden'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <div className="position-relative">
                                                    <img 
                                                        src={photographer.profileImage} 
                                                        alt={photographer.name} 
                                                        className="card-img-top"
                                                        style={{ height: '200px', objectFit: 'cover' }}
                                                    />
                                                    <button 
                                                        className="position-absolute btn btn-light rounded-circle p-2"
                                                        style={{ top: '10px', right: '10px' }}
                                                        onClick={() => toggleFavorite(photographer.id)}
                                                    >
                                                        <i className={`fa${favoritePhotographers.some(p => p.id === photographer.id) ? 's' : 'r'} fa-heart`} 
                                                            style={{ color: '#e91e63' }}></i>
                                                    </button>
                                                </div>
                                                <div className="card-body">
                                                    <h5 className="card-title">{photographer.name}</h5>
                                                    <div className="d-flex align-items-center mb-2">
                                                        {renderStarRating(photographer.rating)}
                                                        <span className="ml-1">({photographer.rating})</span>
                                                    </div>
                                                    <p className="card-text text-muted mb-2">
                                                        <i className="fas fa-map-marker-alt mr-1"></i>
                                                        {photographer.location}
                                                    </p>
                                                    <p className="card-text mb-3">
                                                        <span className="badge badge-pill mr-1" style={{ backgroundColor: 'rgba(106, 17, 203, 0.1)', color: '#6a11cb', border: '1px solid #6a11cb', fontWeight: 'bold' }}>{photographer.specialization1}</span>
                                                        {photographer.specialization2 && (
                                                            <span className="badge badge-pill mr-1" style={{ backgroundColor: 'rgba(55, 0, 179, 0.1)', color: '#3700b3', border: '1px solid #3700b3', fontWeight: 'bold' }}>{photographer.specialization2}</span>
                                                        )}
                                                    </p>
                                                    <p className="card-text">
                                                        {photographer.bio?.substring(0, 80)}...
                                                    </p>
                                                </div>
                                                <div className="card-footer bg-white d-flex justify-content-between" style={{ borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
                                                    <button className="btn btn-sm btn-outline-primary">
                                                        <i className="fas fa-user mr-1"></i> View Profile
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm" 
                                                        style={{ backgroundColor: 'rgba(106, 17, 203, 0.9)', color: 'white' }}
                                                        onClick={() => bookPhotographer(photographer)}
                                                    >
                                                        <i className="fas fa-calendar-plus mr-1"></i> Book Now
            </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center mt-5">
                                        <div className="alert alert-info p-5" style={{ background: 'rgba(98, 0, 234, 0.1)', border: '1px solid #6a11cb' }}>
                                            <i className="fas fa-info-circle fa-3x mb-3" style={{ color: '#6a11cb' }}></i>
                                            <h4>No photographers available</h4>
                                            <p>We couldn't find any photographers at the moment. Please check back later.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "favorites" && (
                            <div className="row mx-2">
                                <div className="col-12 mb-4">
                                    <h3 style={{ color: 'white' }}>
                                        <i className="fas fa-heart mr-2"></i>
                                        My Favorite Photographers
                                    </h3>
                                    <p style={{ color: 'white' }}>Photographers you've saved for future bookings.</p>
                                </div>
                                
                                {favoritePhotographers.length > 0 ? (
                                    favoritePhotographers.map((photographer, index) => {
                                        // Ensure the photographer has a local image
                                        const imageIndex = (index % 3) + 1;
                                        const localImage = require(`../image/photo${imageIndex}.jpg`);
                                        
                                        return (
                                        <div key={index} className="col-xl-4 col-lg-6 col-md-6 mb-4">
                                            <div className="card h-100 shadow-sm" style={{ 
                                                borderRadius: '10px',
                                                transition: 'all 0.3s ease',
                                                border: 'none',
                                                transform: 'scale(1)',
                                                overflow: 'hidden'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <div className="position-relative">
                                                    <img 
                                                        src={localImage} 
                                                        alt={photographer.name} 
                                                        className="card-img-top"
                                                        style={{ height: '200px', objectFit: 'cover' }}
                                                    />
                                                    <button 
                                                        className="position-absolute btn btn-light rounded-circle p-2"
                                                        style={{ top: '10px', right: '10px' }}
                                                        onClick={() => toggleFavorite(photographer.id)}
                                                    >
                                                        <i className="fas fa-heart" style={{ color: '#e91e63' }}></i>
                                                    </button>
                                                </div>
                                                <div className="card-body">
                                                    <h5 className="card-title">{photographer.name}</h5>
                                                    <div className="d-flex align-items-center mb-2">
                                                        {renderStarRating(photographer.rating)}
                                                        <span className="ml-1">({photographer.rating})</span>
                                                    </div>
                                                    <p className="card-text text-muted mb-2">
                                                        <i className="fas fa-map-marker-alt mr-1"></i>
                                                        {photographer.location}
                                                    </p>
                                                    <p className="card-text mb-3">
                                                        <span className="badge badge-pill mr-1" style={{ backgroundColor: '#6a11cb', color: 'white' }}>{photographer.specialization1}</span>
                                                        {photographer.specialization2 && (
                                                            <span className="badge badge-pill mr-1" style={{ backgroundColor: '#3700b3', color: 'white' }}>{photographer.specialization2}</span>
                                                        )}
                                                    </p>
                                                    <p className="card-text">
                                                        {photographer.bio?.substring(0, 80)}...
                                                    </p>
                                                </div>
                                                <div className="card-footer bg-white d-flex justify-content-between" style={{ borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
                                                    <button className="btn btn-sm btn-outline-primary">
                                                        <i className="fas fa-user mr-1"></i> View Profile
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm" 
                                                        style={{ backgroundColor: '#6a11cb', color: 'white' }}
                                                        onClick={() => bookPhotographer(photographer)}
                                                    >
                                                        <i className="fas fa-calendar-plus mr-1"></i> Book Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-12 text-center mt-5">
                                        <div className="alert alert-info p-5" style={{ background: 'rgba(98, 0, 234, 0.1)', border: '1px solid #6a11cb' }}>
                                            <i className="fas fa-heart-broken fa-3x mb-3" style={{ color: '#6a11cb' }}></i>
                                            <h4>No favorite photographers</h4>
                                            <p>You haven't added any photographers to your favorites yet.</p>
                                            <button 
                                                className="btn mt-2" 
                                                onClick={() => setActiveTab("photographers")}
                                                style={{ backgroundColor: 'rgba(106, 17, 203, 0.9)', color: 'white' }}
                                            >
                                                <i className="fas fa-camera-retro mr-2"></i>
                                                Browse Photographers
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
                </div>
            </div>

            {/* Photographer Booking Popup */}
            {showPopup && (
                <PhotographerPopup
                    onClose={handleClosePopup}
                    onSubmit={handlePopupSubmit}
                />
            )}
        </div>
    );
};

export default UserDashboard;
