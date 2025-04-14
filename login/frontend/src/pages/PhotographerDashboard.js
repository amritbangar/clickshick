import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import sampleBookings from '../sampleData';

const PhotographerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Try to fetch from API first
      const response = await axios.get('http://localhost:8080/api/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings from API, using sample data:', error);
      // If API call fails, use sample data
      setBookings(sampleBookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove the authentication token
    navigate('/login'); // Redirect to the login page
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
      {/* Header with Logout Button */}
      <div className="header d-flex justify-content-between align-items-center p-4 shadow-sm" style={{
        background: 'rgba(255, 255, 255, 0.9)',
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <h1 className="m-0" style={{ fontWeight: 'bold', color: '#333' }}>Photographer Dashboard</h1>
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
          Logout
        </button>
      </div>

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
                        fontWeight: 'bold'
                      }}>
                        <h5 className="m-0">{booking.photographyType} Photography</h5>
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
                            <div className="info-label" style={{ width: '140px', fontWeight: 'bold' }}>Decision:</div>
                            <div>
                              <span className="badge" style={{ 
                                background: getStatusColor(booking.decision),
                                padding: '5px 10px'
                              }}>
                                {booking.decision}
                              </span>
                            </div>
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
                        <button className="btn btn-sm btn-outline-success">
                          <i className="fas fa-calendar-check mr-1"></i> Accept
                        </button>
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
