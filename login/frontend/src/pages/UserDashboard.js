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
                const response = await axios.get(`http://localhost:8080/api/auth/users/${userId}`);
                setUser(response.data);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                // If there's an error, try a simpler approach - show basic user info
                setUser({ name: 'Test User' });
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
                    const formattedPhotographers = photographersResponse.data.map(photographer => ({
                        id: photographer._id,
                        name: photographer.name || 'Unknown',
                        specialization: photographer.specialization || 'General',
                        experience: photographer.experience || '2+ years',
                        rating: photographer.rating || 4.5,
                        priceRange: photographer.priceRange || '₹20,000 - ₹40,000',
                        location: photographer.location || 'Unknown',
                        portfolio: photographer.portfolio || '#',
                        imageUrl: photographer.imageUrl || 'https://randomuser.me/api/portraits/men/32.jpg'
                    }));
                    
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
        return [
            {
                id: '1',
                photographyType: 'Wedding Photography',
                date: '2024-05-15',
                location: 'New Delhi',
                status: 'Confirmed',
                photographer: 'Test Photographer',
                photographerRating: 4.8,
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
                name: 'Test Photographer',
                specialization: 'Wedding Photography',
                experience: '5+ years',
                rating: 4.8,
                priceRange: '₹30,000 - ₹50,000',
                location: 'New Delhi',
                portfolio: '#',
                imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            {
                id: '2',
                name: 'Jane Smith',
                specialization: 'Portrait Photography',
                experience: '3+ years',
                rating: 4.5,
                priceRange: '₹15,000 - ₹30,000',
                location: 'Mumbai',
                portfolio: '#',
                imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
            }
        ];
    };

    const handlePopupSubmit = async (formData) => {
        try {
            console.log("Form data received in UserDashboard:", formData);
            
            // Add user ID to the booking data
            const userId = localStorage.getItem('userId');
            const bookingData = {
                ...formData,
                userId,
                status: 'Pending',
                createdAt: new Date().toISOString()
            };
            
            // Post to API
            const response = await axios.post('http://localhost:8080/api/bookings', bookingData);
            
            if (response.status === 201) {
                alert('Booking saved successfully!');
                fetchData(); // Refresh bookings after new booking
            } else {
                alert('Failed to save booking. Please try again.');
            }
        } catch (error) {
            console.error('Error saving booking:', error.response?.data || error.message);
            alert('Failed to save booking. Please try again.');
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
                // Add to favorites
                const response = await axios.post(
                    'http://localhost:8080/api/users/favorites',
                    { photographerId },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                setFavoritePhotographers([...favoritePhotographers, response.data]);
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

    // Add an immediate notification to test the UI
    useEffect(() => {
        // Initialize with mock notification data for development
        const mockNotifications = [
            {
                _id: '1',
                message: 'Your booking has been accepted by Test Photographer. Your session is now confirmed!',
                createdAt: new Date().toISOString(),
                isRead: false,
                type: 'booking_accepted',
                bookingId: '1' // Match with first booking id in mock data
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
        
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(notif => !notif.isRead).length);
        
        // Show an alert for the unread notification
        const unreadNotification = mockNotifications.find(notif => !notif.isRead);
        if (unreadNotification) {
            showNotificationAlert(unreadNotification);
        }

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

    // Modified fetchNotifications to handle real-time updates
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
                
                if (Array.isArray(response.data)) {
                    // Check if we have new notifications
                    const currentNotifCount = unreadCount;
                    const newNotifications = response.data;
                    const newUnreadCount = newNotifications.filter(notif => !notif.isRead).length;
                    
                    // Update notifications state
                    setNotifications(newNotifications);
                    setUnreadCount(newUnreadCount);
                    
                    // If there are new notifications, show notification alert and refresh bookings
                    if (newUnreadCount > currentNotifCount) {
                        // Play notification sound or show toast
                        showNotificationAlert(newNotifications.filter(notif => !notif.isRead)[0]);
                        
                        // Refresh bookings to get latest status
                        fetchData();
                    }
                }
            } catch (error) {
                // Only log detailed errors during development, not in production
                if (process.env.NODE_ENV === 'development') {
                    console.error('Failed to fetch notifications from API:', error);
                }
                
                // We already have mock notifications loaded from useEffect, 
                // so we don't need to set them again here
            }
        } catch (error) {
            console.error('Failed to process notifications:', error);
        }
    };

    // Function to show notification alert
    const showNotificationAlert = (notification) => {
        // Create and show a toast or alert for the new notification
        if (notification.type === 'booking_accepted') {
            setAlertMessage({
                type: 'success',
                title: 'Booking Accepted!',
                message: notification.message
            });
            
            // Extract photographer name from notification message
            const messageRegex = /Your booking has been accepted by (.+)\./;
            const match = notification.message.match(messageRegex);
            const photographerName = match ? match[1] : 'Unknown';
            
            // Update the corresponding booking status and photographer
            if (notification.bookingId) {
                const updatedBookings = bookings.map(booking => 
                    booking.id === notification.bookingId || booking._id === notification.bookingId ? 
                    { ...booking, status: 'Confirmed', photographer: photographerName } : booking
                );
                setBookings(updatedBookings);
            }
        } else if (notification.type === 'booking_rejected') {
            setAlertMessage({
                type: 'danger',
                title: 'Booking Declined',
                message: notification.message
            });
            
            // Update the corresponding booking status
            if (notification.bookingId) {
                const updatedBookings = bookings.map(booking => 
                    booking.id === notification.bookingId || booking._id === notification.bookingId ? 
                    { ...booking, status: 'Cancelled' } : booking
                );
                setBookings(updatedBookings);
            }
        } else {
            setAlertMessage({
                type: 'info',
                title: 'New Notification',
                message: notification.message
            });
        }
        
        // Auto-hide alert after 5 seconds
        setTimeout(() => {
            setAlertMessage(null);
        }, 5000);
    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
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
            width: '100%',
            margin: 0,
            padding: 0,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            overflowX: 'hidden'
        }}>
            {/* Header - Navbar style */}
            <nav className="navbar navbar-expand-lg bg-dark text-white py-3 px-4 w-100">
              <div className="container-fluid d-flex justify-content-between align-items-center">

                {/* Left: Dashboard */}
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-2" style={{ width: '36px', height: '36px' }}>
                    <i className="fas fa-tachometer-alt text-white"></i>
                  </div>
                  <h4 className="mb-0 text-danger fw-bold">Dashboard</h4>
                </div>

                {/* Center: Welcome Text */}
                <div className="text-center">
                  {user && (
                    <h6 className="mb-0 text-light">Welcome, <span className="fw-semibold">{user.name}</span></h6>
                  )}
                </div>

                {/* Right: Notification, Book Session, Sign Out */}
                <div className="d-flex align-items-center">
                  <button 
                    className="btn btn-light rounded-circle me-3 p-2" 
                    style={{ width: '34px', height: '34px' }}
                    onClick={toggleNotifications}
                  >
                    <i className="fas fa-bell text-dark fa-sm"></i>
                    {unreadCount > 0 && (
                      <span className="badge badge-danger position-absolute" 
                            style={{ top: '-5px', right: '-5px', fontSize: '0.6rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button 
                    className="btn btn-sm btn-primary me-4 px-3"
                    onClick={handleOpenPopup}
                  >
                    <i className="fas fa-camera me-1"></i>Book Session
                  </button>
                  <button 
                    className="btn btn-sm btn-danger px-3"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-1"></i>Sign Out
                  </button>
                </div>

              </div>
            </nav>

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

            {/* Navigation Tabs */}
            <div className="container-fluid py-4">
                <div className="row mx-2 mb-4">
                    <div className="col-12">
                        <ul className="nav nav-tabs nav-fill">
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === "bookings" ? "active" : ""}`}
                                    onClick={() => setActiveTab("bookings")}
                                    style={{ 
                                        fontWeight: 'bold',
                                        color: activeTab === "bookings" ? '#6200ea' : '#495057',
                                        borderColor: activeTab === "bookings" ? '#dee2e6 #dee2e6 #fff' : '#dee2e6',
                                        borderBottom: activeTab === "bookings" ? '3px solid #6200ea' : 'none'
                                    }}
                                >
                                    <i className="fas fa-calendar-check mr-2"></i>
                                    My Bookings
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === "photographers" ? "active" : ""}`}
                                    onClick={() => setActiveTab("photographers")}
                                    style={{ 
                                        fontWeight: 'bold',
                                        color: activeTab === "photographers" ? '#6200ea' : '#495057',
                                        borderColor: activeTab === "photographers" ? '#dee2e6 #dee2e6 #fff' : '#dee2e6',
                                        borderBottom: activeTab === "photographers" ? '3px solid #6200ea' : 'none'
                                    }}
                                >
                                    <i className="fas fa-camera-retro mr-2"></i>
                                    Photographers
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === "favorites" ? "active" : ""}`}
                                    onClick={() => setActiveTab("favorites")}
                                    style={{ 
                                        fontWeight: 'bold',
                                        color: activeTab === "favorites" ? '#6200ea' : '#495057',
                                        borderColor: activeTab === "favorites" ? '#dee2e6 #dee2e6 #fff' : '#dee2e6',
                                        borderBottom: activeTab === "favorites" ? '3px solid #6200ea' : 'none'
                                    }}
                                >
                                    <i className="fas fa-heart mr-2"></i>
                                    Favorites
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

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
                                        <div className="card shadow-sm text-white" style={{ backgroundColor: '#6200ea' }}>
                                            <div className="card-body">
                                                <h5 className="card-title">Total Bookings</h5>
                                                <h2>{bookings.length}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card shadow-sm text-white bg-success">
                                            <div className="card-body">
                                                <h5 className="card-title">Confirmed</h5>
                                                <h2>{bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card shadow-sm text-white bg-warning">
                                            <div className="card-body">
                                                <h5 className="card-title">Pending</h5>
                                                <h2>{bookings.filter(b => b.status?.toLowerCase() === 'pending').length}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card shadow-sm text-white" style={{ backgroundColor: '#17a2b8' }}>
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
                                                    style={{ backgroundColor: '#6200ea', color: 'white' }}
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
                                    <h3 style={{ color: '#6200ea' }}>
                                        <i className="fas fa-camera-retro mr-2"></i>
                                        Top Photographers
                                    </h3>
                                    <p>Discover talented photographers for your next session.</p>
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
                                                        src={photographer.profileImage || "https://via.placeholder.com/300x200?text=Photographer"} 
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
                                    <h3 style={{ color: '#6200ea' }}>
                                        <i className="fas fa-heart mr-2"></i>
                                        My Favorite Photographers
                                    </h3>
                                    <p>Photographers you've saved for future bookings.</p>
                                </div>
                                
                                {favoritePhotographers.length > 0 ? (
                                    favoritePhotographers.map((photographer, index) => (
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
                                                        src={photographer.profileImage || "https://via.placeholder.com/300x200?text=Photographer"} 
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
                                    ))
                                ) : (
                                    <div className="col-12 text-center mt-5">
                                        <div className="alert alert-info p-5" style={{ background: 'rgba(98, 0, 234, 0.1)', border: '1px solid #6a11cb' }}>
                                            <i className="fas fa-heart-broken fa-3x mb-3" style={{ color: '#6a11cb' }}></i>
                                            <h4>No favorite photographers</h4>
                                            <p>You haven't added any photographers to your favorites yet.</p>
                                            <button 
                                                className="btn mt-2" 
                                                onClick={() => setActiveTab("photographers")}
                                                style={{ backgroundColor: '#6a11cb', color: 'white' }}
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

            {/* Footer */}
            <footer className="bg-dark text-white text-center py-3 mt-auto" style={{ width: '100%' }}>
                <p className="m-0">© 2024 Photography Portal. All rights reserved.</p>
            </footer>

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
