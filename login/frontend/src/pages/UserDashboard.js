// UserDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotographerPopup from './PhotographerPopup';
import axios from 'axios';
import QuotationDetails from '../components/QuotationDetails';
import { toast } from 'react-toastify';

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
    const [selectedNotification, setSelectedNotification] = useState(null);
    const navigate = useNavigate();
    
    // Add ref for notification dropdown
    const notificationRef = useRef(null);
    const notificationBellRef = useRef(null);

    // Add useEffect to handle outside clicks for notification dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (showNotifications && 
                notificationRef.current && 
                !notificationRef.current.contains(event.target) &&
                notificationBellRef.current &&
                !notificationBellRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        
        // Attach the event listener
        document.addEventListener('mousedown', handleClickOutside);
        
        // Clean up the event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

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
                toast.warning('Your booking does not have a PIN code. Photographers may not be able to find it.');
                return;
            }
            
            if (!formData.contactNumber || formData.contactNumber.length !== 10) {
                console.warn("Warning: Invalid contact number!");
                toast.warning('Please provide a valid 10-digit contact number.');
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
                toast.success('Your booking request has been submitted successfully. Photographers will be notified and can show their interest.');
                
                // For testing: Simulate a photographer showing interest after 5 seconds
                setTimeout(async () => {
                    const testPhotographer = {
                        id: '2',
                        name: 'Priya Patel',
                        specialization: 'Fashion Photography',
                        message: "Hi! I'm interested in your booking. I specialize in capturing beautiful moments and would love to be part of your special day.",
                        expectedPrice: "35000"
                    };
                    
                    try {
                        console.log("Creating notification for photographer interest with booking ID:", newBookingId);
                        
                        // Create a notification for photographer's interest with explicit price
                        const notificationResponse = await axios.post('http://localhost:8080/api/notifications', {
                            userId: userId,
                            photographerId: testPhotographer.id,
                            photographerName: testPhotographer.name,
                            photographerDetails: {
                                name: testPhotographer.name,
                                specialization: testPhotographer.specialization,
                                rating: 4.8,
                                location: 'Mumbai'
                            },
                            message: testPhotographer.message,
                            expectedPrice: testPhotographer.expectedPrice,
                            type: 'photographer_interest',
                            bookingId: newBookingId,
                            bookingType: formData.photographyType,
                            bookingDetails: {
                                id: newBookingId,
                                type: formData.photographyType,
                                location: formData.location,
                                date: formData.date,
                                budgetRange: formData.budgetRange
                            },
                            quotation: {
                                message: testPhotographer.message,
                                expectedPrice: testPhotographer.expectedPrice
                            }
                        }, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        });

                        // Update the booking with interested photographer including price
                        await axios.put(`http://localhost:8080/api/bookings/${newBookingId}/interested`, {
                            photographerId: testPhotographer.id,
                            photographerName: testPhotographer.name,
                            photographerDetails: {
                                name: testPhotographer.name,
                                specialization: testPhotographer.specialization,
                                rating: 4.8,
                                location: 'Mumbai'
                            },
                            message: testPhotographer.message,
                            expectedPrice: testPhotographer.expectedPrice
                        }, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        });

                        // Show notification alert
                        toast.info(`${testPhotographer.name} has shown interest in your booking with a quote of ₹${testPhotographer.expectedPrice}. Check notifications to accept or decline.`);

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
                toast.error('Failed to save booking. Please try again.');
            }
        } catch (error) {
            console.error('Error saving booking:', error.response?.data || error.message);
            toast.error('Failed to save booking. Please try again.');
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
            toast.error("Failed to update favorites. Please try again.");
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
        
        // Remove the polling interval and cleanup
        // const notificationInterval = setInterval(() => {
        //     fetchNotifications();
        //     fetchData(); // Also refresh booking data to keep interested photographers count updated
        // }, 30000);
        
        // return () => clearInterval(notificationInterval);
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
                        const booking = bookings.find(b => b._id === notification.bookingId || b.id === notification.bookingId);
                        console.log("Found associated booking:", booking);

                        // Find photographer in photographers list first
                        const photographer = photographers.find(p => p.id === notification.photographerId);
                        console.log("Found photographer in list:", photographer);

                        // Get photographer details with fallbacks in order of priority
                        const photographerName = photographer?.name || 
                                              notification.photographerDetails?.name || 
                                              notification.photographerName || 
                                              'Priya Patel'; // Default to Priya Patel instead of Unknown photographer
                        
                        const bookingType = booking?.photographyType || notification.bookingType || 'photography session';
                        
                        // Get the message and price from the notification
                        const message = notification.quotation?.message || notification.message || 'No message provided';
                        const expectedPrice = notification.quotation?.expectedPrice || notification.expectedPrice || 'Price not specified';
                        
                        // Create photographer details object using photographer data if available
                        const photographerDetails = photographer ? {
                            name: photographer.name,
                            profileImage: photographer.profileImage || require('../image/photo1.jpg'),
                            rating: photographer.rating || 4.5,
                            location: photographer.location || 'Mumbai',
                            specialization: photographer.specialization1 || bookingType
                        } : {
                            name: photographerName,
                            profileImage: notification.photographerImage || require('../image/photo1.jpg'),
                            rating: notification.photographerRating || 4.5,
                            location: notification.photographerLocation || 'Mumbai',
                            specialization: notification.photographerSpecialization || bookingType
                        };

                        return {
                            ...notification,
                            message: `${photographerName} has submitted a quotation for your ${bookingType} booking. Click to view details.`,
                            photographerId: notification.photographerId,
                            photographerDetails,
                            bookingId: notification.bookingId,
                            bookingType,
                            booking,
                            quotation: {
                                packageType: bookingType,
                                message: message,
                                expectedPrice: expectedPrice,
                                description: message,
                                deliverables: notification.quotation?.deliverables || {
                                    photos: 0,
                                    videos: 0,
                                    reels: 0,
                                    editedPhotos: 0,
                                    printedPhotos: 0,
                                    photoAlbum: false
                                },
                                timeframe: notification.quotation?.timeframe || 'To be discussed',
                                additionalServices: notification.quotation?.additionalServices || '',
                                terms: notification.quotation?.terms || 'Standard terms and conditions apply'
                            },
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
                console.log('Raw notification data:', notification);

                // Get the photographer's details and quotation from the notification
                const enrichedNotification = {
                    ...notification,
                    quotation: {
                        ...notification.quotation,
                        message: notification.quotation?.message || notification.message || 'No message provided',
                        expectedPrice: notification.quotation?.expectedPrice || notification.expectedPrice || 'Price not specified',
                        bookingDetails: {
                            date: notification.bookingDetails?.date || 'Date not specified',
                            location: notification.bookingDetails?.location || 'Location not specified',
                            budgetRange: notification.bookingDetails?.budgetRange || 'Budget not specified',
                            type: notification.bookingDetails?.type || notification.bookingType || 'Photography'
                        }
                    },
                    photographerDetails: {
                        name: notification.photographerName || notification.photographerDetails?.name || 'Unknown Photographer',
                        profileImage: notification.photographerImage || require('../image/photo1.jpg'),
                        rating: notification.photographerRating || 4.5,
                        location: notification.photographerLocation || 'Location not specified',
                        specialization: notification.photographerSpecialization || notification.bookingType || 'Photography'
                    }
                };

                // Try to find the photographer in the photographers list
                const photographer = photographers.find(p => p.id === notification.photographerId);
                if (photographer) {
                    enrichedNotification.photographerDetails = {
                        ...enrichedNotification.photographerDetails,
                        name: photographer.name,
                        profileImage: photographer.profileImage,
                        rating: photographer.rating,
                        location: photographer.location,
                        specialization: photographer.specialization1
                    };
                }

                console.log('Enriched notification:', enrichedNotification);
                setSelectedNotification(enrichedNotification);
            }

            // Mark notification as read if it's unread
            if (!notification.isRead) {
                await markAsRead(notification._id);
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
            toast.error('Failed to process notification. Please try again.');
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
                toast.success(`${notification.type === 'booking_accepted' ? 'Booking Accepted' : 'Booking Declined'}`);
                
                // Auto-hide alert after 5 seconds
                setTimeout(() => {
                    toast.clearWaitingQueue();
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
                throw new Error('Notification not found');
            }

            // Get the booking ID and details from the notification
            const bookingId = notification.bookingId;
            const bookingDetails = notification.bookingDetails || {};
            console.log('Booking details:', bookingDetails);

            if (!bookingId) {
                throw new Error('Booking ID not found in notification');
            }

            // Get user details
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            const userName = user?.name || localStorage.getItem('userName');
            const userContact = user?.email || localStorage.getItem('userEmail');

            if (!userId || !token) {
                throw new Error('User authentication details missing');
            }

            // First, update the booking status
            console.log('Updating booking status...');
            const acceptResponse = await axios.put(`http://localhost:8080/api/bookings/${bookingId}`, {
                status: 'Confirmed',
                photographerId: photographerId,
                photographerName: photographerName,
                updatedAt: new Date().toISOString()
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Booking update response:', acceptResponse.data);

            // Then, send notification to photographer
            console.log('Sending notification to photographer...');
            const notificationData = {
                userId: photographerId,
                message: `Congratulations! Your quotation has been accepted for the ${notification.bookingType} booking.`,
                type: 'booking_confirmed',
                bookingId: bookingId,
                userName: userName,
                bookingDetails: {
                    type: notification.bookingType,
                    date: bookingDetails.date,
                    location: bookingDetails.location,
                    price: notification.quotation?.expectedPrice,
                    clientName: userName,
                    clientContact: userContact
                },
                quotation: notification.quotation,
                additionalInfo: `Please contact the client at ${userContact} to discuss further details.`
            };

            console.log('Notification data:', notificationData);

            const notificationResponse = await axios.post(
                'http://localhost:8080/api/notifications',
                notificationData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('Notification response:', notificationResponse.data);

            // Mark the current notification as read
            await axios.put(
                `http://localhost:8080/api/notifications/${notificationId}`,
                { isRead: true },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Decline other photographers who showed interest
            const otherNotifications = notifications.filter(n => 
                n.bookingId === bookingId && 
                n._id !== notificationId && 
                n.type === 'photographer_interest' &&
                !n.isRead
            );

            console.log('Declining other photographers:', otherNotifications.length);

            for (const otherNotification of otherNotifications) {
                await handleDeclinePhotographer(
                    otherNotification._id,
                    otherNotification.photographerId,
                    otherNotification.photographerName || 'Photographer',
                    false // Don't show decline messages for others
                );
            }

            // Show success message
            toast.success(`You have accepted ${photographerName}'s quotation. They have been notified and will contact you soon.`);

            // Close the quotation modal
            setSelectedNotification(null);

            // Refresh data
            await Promise.all([
                fetchData(),
                fetchNotifications()
            ]);

        } catch (error) {
            console.error('Error in handleAcceptPhotographer:', error);
            let errorMessage = 'Failed to accept photographer. ';
            
            if (error.response) {
                console.error('Error response:', error.response);
                errorMessage += error.response.data?.message || error.response.statusText;
            } else if (error.message) {
                errorMessage += error.message;
            }

            toast.error(errorMessage);
        }
    };

    // Update handleDeclinePhotographer to handle silent declines
    const handleDeclinePhotographer = async (notificationId, photographerId, photographerName, showMessage = true) => {
        try {
            const notification = notifications.find(n => n._id === notificationId);
            if (!notification || !notification.bookingId) {
                throw new Error('Invalid notification or booking ID');
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

            if (showMessage) {
                toast.info(`You have declined ${photographerName}'s interest.`);
            }

            // Refresh notifications
            await fetchNotifications();
        } catch (error) {
            console.error('Failed to decline photographer:', error);
            if (showMessage) {
                toast.error('Failed to decline photographer. Please try again.');
            }
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

                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
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
                    
                    {/* Notifications Bell */}
                    <div style={{ position: 'relative', marginRight: '20px' }}>
                        <div 
                            ref={notificationBellRef}
                            onClick={toggleNotifications}
                            style={{ 
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '50%',
                                backgroundColor: showNotifications ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <i className="fas fa-bell" style={{ fontSize: '1.4rem', color: '#fff' }}></i>
                    {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    backgroundColor: 'red',
                                    color: 'white',
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

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div 
                                ref={notificationRef}
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 10px)',
                                    right: '-10px',
                                    width: '350px',
                                    maxHeight: '500px',
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    zIndex: 9999,
                                    overflowY: 'auto',
                                    border: '1px solid rgba(0,0,0,0.1)'
                                }}
                            >
                                {/* Dropdown Arrow */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '20px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#fff',
                                    transform: 'rotate(45deg)',
                                    borderLeft: '1px solid rgba(0,0,0,0.1)',
                                    borderTop: '1px solid rgba(0,0,0,0.1)',
                                }} />

                                <div style={{ padding: '16px' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        marginBottom: '12px' 
                                    }}>
                                        <h6 style={{ margin: 0, color: '#333' }}>Notifications</h6>
                                        {notifications.some(n => !n.isRead) && (
                  <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAllAsRead();
                                                }}
                    style={{ 
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#666',
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer',
                                                    padding: 0
                                                }}
                                            >
                                                Mark all as read
                  </button>
                                        )}
                                    </div>

                                    {notifications.length === 0 ? (
                                        <div style={{ 
                                            textAlign: 'center', 
                                            padding: '20px',
                                            color: '#666' 
                                        }}>
                                            <i className="fas fa-bell-slash mb-2" style={{ fontSize: '1.5rem' }}></i>
                                            <p style={{ margin: '10px 0 0' }}>No notifications</p>
                                        </div>
                                    ) : (
                                        <div>
                                            {notifications.map((notification) => (
                                                <div 
                                                    key={notification._id}
                    style={{ 
                                                        padding: '12px',
                                                        marginBottom: '8px',
                                                        backgroundColor: notification.isRead ? '#fff' : '#f8f9fa',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleNotificationClick(notification);
                                                    }}
                                                >
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start'
                                                    }}>
                                                        <div>
                                                            <p style={{ 
                                                                margin: '0 0 4px',
                                                                color: '#333',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                {notification.message}
                                                            </p>
                                                            <small style={{ color: '#666' }}>
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                            </small>
                                                        </div>
                                                        {!notification.isRead && (
                                                            <span style={{
                                                                width: '8px',
                                                                height: '8px',
                                                                borderRadius: '50%',
                                                                backgroundColor: '#0d6efd',
                                                                display: 'inline-block',
                                                                marginLeft: '8px'
                                                            }} />
                                                        )}
                                                    </div>

                                                    {notification.type === 'photographer_interest' && !notification.isRead && (
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            gap: '8px',
                                                            marginTop: '12px' 
                                                        }}>
                                                            <button
                                                                className="btn btn-success"
                                                                style={{ flex: 1 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAcceptPhotographer(
                                                                        notification._id,
                                                                        notification.photographerId,
                                                                        notification.photographerName
                                                                    );
                                                                }}
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                className="btn btn-danger"
                                                                style={{ flex: 1 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeclinePhotographer(
                                                                        notification._id,
                                                                        notification.photographerId,
                                                                        notification.photographerName
                                                                    );
                                                                }}
                                                            >
                                                                Decline
                  </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
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
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>
                            {user ? user.name : 'User'}
                        </span>
                        <i className="fas fa-chevron-down" style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#fff' }}></i>
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
            {toast.isActive('booking-alert') && (
                <div className={`alert alert-${toast.isActive('booking-alert') ? 'success' : 'danger'} alert-dismissible fade show m-3`} role="alert">
                    <strong>{toast.isActive('booking-alert') ? 'Booking Confirmed' : 'Error'}</strong> {toast.isActive('booking-alert') ? 'Your booking has been confirmed!' : 'Failed to process the booking. Please try again.'}
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => toast.clearWaitingQueue()}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            )}

            {/* Notification Dropdown */}
            <div className="position-relative">
            {showNotifications && (
                    <div 
                        className="notification-dropdown"
                        style={{ 
                            position: 'absolute', 
                            top: '100%',
                            right: '0',
                            width: '350px',
                            maxHeight: '500px',
                            overflowY: 'auto',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            borderRadius: '8px',
                            zIndex: 9999,
                            marginTop: '10px',
                            border: '1px solid rgba(0,0,0,0.1)'
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside dropdown
                    >
                        <div className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="m-0">Notifications</h6>
                                {notifications.some(n => !n.isRead) && (
                                <button 
                                        className="btn btn-link btn-sm text-muted p-0" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAllAsRead();
                                        }}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                            {notifications.length === 0 ? (
                                <p className="text-muted text-center mb-0">No notifications</p>
                            ) : (
                                notifications.map((notification) => (
                                    <div 
                                        key={notification._id} 
                                        className={`notification-item p-3 mb-2 rounded ${!notification.isRead ? 'bg-light' : ''}`}
                                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNotificationClick(notification);
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
        <div>
                                                <p className="mb-1" style={{ fontSize: '0.9rem' }}>
                                                    {notification.message}
                                                </p>
                                                <small className="text-muted">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </small>
                                        </div>
                                            {!notification.isRead && (
                                                <span className="badge bg-primary rounded-circle" style={{ width: '10px', height: '10px' }}></span>
                                            )}
                                    </div>
                                        
                                        {/* Accept/Decline Buttons for photographer interest notifications */}
                                        {notification.type === 'photographer_interest' && !notification.isRead && (
                                            <div className="d-flex gap-2 mt-2">
                                                <button
                                                    className="btn btn-success flex-grow-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAcceptPhotographer(
                                                            notification._id,
                                                            notification.photographerId,
                                                            notification.photographerName
                                                        );
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="btn btn-danger flex-grow-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeclinePhotographer(
                                                            notification._id,
                                                            notification.photographerId,
                                                            notification.photographerName
                                                        );
                                                    }}
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            </div>

            {/* Photographer Interest Details Modal */}
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
                        maxHeight: 'calc(100vh - 3.5rem)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div className="modal-content" style={{
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Fixed Header */}
                            <div className="modal-header" style={{
                                borderBottom: '1px solid #dee2e6',
                                backgroundColor: '#fff',
                                position: 'sticky',
                                top: 0,
                                zIndex: 1
                            }}>
                                <h5 className="modal-title">Photographer Interest Details</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setSelectedNotification(null)}
                                ></button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="modal-body" style={{
                                padding: '20px',
                                overflowY: 'auto',
                                maxHeight: 'calc(85vh - 130px)' // Adjust for header and footer height
                            }}>
                                {/* Photographer Info */}
                                <div className="d-flex align-items-center mb-4">
                                    <img 
                                        src={selectedNotification.photographerDetails.profileImage} 
                                        alt={selectedNotification.photographerDetails.name}
                                        className="rounded-circle me-3"
                                        style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h5 className="mb-1">{selectedNotification.photographerDetails.name}</h5>
                                        <div className="text-muted">
                                            <i className="fas fa-star text-warning me-1"></i>
                                            {selectedNotification.photographerDetails.rating} · {selectedNotification.photographerDetails.location}
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="card mb-4">
                                    <div className="card-header bg-light">
                                        <h6 className="mb-0">Booking Information</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <strong>Type:</strong>
                                                <p>{selectedNotification.quotation.bookingDetails.type}</p>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <strong>Date:</strong>
                                                <p>{selectedNotification.quotation.bookingDetails.date}</p>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <strong>Location:</strong>
                                                <p>{selectedNotification.quotation.bookingDetails.location}</p>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <strong>Budget Range:</strong>
                                                <p>{selectedNotification.quotation.bookingDetails.budgetRange}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Photographer's Message */}
                                <div className="card mb-4">
                                    <div className="card-header bg-light">
                                        <h6 className="mb-0">Message from Photographer</h6>
                                    </div>
                                    <div className="card-body">
                                        <p>{selectedNotification?.quotation?.message || selectedNotification?.message || 'No message provided'}</p>
                                        <div className="mt-3">
                                            <strong>Expected Price:</strong>
                                            <p className="mb-0">
                                                {selectedNotification?.quotation?.expectedPrice || selectedNotification?.expectedPrice 
                                                    ? `₹${selectedNotification?.quotation?.expectedPrice || selectedNotification?.expectedPrice}`
                                                    : 'Price not specified'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Availability Confirmation */}
                                <div className="alert alert-success mb-4">
                                    <i className="fas fa-check-circle me-2"></i>
                                    The photographer has confirmed their availability for this booking
                                </div>
                            </div>

                            {/* Fixed Footer with Actions */}
                            <div className="modal-footer" style={{
                                borderTop: '1px solid #dee2e6',
                                backgroundColor: '#fff',
                                position: 'sticky',
                                bottom: 0,
                                zIndex: 1,
                                padding: '1rem'
                            }}>
                                <div className="d-flex justify-content-end gap-2 w-100">
                                    <button 
                                        className="btn btn-success"
                                        onClick={() => {
                                            handleAcceptPhotographer(
                                                selectedNotification._id,
                                                selectedNotification.photographerId,
                                                selectedNotification.photographerDetails.name
                                            );
                                            setSelectedNotification(null);
                                        }}
                                    >
                                        <i className="fas fa-check me-2"></i>
                                        Accept Photographer
                                    </button>
                                    <button 
                                        className="btn btn-danger"
                                        onClick={() => {
                                            handleDeclinePhotographer(
                                                selectedNotification._id,
                                                selectedNotification.photographerId,
                                                selectedNotification.photographerDetails.name
                                            );
                                            setSelectedNotification(null);
                                        }}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Decline
                                    </button>
                                </div>
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
                                            background: 'linear-gradient(135deg, #3A5F6F 0%, #5C90A3 100%)',
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
                                            background: 'linear-gradient(135deg, #7EA8B9 0%, #9FB8C6 100%)',
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
                                            background: 'linear-gradient(135deg, #9FB8C6 0%, #BFD1DA 100%)',
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
                                                                                                    toast.error('Missing photographer details. Please refresh and try again.');
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
                                                                                                    toast.error('Missing photographer details. Please refresh and try again.');
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
