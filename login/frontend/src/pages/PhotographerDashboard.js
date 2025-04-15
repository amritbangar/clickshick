import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import sampleBookings from '../sampleData';

const PhotographerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [photographer, setPhotographer] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchPhotographerData = async () => {
    try {
      const token = localStorage.getItem('token');
      const photographerId = localStorage.getItem('userId');
      
      if (!token || !photographerId) {
        navigate('/login');
        return;
      }
      
      // Set auth header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      try {
        const response = await axios.get(`http://localhost:8080/api/auth/photographers/${photographerId}`);
        setPhotographer(response.data);
      } catch (error) {
        console.error('Failed to fetch photographer data:', error);
        // Fall back to mock data during development
        console.log('Using mock photographer data for development');
        setPhotographer({ 
          _id: photographerId,
          name: 'Test Photographer',
          email: 'photographer@example.com',
          category: 'photographer',
          specialization: 'Wedding Photography',
          experience: '5+ years',
          rating: 4.8,
          portfolio: '#'
        });
      }
    } catch (error) {
      console.error('Failed to set up authentication:', error);
      navigate('/login');
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const photographerId = localStorage.getItem('userId');
      // Try to fetch bookings for this photographer
      try {
        const response = await axios.get(`http://localhost:8080/api/bookings?photographerId=${photographerId}`, {
          timeout: 3000 // Set a 3 second timeout to fail fast when server is down
        });
        
        if (Array.isArray(response.data)) {
          setBookings(response.data);
        } else {
          // If no bookings found or invalid response, use sample data
          console.log('No bookings found or invalid response, using sample data');
          setBookings(generateMockBookings());
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch bookings from API, using sample data:', error);
        }
        // If API call fails, use sample data
        setBookings(generateMockBookings());
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings(generateMockBookings());
    } finally {
      setLoading(false);
    }
  };

  // Generate mock bookings
  const generateMockBookings = () => {
    return [
      {
        id: '1',
        photographyType: 'Wedding',
        date: '2024-05-20',
        location: 'New Delhi',
        decision: 'Pending',
        contactNumber: '9876543210',
        budgetRange: '₹30,000-₹50,000',
        userName: 'Amit Kumar',
        userId: 'user1'
      },
      {
        id: '2',
        photographyType: 'Portrait',
        date: '2024-06-15',
        location: 'Mumbai',
        decision: 'Pending',
        contactNumber: '8765432109',
        budgetRange: '₹15,000-₹25,000',
        userName: 'Priya Sharma',
        userId: 'user2'
      }
    ];
  };

  // Add immediate mock notifications
  useEffect(() => {
    // Initialize with mock notification data for development
    const mockNotifications = [
      {
        _id: '1',
        message: 'New booking request from Amit Kumar for Wedding Photography',
        createdAt: new Date().toISOString(),
        isRead: false,
        type: 'new_booking'
      },
      {
        _id: '2',
        message: 'Booking #1078 has been cancelled by the user',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        isRead: true,
        type: 'booking_cancelled'
      },
      {
        _id: '3',
        message: 'User Priya Sharma has left a 5-star review for your work',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        isRead: true,
        type: 'new_review'
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(notif => !notif.isRead).length);
    
    // Show notification alert for any unread notification
    if (notification === null) {
      const unreadNotif = mockNotifications.find(n => !n.isRead);
      if (unreadNotif) {
        setNotification({
          type: unreadNotif.type === 'new_booking' ? 'info' : 
                unreadNotif.type === 'booking_cancelled' ? 'warning' : 'success',
          message: unreadNotif.message
        });
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      }
    }

    // Setup polling for new notifications (after initial mock data is set)
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Check every 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(notificationInterval);
  }, []); // Only run once on component mount

  // Function to fetch photographer notifications
  const fetchNotifications = async () => {
    try {
      const photographerId = localStorage.getItem('userId');
      if (!photographerId) return;
      
      try {
        const response = await axios.get(`http://localhost:8080/api/notifications?photographerId=${photographerId}`, {
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
          
          // If there are new notifications, refresh bookings
          if (newUnreadCount > currentNotifCount) {
            // Refresh bookings to get latest status
            fetchBookings();
          }
        }
      } catch (error) {
        // Only log detailed errors during development
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch notifications from API:', error);
        }
        // We already have mock notifications loaded from useEffect
      }
    } catch (error) {
      console.error('Failed to process notifications:', error);
    }
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
      const photographerId = localStorage.getItem('userId');
      if (!photographerId) return;
      
      await axios.put(`http://localhost:8080/api/notifications/read-all/${photographerId}`, {}, {
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

  useEffect(() => {
    fetchPhotographerData();
    fetchBookings();
  }, []);

  const handleAcceptBooking = async (bookingId, userId) => {
    try {
      // Update the loading state to show something is happening
      setLoading(true);
      
      // 1. Update booking status
      const response = await axios.put(`http://localhost:8080/api/bookings/${bookingId}`, {
        status: 'Confirmed',
        decision: 'Confirmed',
        photographer: photographer?.name || 'Test Photographer',
      });
      
      // 2. Send notification to user
      const notificationResponse = await axios.post('http://localhost:8080/api/notifications', {
        userId,
        photographerId: photographer?._id || localStorage.getItem('userId'),
        message: `Your booking has been accepted by ${photographer?.name || 'Test Photographer'}. Your session is now confirmed!`,
        bookingId,
        type: 'booking_accepted'
      });
      
      console.log('Notification sent:', notificationResponse.data);
      
      // 3. Show success message
      setNotification({
        type: 'success',
        message: `Booking accepted! A notification has been sent to ${bookings.find(b => b._id === bookingId || b.id === bookingId)?.userName || 'the user'}.`
      });
      
      // 4. Update local booking list
      const updatedBookings = bookings.map(booking => 
        booking._id === bookingId || booking.id === bookingId ? 
        { ...booking, status: 'Confirmed', decision: 'Confirmed', photographer: photographer?.name || 'Test Photographer' } : booking
      );
      setBookings(updatedBookings);
      
    } catch (error) {
      console.error('Error accepting booking:', error);
      setNotification({
        type: 'error',
        message: 'Failed to accept booking. Please try again.'
      });
    } finally {
      // Hide loading state
      setLoading(false);
      
      // 5. Hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };
  
  const handleRejectBooking = async (bookingId, userId) => {
    try {
      // Update the loading state
      setLoading(true);
      
      // 1. Update booking status
      const response = await axios.put(`http://localhost:8080/api/bookings/${bookingId}`, {
        status: 'Cancelled',
        decision: 'Cancelled',
      });
      
      // 2. Send notification to user
      const notificationResponse = await axios.post('http://localhost:8080/api/notifications', {
        userId,
        photographerId: photographer?._id || localStorage.getItem('userId'),
        message: `Your booking request has been declined by ${photographer?.name || 'the photographer'}. Please choose another photographer.`,
        bookingId,
        type: 'booking_rejected'
      });
      
      console.log('Notification sent:', notificationResponse.data);
      
      // 3. Show success message
      setNotification({
        type: 'info',
        message: `Booking declined. A notification has been sent to ${bookings.find(b => b._id === bookingId || b.id === bookingId)?.userName || 'the user'}.`
      });
      
      // 4. Update local booking list
      const updatedBookings = bookings.map(booking => 
        booking._id === bookingId || booking.id === bookingId ? 
        { ...booking, status: 'Cancelled', decision: 'Cancelled' } : booking
      );
      setBookings(updatedBookings);
      
    } catch (error) {
      console.error('Error rejecting booking:', error);
      setNotification({
        type: 'error',
        message: 'Failed to decline booking. Please try again.'
      });
    } finally {
      // Hide loading state
      setLoading(false);
      
      // 5. Hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userCategory');
    navigate('/login');
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
            {photographer && (
              <h6 className="mb-0 text-light">Welcome, <span className="fw-semibold">{photographer.name}</span></h6>
            )}
          </div>

          {/* Right: Notification, Explore, Sign Out */}
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-light rounded-circle me-3 p-2" 
              style={{ width: '34px', height: '34px' }}
              onClick={() => setShowNotifications(!showNotifications)}
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
              onClick={() => window.location.href = '/explore'}
            >
              <i className="fas fa-camera me-1"></i>Explore
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
      {notification && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show m-3`} role="alert">
          <strong>{notification.type === 'success' ? 'Success!' : notification.type === 'error' ? 'Error!' : 'Note:'}</strong> {notification.message}
          <button type="button" className="close" onClick={() => setNotification(null)}>
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
              
              {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                      <div 
                          key={index} 
                          className={`notification-item p-2 mb-2 rounded ${!notification.isRead ? 'bg-light' : ''}`}
                          onClick={() => markAsRead(notification._id)}
                          style={{ cursor: 'pointer' }}
                      >
                          <div className="d-flex">
                              <div className="mr-3">
                                  {notification.type === 'new_booking' ? (
                                      <i className="fas fa-calendar-plus text-primary fa-lg"></i>
                                  ) : notification.type === 'booking_cancelled' ? (
                                      <i className="fas fa-calendar-times text-danger fa-lg"></i>
                                  ) : (
                                      <i className="fas fa-info-circle text-info fa-lg"></i>
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

      {/* Main Content */}
      <div className="container-fluid py-4">
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-3">Loading your bookings...</p>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="row mx-2 mb-4">
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card shadow-sm text-white bg-info">
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
                    <h2>{bookings.filter(b => b.decision?.toLowerCase() === 'confirmed').length}</h2>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card shadow-sm text-white" style={{ backgroundColor: '#17a2b8' }}>
                  <div className="card-body">
                    <h5 className="card-title">Likely</h5>
                    <h2>{bookings.filter(b => b.decision?.toLowerCase() === 'likely').length}</h2>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card shadow-sm text-white bg-warning">
                  <div className="card-body">
                    <h5 className="card-title">Pending</h5>
                    <h2>{bookings.filter(b => b.decision?.toLowerCase() === 'pending').length}</h2>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs for different booking statuses */}
            <div className="row mx-2 mb-4">
              <div className="col-12">
                <ul className="nav nav-tabs nav-fill">
                  <li className="nav-item">
                    <button 
                      className={`nav-link active`}
                      style={{ 
                        fontWeight: 'bold',
                        color: '#6200ea',
                        borderBottom: '3px solid #6200ea'
                      }}
                    >
                      <i className="fas fa-list-alt mr-2"></i>
                      All Bookings
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Bookings Card Grid */}
            <div className="row mx-2">
              {bookings.length > 0 ? (
                bookings.map((booking, index) => (
                  <div key={index} className="col-xl-3 col-lg-4 col-md-6 mb-4">
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
                        background: getStatusColor(booking.decision),
                        color: '#fff',
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        padding: '0.75rem 1rem'
                      }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{booking.photographyType}</span>
                          <span className="badge bg-light text-dark px-2 py-1">{booking.decision}</span>
                        </div>
                        <div className="small">
                          <i className="fas fa-user-circle me-1"></i> {booking.userName || 'Anonymous User'}
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="booking-info">
                          <div className="d-flex mb-2">
                            <div className="info-label" style={{ width: '140px', fontWeight: 'bold' }}>Client:</div>
                            <div>{booking.userName || 'Anonymous User'}</div>
                          </div>
                          <div className="d-flex mb-2">
                            <div className="info-label" style={{ width: '140px', fontWeight: 'bold' }}>Date:</div>
                            <div>{booking.date}</div>
                          </div>
                          <div className="d-flex mb-2">
                            <div className="info-label" style={{ width: '140px', fontWeight: 'bold' }}>Location:</div>
                            <div>{booking.location}</div>
                          </div>
                          <div className="d-flex mb-2">
                            <div className="info-label" style={{ width: '140px', fontWeight: 'bold' }}>Contact Number:</div>
                            <div>{booking.contactNumber}</div>
                          </div>
                          {booking.budgetRange && (
                            <div className="d-flex mb-2">
                              <div className="info-label" style={{ width: '140px', fontWeight: 'bold' }}>Budget Range:</div>
                              <div>{booking.budgetRange}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="card-footer bg-white d-flex justify-content-between" style={{ borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="fas fa-phone-alt mr-1"></i> Call
                        </button>
                        
                        {(booking.status?.toLowerCase() === 'pending' || booking.decision?.toLowerCase() === 'pending') && (
                          <div>
                            <button 
                              className="btn btn-sm btn-success mr-2"
                              onClick={() => handleAcceptBooking(booking._id || booking.id, booking.userId)}
                            >
                              <i className="fas fa-check-circle mr-1"></i> Accept
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRejectBooking(booking._id || booking.id, booking.userId)}
                            >
                              <i className="fas fa-times-circle mr-1"></i> Decline
                            </button>
                          </div>
                        )}
                        
                        {(booking.status?.toLowerCase() === 'confirmed' || booking.decision?.toLowerCase() === 'confirmed') && (
                          <button className="btn btn-sm btn-outline-success">
                            <i className="fas fa-calendar-check mr-1"></i> Confirmed
                          </button>
                        )}
                        
                        {(booking.status?.toLowerCase() === 'cancelled' || booking.decision?.toLowerCase() === 'cancelled') && (
                          <button className="btn btn-sm btn-outline-danger" disabled>
                            <i className="fas fa-ban mr-1"></i> Cancelled
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center mt-5">
                  <div className="alert alert-info p-5">
                    <h4>No bookings available</h4>
                    <p>You don't have any photography bookings yet.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto" style={{ width: '100%' }}>
        <p className="m-0">© 2024 Photographer Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Function to determine status color based on decision
const getStatusColor = (decision) => {
  switch (decision?.toLowerCase()) {
    case 'confirmed':
      return '#28a745'; // green
    case 'likely':
      return '#17a2b8'; // blue
    case 'pending':
      return '#ffc107'; // yellow
    case 'cancelled':
      return '#dc3545'; // red
    default:
      return '#6c757d'; // gray
  }
};

export default PhotographerDashboard;
