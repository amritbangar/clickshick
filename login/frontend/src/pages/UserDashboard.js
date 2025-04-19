// UserDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotographerPopup from './PhotographerPopup';
import axios from 'axios';
import QuotationDetails from '../components/QuotationDetails';

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
    const [selectedNotification, setSelectedNotification] = useState(null);
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
            
            if (!formData.pinCode) {
                console.warn("Warning: Booking doesn't have a PIN code!");
                setAlertMessage({
                    type: 'warning',
                    title: 'Missing PIN Code',
                    message: 'Your booking does not have a PIN code. Photographers may not be able to find it.'
                });
                return;
            }
            
            if (!formData.contactNumber || formData.contactNumber.length !== 10) {
                console.warn("Warning: Invalid contact number!");
                setAlertMessage({
                    type: 'warning',
                    title: 'Invalid Contact Number',
                    message: 'Please provide a valid 10-digit contact number.'
                });
                return;
            }
            
            const userId = localStorage.getItem('userId');
            const userName = user?.name || localStorage.getItem('userName') || 'Anonymous User';
            
            const contactInfo = {
                email: user?.email || localStorage.getItem('userEmail') || 'Not provided',
                phone: formData.contactNumber || 'Not provided'
            };
            
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
                const newBookingId = response.data._id;
                console.log("New booking ID:", newBookingId);
                
                if (formData.pinCode) {
                    localStorage.setItem('lastUsedPinCode', formData.pinCode);
                }
                
                // Show success alert
                setAlertMessage({
                    type: 'success',
                    title: 'Booking Created!',
                    message: 'Your booking request has been submitted successfully. Photographers will be notified and can show their interest.'
                });
                
                // For testing: Simulate a photographer showing interest after 5 seconds
                setTimeout(async () => {
                    const testPhotographer = {
                        id: '2',
                        name: 'Priya Patel',
                        specialization: 'Fashion Photography'
                    };
                    
                    try {
                        console.log("Creating notification for photographer interest with booking ID:", newBookingId);
                        
                        // Create a notification for photographer's interest
                        const notificationResponse = await axios.post('http://localhost:8080/api/notifications', {
                            userId: userId,
                            photographerId: testPhotographer.id,
                            photographerName: testPhotographer.name,
                            message: `${testPhotographer.name} has shown interest in your ${formData.photographyType} booking.`,
                            type: 'photographer_interest',
                            bookingId: newBookingId, // Use the new booking ID
                            bookingType: formData.photographyType,
                            bookingDetails: {
                                id: newBookingId,
                                type: formData.photographyType,
                                location: formData.location,
                                date: formData.date
                            }
                        }, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        });

                        console.log("Notification created:", notificationResponse.data);

                        // Update the booking with interested photographer
                        await axios.put(`http://localhost:8080/api/bookings/${newBookingId}/interested`, {
                            photographerId: testPhotographer.id,
                            photographerName: testPhotographer.name
                        }, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        });

                        // Show notification alert
                        setAlertMessage({
                            type: 'info',
                            title: 'New Interest!',
                            message: `${testPhotographer.name} has shown interest in your booking. Check notifications to accept or decline.`
                        });

                        // Refresh notifications and bookings
                        await Promise.all([
                            fetchNotifications(),
                            fetchData()
                        ]);
                    } catch (error) {
                        console.error('Error simulating photographer interest:', error);
                    }
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
            setShowPopup(false);
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

    // Update the useEffect hook to remove mock notifications
    useEffect(() => {
        // Initial fetch of notifications and data
        fetchNotifications();
        fetchData();
        
        // Setup polling for new notifications
        const notificationInterval = setInterval(() => {
            fetchNotifications();
            fetchData(); // Also refresh booking data to keep interested photographers count updated
        }, 30000);

        return () => clearInterval(notificationInterval);
    }, []);

    // Update the fetchNotifications function to include quotation data
    const fetchNotifications = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;
            
            console.log("Fetching notifications for user:", userId);
            
                const response = await axios.get(`http://localhost:8080/api/notifications?userId=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log("Raw notifications from server:", response.data);
            
            if (Array.isArray(response.data)) {
                // First, get all bookings to ensure we have the latest data
                await fetchData();
                console.log("Current bookings:", bookings);
                
                // Format notifications to ensure they have all required data
                const formattedNotifications = response.data.map(notification => {
                    console.log("Processing notification:", notification);
                    
                    if (notification.type === 'photographer_interest') {
                        // Find the associated booking
                        const booking = bookings.find(b => {
                            console.log("Comparing booking IDs:", {
                                bookingId: notification.bookingId,
                                currentId: b._id || b.id,
                                match: b._id === notification.bookingId || b.id === notification.bookingId
                            });
                            return b._id === notification.bookingId || b.id === notification.bookingId;
                        });
                        
                        console.log("Found associated booking:", booking);

                        const photographerName = notification.photographerDetails?.name || notification.photographerName || 'Unknown photographer';
                        const bookingType = booking?.photographyType || notification.bookingType || 'photography session';
                        
                        // Create a default quotation if none exists
                        const defaultQuotation = {
                            packageType: booking?.photographyType || 'Standard Package',
                            price: 0,
                            description: 'Package details will be discussed',
                            deliverables: {
                                photos: 0,
                                videos: 0,
                                reels: 0,
                                editedPhotos: 0,
                                printedPhotos: 0,
                                photoAlbum: false
                            },
                            timeframe: 'To be discussed',
                            additionalServices: '',
                            terms: 'Standard terms and conditions apply'
                        };
                        
                        return {
                            ...notification,
                            message: `${photographerName} has submitted a quotation for your ${bookingType} booking. Click to view details.`,
                            photographerId: notification.photographerId,
                            photographerDetails: notification.photographerDetails || {
                                name: photographerName,
                                profileImage: notification.photographerImage,
                                rating: notification.photographerRating || 4.5,
                                location: notification.photographerLocation || 'Location not specified'
                            },
                            bookingId: notification.bookingId,
                            bookingType,
                            booking: booking,
                            quotation: notification.quotation || defaultQuotation,
                            showActions: !notification.isRead
                        };
                    }
                    return notification;
                });
                
                console.log("Formatted notifications:", formattedNotifications);
                
                setNotifications(formattedNotifications);
                setUnreadCount(formattedNotifications.filter(notif => !notif.isRead).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Update the handleNotificationClick function
    const handleNotificationClick = async (notification) => {
        try {
            console.log('Notification clicked:', notification);

            if (notification.type === 'photographer_interest') {
                // Set the notification directly without fetching booking
                // since we already have all required data in the notification
                const enrichedNotification = {
                    ...notification,
                    quotation: notification.quotation || {
                        packageType: 'Standard Package',
                        price: notification.price || 0,
                        description: 'Package details to be discussed',
                        deliverables: {
                            photos: 100,
                            videos: 1,
                            reels: 2,
                            editedPhotos: 50,
                            printedPhotos: 20,
                            photoAlbum: true
                        },
                        timeframe: '1-2 weeks',
                        additionalServices: 'Basic photo editing included',
                        terms: 'Standard terms and conditions apply'
                    },
                    photographerDetails: notification.photographerDetails || {
                        name: notification.photographerName,
                        profileImage: require('../image/photo1.jpg'), // Default image
                        rating: 4.5,
                        location: 'Location not specified'
                    }
                };

                console.log('Setting selected notification with:', enrichedNotification);
                setSelectedNotification(enrichedNotification);
            }

            // Mark notification as read if it's unread
            if (!notification.isRead) {
                await markAsRead(notification._id);
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
            setAlertMessage({
                type: 'error',
                title: 'Error',
                message: 'Failed to process notification. Please try again.'
            });
        }
    };

    // Update the markAsRead function
    const markAsRead = async (notificationId) => {
        try {
            // Find the notification that was clicked
            const notification = notifications.find(notif => notif._id === notificationId);
            
            if (!notification) {
                console.warn('Notification not found:', notificationId);
                return;
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

            // Only show alert for certain notification types
            if (notification.type === 'booking_accepted' || notification.type === 'booking_rejected') {
                setAlertMessage({
                    type: notification.type === 'booking_accepted' ? 'success' : 'danger',
                    title: notification.type === 'booking_accepted' ? 'Booking Accepted' : 'Booking Declined',
                    message: notification.message
                });
                
                // Auto-hide alert after 5 seconds
                setTimeout(() => {
                    setAlertMessage(null);
                }, 5000);
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Don't show error alert for this as it's not critical
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

    // Update handleAcceptPhotographer function to handle booking data better
    const handleAcceptPhotographer = async (notificationId, photographerId, photographerName) => {
        try {
            console.log('Accept photographer called with:', {
                notificationId,
                photographerId,
                photographerName
            });

            // Find the notification
            const notification = notifications.find(n => n._id === notificationId);
            console.log('Found notification:', notification);

            if (!notification) {
                console.error('Notification not found with ID:', notificationId);
                setAlertMessage({
                    type: 'danger',
                    title: 'Error',
                    message: 'Could not find the notification. Please refresh and try again.'
                });
                return;
            }

            // Get the booking ID from the notification
            const bookingId = notification.bookingId;
            console.log('Booking ID from notification:', bookingId);

            if (!bookingId) {
                console.error('Notification has no bookingId:', notification);
                setAlertMessage({
                    type: 'danger',
                    title: 'Error',
                    message: 'Could not find the associated booking ID. Please refresh and try again.'
                });
                return;
            }

            // Update booking status in backend
            console.log('Sending accept request to backend for booking:', bookingId);
            const acceptResponse = await axios.post(`http://localhost:8080/api/bookings/${bookingId}/accept-photographer`, {
                photographerId,
                photographerName,
                status: 'Confirmed'
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Accept response:', acceptResponse);

            // Send acceptance notification to photographer
            const notificationResponse = await axios.post('http://localhost:8080/api/notifications', {
                userId: photographerId,
                message: `Congratulations! The user has accepted your interest for the booking. You can now proceed with the session details.`,
                type: 'interest_accepted',
                bookingId: bookingId,
                userName: user?.name || localStorage.getItem('userName')
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Notification sent to photographer:', notificationResponse);

            // Mark the current notification as read
            await axios.put(`http://localhost:8080/api/notifications/${notificationId}`, 
                { isRead: true },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // Show success message
            setAlertMessage({
                type: 'success',
                title: 'Photographer Accepted',
                message: `You have accepted ${photographerName}'s interest. They have been notified and will contact you soon.`
            });

            // Close the quotation modal
            setSelectedNotification(null);

            // Refresh data
            await Promise.all([
                fetchData(),
                fetchNotifications()
            ]);
        } catch (error) {
            console.error('Failed to accept photographer:', error);
            setAlertMessage({
                type: 'danger',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to accept photographer. Please try again.'
            });
        }
    };

    const handleDeclinePhotographer = async (notificationId, photographerId, photographerName) => {
        try {
            const notification = notifications.find(n => n._id === notificationId);
            if (!notification || !notification.bookingId) {
                console.error('Invalid notification or booking ID');
                return;
            }

            // Send decline notification to photographer
            await axios.post('http://localhost:8080/api/notifications', {
                userId: photographerId,
                message: `Your interest for the booking has been declined.`,
                type: 'interest_declined',
                bookingId: notification.bookingId
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Mark the notification as read
            await axios.put(`http://localhost:8080/api/notifications/${notificationId}`, 
                { isRead: true },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setAlertMessage({
                type: 'info',
                title: 'Photographer Declined',
                message: `You have declined ${photographerName}'s interest.`
            });

            // Refresh notifications
            await fetchNotifications();
        } catch (error) {
            console.error('Failed to decline photographer:', error);
            setAlertMessage({
                type: 'danger',
                title: 'Error',
                message: 'Failed to decline photographer. Please try again.'
            });
        }
    };

    // Add toggleNotifications function if it's missing
    const toggleNotifications = () => {
        // If we're opening the dropdown, make sure we have notifications to show
        if (!showNotifications) {
            fetchNotifications();
        }
        setShowNotifications(!showNotifications);
    };

    return (
        <div className="dashboard-container" style={{ 
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--primary-color)',
            overflow: 'hidden'
        }}>
            {/* Top Navigation Bar */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
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
            <div style={{ display: 'flex', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
                {/* Sidebar */}
                <div style={{
                    width: '250px',
                    backgroundColor: '#5C90A3',
                    padding: '20px 0',
                    color: '#FFFFFF',
                    overflowY: 'auto'
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
                <div className="notification-dropdown bg-white shadow-lg" 
                        style={{ 
                        position: 'fixed',
                        right: '20px',
                        top: '70px', // Position below navbar
                            width: '350px',
                        maxHeight: 'calc(100vh - 90px)', // Leave space for margins
                            overflowY: 'auto',
                        zIndex: 1050,
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.1)'
                        }}>
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
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
                        
                    <div className="p-3">
                        {notifications && notifications.length > 0 ? (
                            notifications.map((notification, index) => (
                                <div 
                                    key={notification._id || index} 
                                    className={`notification-item p-2 mb-2 rounded ${!notification.isRead ? 'bg-light' : ''}`}
                                    style={{ 
                                        cursor: 'pointer',
                                        borderBottom: index !== notifications.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none'
                                    }}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="d-flex">
                                        <div className="me-3">
                                            {notification.type === 'photographer_interest' ? (
                                                <i className="fas fa-user-check text-primary fa-lg"></i>
                                            ) : notification.type === 'booking_accepted' ? (
                                                <i className="fas fa-check-circle text-success fa-lg"></i>
                                            ) : notification.type === 'booking_rejected' ? (
                                                <i className="fas fa-times-circle text-danger fa-lg"></i>
                                            ) : (
                                                <i className="fas fa-info-circle text-primary fa-lg"></i>
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="mb-1" style={{ fontSize: '0.9rem' }}>{notification.message}</p>
                                            <small className="text-muted d-block">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted py-4">
                                <i className="fas fa-bell-slash fa-2x mb-3"></i>
                                <p>No notifications yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Quotation Details Modal */}
            {selectedNotification && (
                <div className="modal fade show" style={{ 
                    display: 'block',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1050,
                    overflow: 'hidden',
                    outline: 0
                }}>
                    <div className="modal-dialog modal-lg" style={{
                        transform: 'none',
                        margin: '1.75rem auto',
                        maxHeight: 'calc(100vh - 3.5rem)'
                    }}>
                        <div className="modal-content" style={{
                            maxHeight: 'calc(100vh - 3.5rem)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div className="modal-header">
                                <h5 className="modal-title">Photographer Quotation</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setSelectedNotification(null)}
                                ></button>
                            </div>
                            <div className="modal-body" style={{
                                overflow: 'auto',
                                padding: 0
                            }}>
                                <QuotationDetails
                                    quotation={selectedNotification.quotation || {}}
                                    photographer={{
                                        name: selectedNotification.photographerDetails?.name || selectedNotification.photographerName,
                                        profileImage: selectedNotification.photographerDetails?.profileImage || selectedNotification.photographerImage,
                                        rating: selectedNotification.photographerDetails?.rating || selectedNotification.photographerRating || 4.5,
                                        location: selectedNotification.photographerDetails?.location || selectedNotification.photographerLocation || 'Location not specified'
                                    }}
                                    onAccept={() => {
                                        handleAcceptPhotographer(
                                            selectedNotification._id,
                                            selectedNotification.photographerId,
                                            selectedNotification.photographerDetails?.name || selectedNotification.photographerName
                                        );
                                        setSelectedNotification(null);
                                    }}
                                    onDecline={() => {
                                        handleDeclinePhotographer(
                                            selectedNotification._id,
                                            selectedNotification.photographerId,
                                            selectedNotification.photographerDetails?.name || selectedNotification.photographerName
                                        );
                                        setSelectedNotification(null);
                                    }}
                                />
                    </div>
                </div>
                    </div>
                </div>
            )}

                {/* Remove the Navigation Tabs section */}
                <div className="container-fluid py-4" style={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    height: '100%'
                }}>
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
                                    <div className="col-12 mb-4">
                                        <h4 className="text-white mb-3">
                                            <i className="fas fa-chart-line me-2"></i>
                                            Booking Statistics
                                        </h4>
                                            </div>
                                    <div className="col-xl-3 col-lg-6 col-md-6 mb-4">
                                        <div className="card h-100 border-0 shadow-sm" style={{
                                            borderRadius: '15px',
                                            background: 'linear-gradient(135deg, #5C90A3 0%, #7BA7B9 100%)',
                                            transition: 'transform 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div className="card-body p-4">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle p-3 me-3" style={{
                                                            background: 'rgba(255, 255, 255, 0.2)'
                                                        }}>
                                                            <i className="fas fa-calendar-check fa-lg text-white"></i>
                                        </div>
                                                        <h6 className="text-white mb-0">Total Bookings</h6>
                                    </div>
                                            </div>
                                                <div className="text-center">
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem' }}>
                                                        {bookings.length}
                                                    </h2>
                                                    <p className="text-white-50 mb-0">All Time</p>
                                        </div>
                                    </div>
                                            </div>
                                        </div>

                                    <div className="col-xl-3 col-lg-6 col-md-6 mb-4">
                                        <div className="card h-100 border-0 shadow-sm" style={{
                                            borderRadius: '15px',
                                            background: 'linear-gradient(135deg, #28a745 0%, #5cc990 100%)',
                                            transition: 'transform 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div className="card-body p-4">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle p-3 me-3" style={{
                                                            background: 'rgba(255, 255, 255, 0.2)'
                                                        }}>
                                                            <i className="fas fa-check-circle fa-lg text-white"></i>
                                    </div>
                                                        <h6 className="text-white mb-0">Confirmed</h6>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem' }}>
                                                        {bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}
                                                    </h2>
                                                    <p className="text-white-50 mb-0">Active Bookings</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-xl-3 col-lg-6 col-md-6 mb-4">
                                        <div className="card h-100 border-0 shadow-sm" style={{
                                            borderRadius: '15px',
                                            background: 'linear-gradient(135deg, #ffc107 0%, #ffd75e 100%)',
                                            transition: 'transform 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div className="card-body p-4">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle p-3 me-3" style={{
                                                            background: 'rgba(255, 255, 255, 0.2)'
                                                        }}>
                                                            <i className="fas fa-clock fa-lg text-white"></i>
                                                        </div>
                                                        <h6 className="text-white mb-0">Pending</h6>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem' }}>
                                                        {bookings.filter(b => b.status?.toLowerCase() === 'pending').length}
                                                    </h2>
                                                    <p className="text-white-50 mb-0">Awaiting Response</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-xl-3 col-lg-6 col-md-6 mb-4">
                                        <div className="card h-100 border-0 shadow-sm" style={{
                                            borderRadius: '15px',
                                            background: 'linear-gradient(135deg, #17a2b8 0%, #45cadd 100%)',
                                            transition: 'transform 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div className="card-body p-4">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle p-3 me-3" style={{
                                                            background: 'rgba(255, 255, 255, 0.2)'
                                                        }}>
                                                            <i className="fas fa-flag-checkered fa-lg text-white"></i>
                                                        </div>
                                                        <h6 className="text-white mb-0">Completed</h6>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem' }}>
                                                        {bookings.filter(b => b.status?.toLowerCase() === 'completed').length}
                                                    </h2>
                                                    <p className="text-white-50 mb-0">Successfully Done</p>
                                                </div>
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
                                                            <i className="fas fa-camera me-1"></i> 
                                                            {booking.photographer || 'Not assigned'}
                                                            {booking.status === 'Pending' && booking.interestedPhotographers?.length > 0 && (
                                                                <span className="ms-2 badge bg-primary">
                                                                    {booking.interestedPhotographers.length} interested
                                                                </span>
                                                            )}
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
                                                            
                                                            {/* Show interested photographers section for pending bookings */}
                                                            {booking.status === 'Pending' && booking.interestedPhotographers?.length > 0 && (
                                                                <div className="mt-3">
                                                                    <h6 className="mb-2">Interested Photographers:</h6>
                                                                    <div className="interested-photographers">
                                                                        {booking.interestedPhotographers.map((photographer, idx) => (
                                                                            <div key={idx} className="interested-photographer mb-2 p-2 border rounded">
                                                                                <div className="d-flex justify-content-between align-items-center">
                                                                                    <span>{photographer.name}</span>
                                                                                    <div>
                                                                                        <button 
                                                                                            className="btn btn-sm btn-success me-2"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                if (!photographer.id || !photographer.name) {
                                                                                                    console.error('Missing photographer details:', photographer);
                                                                                                    setAlertMessage({
                                                                                                        type: 'danger',
                                                                                                        title: 'Error',
                                                                                                        message: 'Missing photographer details. Please refresh and try again.'
                                                                                                    });
                                                                                                    return;
                                                                                                }
                                                                                                handleAcceptPhotographer(
                                                                                                    photographer.notificationId,
                                                                                                    photographer.id,
                                                                                                    photographer.name
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            Accept
                                                                                        </button>
                                                                                        <button 
                                                                                            className="btn btn-sm btn-outline-danger"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                if (!photographer.id || !photographer.name) {
                                                                                                    console.error('Missing photographer details:', photographer);
                                                                                                    setAlertMessage({
                                                                                                        type: 'danger',
                                                                                                        title: 'Error',
                                                                                                        message: 'Missing photographer details. Please refresh and try again.'
                                                                                                    });
                                                                                                    return;
                                                                                                }
                                                                                                handleDeclinePhotographer(
                                                                                                    photographer.notificationId,
                                                                                                    photographer.id,
                                                                                                    photographer.name
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            Decline
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
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
