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
                    setBookings([]);
                }
            } catch (error) {
                console.error('Failed to fetch bookings, using mock data:', error);
                // Create mock booking data
                setBookings([
                    {
                        id: '1',
                        photographyType: 'Wedding Photography',
                        date: '2024-05-15',
                        location: 'New Delhi',
                        status: 'Confirmed',
                        photographer: 'Rahul Sharma',
                        photographerRating: 4.8,
                        price: '₹45,000',
                        package: 'Premium'
                    }
                ]);
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
                    // If no photographers found, use empty array
                    setPhotographers([]);
                }
            } catch (error) {
                console.error('Failed to fetch photographers, using mock data:', error);
                setPhotographers([]);
            }
        } catch (error) {
            console.error('Failed to fetch data from API:', error);
            setBookings([]);
            setPhotographers([]);
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="dashboard-container" style={{ 
            minHeight: '100vh',
            width: '100%',
            margin: 0,
            padding: 0,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e2e6ea 100%)',
            overflowX: 'hidden'
        }}>
            {/* Header with Logout Button */}
            <div className="header d-flex justify-content-between align-items-center p-4 shadow-sm" style={{
                background: 'rgba(255, 255, 255, 0.9)',
                width: '100%',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <h1 className="m-0" style={{ fontWeight: 'bold', color: '#6200ea' }}>Photography Portal</h1>
                <div>
                    {user && (
                        <span className="mr-3 font-weight-bold">
                            <i className="fas fa-user-circle mr-1"></i>
                            Welcome, {user.name}
                        </span>
                    )}
                    <button 
                        className="btn mr-2" 
                        onClick={handleOpenPopup}
                        style={{ 
                            padding: '8px 20px',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            backgroundColor: '#6200ea',
                            color: 'white'
                        }}
                    >
                        <i className="fas fa-camera mr-2"></i>
                        Book Session
                    </button>
                    <button 
                        className="btn btn-danger" 
                        onClick={handleLogout}
                        style={{ 
                            padding: '8px 20px',
                            borderRadius: '5px',
                            fontWeight: 'bold'
                        }}
                    >
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="container-fluid py-4">
                <div className="row mx-2 mb-4">
                    <div className="col-12">
                        <h3 className="mb-3" style={{ color: '#6200ea' }}>
                            <i className="fas fa-calendar-check mr-2"></i>
                            My Bookings
                        </h3>
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
                                                fontWeight: 'bold'
                                            }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h5 className="m-0">{booking.photographyType}</h5>
                                                    <span className="badge badge-light">{booking.status}</span>
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
                                                        <div className="info-label" style={{ width: '140px', fontWeight: 'bold' }}>Photographer:</div>
                                                        <div>{booking.photographer}</div>
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
