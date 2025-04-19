import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PinCodePopup from '../components/PinCodePopup';
import bookingsService from '../services/BookingsService';
import BookingAnalytics from '../components/BookingAnalytics';
import '../styles/reset.css';

const PhotographerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [photographer, setPhotographer] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPinCodePopup, setShowPinCodePopup] = useState(false);
  const [currentPinCode, setCurrentPinCode] = useState('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebugTab, setShowDebugTab] = useState('actions');
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewAllBookings, setViewAllBookings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [showAllMongoDBBookings, setShowAllMongoDBBookings] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300000); // Default: 5 minutes instead of 1 minute
  const [refreshTimerId, setRefreshTimerId] = useState(null);
  const [showAutoRefreshOptions, setShowAutoRefreshOptions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastFilterSettings, setLastFilterSettings] = useState({
    pinCode: '',
    viewAll: false
  });
  const navigate = useNavigate();

  // Add debug log function
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const log = { timestamp, message, type };
    setDebugLogs(prevLogs => [log, ...prevLogs].slice(0, 50)); // Keep last 50 logs
    console.log(`[DEBUG ${timestamp}] ${message}`);
  };

  // Function to start auto-refresh interval
  const startAutoRefresh = () => {
    if (refreshTimerId) {
      clearInterval(refreshTimerId);
    }
    
    addDebugLog(`Starting auto-refresh every ${refreshInterval/1000} seconds`, 'info');
    
    const timerId = setInterval(() => {
      addDebugLog('Auto-refresh triggered', 'info');
      
      // Save current filter settings before refresh
      const currentSettings = {
        pinCode: currentPinCode,
        viewAll: viewAllBookings
      };
      setLastFilterSettings(currentSettings);
      
      // Fetch data with current filter settings
      fetchData();
      
      // Update last refresh time
      setLastRefreshTime(new Date());
    }, refreshInterval);
    
    setRefreshTimerId(timerId);
  };

  // Add fullscreen toggle function
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    // Check if photographer is logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userCategory = localStorage.getItem('userCategory');
    
    if (!token || !userId || userCategory !== 'photographer') {
      navigate('/login');
      return;
    }

    // Initialize photographer data and fetch bookings
    fetchPhotographerData();
    
    // Set up timer for auto-refresh if enabled
    if (autoRefreshEnabled) {
      startAutoRefresh();
    }
    
    // Load saved PIN code from localStorage on component mount
    const savedPinCode = localStorage.getItem('pinCode');
    if (savedPinCode) {
      setCurrentPinCode(savedPinCode);
      addDebugLog(`Loaded saved PIN code from localStorage: ${savedPinCode}`, 'info');
    }
    
    return () => {
      // Clean up timer on component unmount
      if (refreshTimerId) {
        clearInterval(refreshTimerId);
      }
    };
  }, [navigate, autoRefreshEnabled]);

  // Handle immediate updates when filter settings change
  useEffect(() => {
    // Only trigger this effect if values have been initialized
    if (lastFilterSettings.pinCode !== undefined) {
      const filterChanged = 
        lastFilterSettings.pinCode !== currentPinCode || 
        lastFilterSettings.viewAll !== viewAllBookings;
        
      // Save new filter settings
      setLastFilterSettings({
        pinCode: currentPinCode,
        viewAll: viewAllBookings
      });
      
      // If filter changed, refetch data
      if (filterChanged) {
        addDebugLog('Filter settings changed, refreshing data...', 'info');
        fetchData();
      }
    }
  }, [currentPinCode, viewAllBookings]);

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

  const fetchData = async () => {
    addDebugLog('action', 'Fetching booking data...');
    setLoading(true);
    
    try {
    const photographerId = localStorage.getItem('userId');
      if (!photographerId) {
        throw new Error('Photographer ID not found in localStorage');
      }
      
      let bookingsData = [];
      
      // First try to fetch all bookings that match this photographer's service area (pin code)
      if (currentPinCode && !viewAllBookings) {
        try {
          addDebugLog('info', `Fetching bookings for pin code: ${currentPinCode}`);
          const response = await axios.get(`http://localhost:8080/api/bookings?pinCode=${currentPinCode}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            timeout: 5000
          });
          
          if (response.data && Array.isArray(response.data)) {
            // Only include bookings with matching PIN code
            bookingsData = response.data.filter(booking => booking.pinCode === currentPinCode);
            addDebugLog('success', `Found ${bookingsData.length} bookings for pin code ${currentPinCode}`);
          }
        } catch (pinCodeError) {
          addDebugLog('error', `Failed to fetch bookings by pin code: ${pinCodeError.message}`);
        }
      } else {
        // If no pin code specified or viewing all bookings, fetch all pending bookings
        addDebugLog('info', 'Fetching all available bookings...');
        
        try {
          const response = await axios.get('http://localhost:8080/api/bookings', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            timeout: 5000
          });
          
          if (response.data && Array.isArray(response.data)) {
            bookingsData = response.data;
            addDebugLog('success', `Total bookings retrieved: ${bookingsData.length}`);
          }
        } catch (allBookingsError) {
          addDebugLog('error', `Failed to fetch all bookings: ${allBookingsError.message}`);
        }
      }
      
      // Also fetch bookings assigned specifically to this photographer
      try {
        const assignedResponse = await axios.get(`http://localhost:8080/api/bookings?photographerId=${photographerId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          timeout: 5000
        });
        
        if (assignedResponse.data && Array.isArray(assignedResponse.data)) {
          // Add bookings that weren't already added
          const assignedBookings = assignedResponse.data.filter(booking => 
            !bookingsData.some(existing => existing._id === booking._id)
          );
          
          if (assignedBookings.length > 0) {
            bookingsData = [...bookingsData, ...assignedBookings];
            addDebugLog('info', `Added ${assignedBookings.length} bookings assigned to you`);
          }
        }
      } catch (assignedError) {
        addDebugLog('error', `Failed to fetch assigned bookings: ${assignedError.message}`);
      }
      
      // Apply PIN code filter to all data if filter is active and not in "view all" mode
      if (currentPinCode && !viewAllBookings) {
        const filteredBookings = bookingsData.filter(booking => booking.pinCode === currentPinCode);
        
        if (filteredBookings.length < bookingsData.length) {
          addDebugLog('info', `Filtered ${bookingsData.length} bookings down to ${filteredBookings.length} that match PIN code ${currentPinCode}`);
          bookingsData = filteredBookings;
        }
      }
      
      // Sort bookings by date (newest first)
      bookingsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Update state with the bookings
      setBookings(bookingsData);
      setLastRefreshTime(new Date());
      addDebugLog('success', `Successfully loaded ${bookingsData.length} bookings`);
      
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      addDebugLog('error', `Failed to fetch bookings: ${error.message}`);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: 'Failed to fetch bookings. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Pin code functions
  const handlePinCodeChange = () => {
    setShowPinCodePopup(true);
  };
  
  const handlePinCodeSubmit = (pinCode) => {
    // Save the pin code to localStorage
    localStorage.setItem('pinCode', pinCode);
    addDebugLog(`Saved new pin code to localStorage: ${pinCode}`, 'info');
    setCurrentPinCode(pinCode);
    
    // When setting a new PIN code, automatically turn off "view all" mode
    if (viewAllBookings) {
      setViewAllBookings(false);
      addDebugLog('Disabled View All Bookings mode due to new PIN code filter', 'info');
    }
    
    // Refresh bookings with the new pin code
    addDebugLog('Refreshing bookings with new pin code...', 'info');
    fetchData();
    
    // Close the popup
    setShowPinCodePopup(false);
    
    // Show a notification
    setNotification({
      type: 'success',
      message: `Pin code updated to ${pinCode}. Showing bookings for this area only.`
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  const handlePinCodeClear = () => {
    // Remove the pin code from localStorage
    localStorage.removeItem('pinCode');
    addDebugLog('Cleared pin code from localStorage', 'info');
    setCurrentPinCode('');
    setViewAllBookings(false);
    
    // Refresh bookings without pin code filter
    addDebugLog('Refreshing bookings without pin code filter...', 'info');
    fetchData();
    
    // Close the popup
    setShowPinCodePopup(false);
    
    // Show a notification
    setNotification({
      type: 'info',
      message: 'Pin code filter cleared. Showing all bookings.'
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Update the force refresh function to maintain filter settings
  const handleForceRefresh = () => {
    console.log("Forcing bookings refresh...");
    addDebugLog('Force refresh requested by user', 'info');
    
    // Save current filter settings
    setLastFilterSettings({
      pinCode: currentPinCode,
      viewAll: viewAllBookings
    });
    
    // Show loading notification
    setNotification({
      type: 'info',
      message: 'Refreshing bookings data...'
    });
    
    // Fetch fresh data
    fetchData();
    
    // Update last refresh time
    const currentTime = new Date().toLocaleTimeString();
    setLastRefreshTime(currentTime);
    addDebugLog(`Updated last refresh time to ${currentTime}`, 'info');
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Toggle debug panel
  const toggleDebugPanel = () => {
    setShowDebugInfo(!showDebugInfo);
    addDebugLog(showDebugInfo ? 'Debug panel hidden' : 'Debug panel shown', 'info');
  };

  // Test API connection for pin code filtering
  const testApiConnection = async () => {
    addDebugLog('Testing API connection for pin code filtering...', 'info');
    
    try {
      // Get the current pin code if any
      const pinCode = localStorage.getItem('pinCode') || '110001'; // Default to Delhi if none set
      
      addDebugLog(`Testing connection with PIN code: ${pinCode}`, 'info');
      
      // Use BookingsService to test connection
      const result = await bookingsService.testConnection(pinCode);
      
      if (result.success) {
        addDebugLog(`API connection test succeeded: ${result.message}`, 'success');
        if (result.details) {
          addDebugLog(`API response details: ${JSON.stringify(result.details)}`, 'info');
        }
        
        setNotification({
          type: 'success',
          message: 'API connection test successful!'
        });
      } else {
        addDebugLog(`API connection test failed: ${result.message}`, 'error');
        
        setNotification({
          type: 'warning',
          message: 'API connection test failed. Check debug logs for details.'
        });
      }
    } catch (error) {
      addDebugLog(`API connection test failed with exception: ${error.message}`, 'error');
      
      setNotification({
        type: 'error',
        message: 'API connection test failed. Backend may be offline.'
      });
    }
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
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
            fetchData();
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
    fetchData();
  }, []);

  const handleAcceptBooking = async (bookingId, userId) => {
    try {
      // Make sure we have a valid booking ID and user ID
      if (!bookingId) {
        console.error('Missing booking ID for acceptance');
        setNotification({
          type: 'error',
          message: 'Cannot accept booking: Missing booking ID'
        });
        return;
      }
      
      // Update the loading state to show something is happening
      setLoading(true);
      
      // Find the booking in our local state
      const bookingToAccept = bookings.find(b => 
        (b._id && b._id === bookingId) || (b.id && b.id === bookingId)
      );
      
      if (!bookingToAccept) {
        console.error(`Cannot find booking with ID ${bookingId}`);
        setNotification({
          type: 'error',
          message: 'Cannot accept booking: Booking not found'
        });
        setLoading(false);
        return;
      }
      
      // Use the user ID from the booking if not provided
      const targetUserId = userId || bookingToAccept.userId;
      
      console.log(`Accepting booking ${bookingId} for user ${targetUserId}`);
      
      try {
        // 1. Update booking status
        const response = await axios.put(`http://localhost:8080/api/bookings/${bookingId}`, {
          status: 'Confirmed',
          decision: 'Confirmed',
          photographer: photographer?.name || 'Test Photographer',
        });
        
        console.log('Booking status updated:', response.data);
      } catch (apiError) {
        console.warn('API error when updating booking, continuing with local update:', apiError);
        // Continue with the process even if the API call fails in development
      }
      
      try {
        // 2. Send notification to user
        const notificationResponse = await axios.post('http://localhost:8080/api/notifications', {
          userId: targetUserId,
          photographerId: photographer?._id || localStorage.getItem('userId'),
          message: `Your booking has been accepted by ${photographer?.name || 'Test Photographer'}. Your session is now confirmed!`,
          bookingId,
          type: 'booking_accepted'
        });
        
        console.log('Notification sent:', notificationResponse.data);
      } catch (notifError) {
        console.warn('API error when sending notification:', notifError);
        // Continue even if notification sending fails
      }
      
      // 3. Show success message
      setNotification({
        type: 'success',
        message: `Booking accepted! A notification has been sent to ${bookingToAccept.userName || 'the user'}.`
      });
      
      // 4. Update local booking list
      const updatedBookings = bookings.map(booking => 
        (booking._id === bookingId || booking.id === bookingId) ? 
        { 
          ...booking, 
          status: 'Confirmed', 
          decision: 'Confirmed', 
          photographer: photographer?.name || 'Test Photographer' 
        } : booking
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
      // Make sure we have a valid booking ID
      if (!bookingId) {
        console.error('Missing booking ID for rejection');
        setNotification({
          type: 'error',
          message: 'Cannot decline booking: Missing booking ID'
        });
        return;
      }
      
      // Update the loading state
      setLoading(true);
      
      // Find the booking in our local state
      const bookingToReject = bookings.find(b => 
        (b._id && b._id === bookingId) || (b.id && b.id === bookingId)
      );
      
      if (!bookingToReject) {
        console.error(`Cannot find booking with ID ${bookingId}`);
        setNotification({
          type: 'error',
          message: 'Cannot decline booking: Booking not found'
        });
        setLoading(false);
        return;
      }
      
      // Use the user ID from the booking if not provided
      const targetUserId = userId || bookingToReject.userId;
      
      console.log(`Declining booking ${bookingId} for user ${targetUserId}`);
      
      try {
        // 1. Update booking status
        const response = await axios.put(`http://localhost:8080/api/bookings/${bookingId}`, {
          status: 'Cancelled',
          decision: 'Cancelled',
        });
        
        console.log('Booking status updated:', response.data);
      } catch (apiError) {
        console.warn('API error when updating booking, continuing with local update:', apiError);
        // Continue with the process even if the API call fails in development
      }
      
      try {
        // 2. Send notification to user
        const notificationResponse = await axios.post('http://localhost:8080/api/notifications', {
          userId: targetUserId,
          photographerId: photographer?._id || localStorage.getItem('userId'),
          message: `Your booking request has been declined by ${photographer?.name || 'the photographer'}. Please choose another photographer.`,
          bookingId,
          type: 'booking_rejected'
        });
        
        console.log('Notification sent:', notificationResponse.data);
      } catch (notifError) {
        console.warn('API error when sending notification:', notifError);
        // Continue even if notification sending fails
      }
      
      // 3. Show success message
      setNotification({
        type: 'info',
        message: `Booking declined. A notification has been sent to ${bookingToReject.userName || 'the user'}.`
      });
      
      // 4. Update local booking list
      const updatedBookings = bookings.map(booking => 
        (booking._id === bookingId || booking.id === bookingId) ? 
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

  // Get statistics on bookings by pin code
  const getBookingsByPinCode = () => {
    // Get a list of pin codes from all bookings
    const pinCodeMap = {};
    
    // Count bookings by pin code
    bookings.forEach(booking => {
      const pinCode = booking.pinCode || 'unknown';
      if (pinCodeMap[pinCode]) {
        pinCodeMap[pinCode].count++;
      } else {
        // Try to get area name from PinCodePopup's popularPinCodes
        let area = 'Unknown Area';
        if (pinCode !== 'unknown') {
          // This is a simplification - in a real app, you'd likely have a service for this
          const popularPinCodes = [
            { code: '110001', area: 'New Delhi (Connaught Place)' },
            { code: '400001', area: 'Mumbai (Fort)' },
            { code: '560001', area: 'Bangalore (MG Road)' },
            { code: '600001', area: 'Chennai (George Town)' },
            { code: '700001', area: 'Kolkata (BBD Bagh)' }
          ];
          
          const match = popularPinCodes.find(p => p.code === pinCode);
          if (match) {
            area = match.area;
          } else {
            area = booking.location || 'Unknown Area';
          }
        }
        
        pinCodeMap[pinCode] = {
          pinCode: pinCode,
          area: area,
          count: 1
        };
      }
    });
    
    // Convert to array and sort by count (descending)
    return Object.values(pinCodeMap).sort((a, b) => b.count - a.count);
  };
  
  // Switch to a different pin code quickly from the debug panel
  const handleQuickPinCodeSwitch = (pinCode) => {
    if (pinCode === 'unknown') {
      addDebugLog('Cannot switch to unknown pin code', 'warning');
      return;
    }
    
    addDebugLog(`Quick-switching to pin code: ${pinCode}`, 'info');
    
    // Save pin code to localStorage
    localStorage.setItem('pinCode', pinCode);
    setCurrentPinCode(pinCode);
    
    // Refresh bookings
    fetchData();
    
    // Show notification
    setNotification({
      type: 'info',
      message: `Switched to pin code: ${pinCode}`
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Helper function to determine status color for badges
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Function to handle viewing booking details
  const handleViewBookingDetails = (booking) => {
    // Set the selected booking for the modal
    setSelectedBooking(booking);
    setShowDetailsModal(true);
    addDebugLog(`Viewing details for booking ID: ${booking.id || booking._id}`, 'info');
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  // Function to display booking details
  const renderBookingDetails = (booking) => {
    if (!booking) return <div>No booking selected</div>;
    
    const isPending = 
      booking.status?.toLowerCase() === 'pending' || 
      booking.decision?.toLowerCase() === 'pending' || 
      booking.status?.toLowerCase() === 'not sure' || 
      booking.decision?.toLowerCase() === 'not sure' ||
      (booking.status === undefined && booking.decision === undefined);
    
    const isConfirmed = 
      booking.status?.toLowerCase() === 'confirmed' || 
      booking.decision?.toLowerCase() === 'confirmed';
    
    const isCancelled = 
      booking.status?.toLowerCase() === 'cancelled' || 
      booking.decision?.toLowerCase() === 'cancelled';
    
    return (
      <div className="booking-details-modal p-4">
        <h4 className="text-center mb-4">{booking.photographyType} Booking Details</h4>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <h5 className="text-muted mb-2">Client Information</h5>
            <p><strong>Name:</strong> {booking.userName || 'Not specified'}</p>
            <p><strong>Email:</strong> {booking.userContactEmail || booking.email || 'Not provided'}</p>
            <p><strong>Contact:</strong> {booking.contactNumber || booking.userContactPhone || 'Not provided'}</p>
            {booking.userId && (
              <p><strong>User ID:</strong> {booking.userId}</p>
            )}
            {booking.createdAt && (
              <p><strong>Booked On:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
            )}
          </div>
          <div className="col-md-6">
            <h5 className="text-muted mb-2">Session Details</h5>
            <p><strong>Date:</strong> {booking.date || 'Not specified'}</p>
            <p><strong>Location:</strong> {booking.location || 'Not specified'}</p>
            <p><strong>PIN Code:</strong> {booking.pinCode || 'Not specified'}</p>
            {booking.formats && (
              <p><strong>Formats:</strong> {booking.formats}</p>
            )}
            {booking.duration && (
              <p><strong>Duration:</strong> {booking.duration}</p>
            )}
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <h5 className="text-muted mb-2">Photography Details</h5>
            <p><strong>Type:</strong> {booking.photographyType || 'General'}</p>
            <p><strong>Budget Range:</strong> {booking.budgetRange || booking.budget || 'Not specified'}</p>
            {booking.preferences && (
              <p><strong>Preferences:</strong> {booking.preferences}</p>
            )}
            {booking.additionalServices && (
              <p><strong>Additional Services:</strong> {booking.additionalServices}</p>
            )}
          </div>
          <div className="col-md-6">
            <h5 className="text-muted mb-2">Booking Status</h5>
            <p><strong>Status:</strong> <span className={`badge bg-${getStatusColor(booking.status || booking.decision)}`}>{booking.status || booking.decision || 'Pending'}</span></p>
            <p><strong>Decision:</strong> {booking.decision || 'Not specified'}</p>
            <p><strong>Created:</strong> {new Date(booking.createdAt).toLocaleString() || 'Not specified'}</p>
            {booking.lastUpdated && (
              <p><strong>Last Updated:</strong> {new Date(booking.lastUpdated).toLocaleString()}</p>
            )}
          </div>
        </div>
        
        {booking.notes && (
          <div className="row mb-3">
            <div className="col-12">
              <h5 className="text-muted mb-2">Special Notes</h5>
              <div className="p-3 bg-light rounded">
                {booking.notes}
              </div>
            </div>
          </div>
        )}
        
        {isPending && !isConfirmed && !isCancelled && (
          <div className="d-flex justify-content-between gap-3 mt-4 mb-2">
            <button 
              className="btn btn-primary flex-grow-1"
              onClick={handleCloseModal}
            >
              <i className="fas fa-arrow-left me-1"></i> Back
            </button>
            <button 
              className="btn btn-success flex-grow-1"
              onClick={() => {
                handleAcceptBooking(booking._id || booking.id, booking.userId);
                handleCloseModal();
              }}
            >
              <i className="fas fa-check-circle me-1"></i> Accept
            </button>
            <button 
              className="btn btn-danger flex-grow-1"
              onClick={() => {
                handleRejectBooking(booking._id || booking.id, booking.userId);
                handleCloseModal();
              }}
            >
              <i className="fas fa-times-circle me-1"></i> Decline
            </button>
          </div>
        )}
        
        {isConfirmed && (
          <div className="d-flex justify-content-between gap-3 mt-4 mb-2">
            <button 
              className="btn btn-primary flex-grow-1"
              onClick={handleCloseModal}
            >
              <i className="fas fa-arrow-left me-1"></i> Back
            </button>
            <button 
              className="btn btn-outline-success flex-grow-1"
              disabled
            >
              <i className="fas fa-calendar-check me-1"></i> Already Confirmed
            </button>
          </div>
        )}
        
        {isCancelled && (
          <div className="d-flex justify-content-between gap-3 mt-4 mb-2">
            <button 
              className="btn btn-primary flex-grow-1"
              onClick={handleCloseModal}
            >
              <i className="fas fa-arrow-left me-1"></i> Back
            </button>
            <button 
              className="btn btn-outline-danger flex-grow-1"
              disabled
            >
              <i className="fas fa-ban me-1"></i> Booking Cancelled
            </button>
          </div>
        )}
      </div>
    );
  };

  // Add function to toggle view all bookings mode
  const toggleViewAllBookings = () => {
    const newValue = !viewAllBookings;
    setViewAllBookings(newValue);
    
    addDebugLog(`${newValue ? 'Activated' : 'Deactivated'} View All Bookings mode`, 'info');
    
    // Refresh bookings with the updated filter setting
    fetchData();
    
    // Show notification
    setNotification({
      type: 'info',
      message: newValue 
        ? 'Now showing bookings from all areas' 
        : `Filtered to PIN code: ${currentPinCode}`
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Auto-refresh functionality
  useEffect(() => {
    // Clear any existing interval when the effect runs
    if (refreshTimerId) {
      clearInterval(refreshTimerId);
    }
    
    // Set up auto-refresh if enabled
    if (autoRefreshEnabled) {
      addDebugLog(`Auto-refresh enabled - Will refresh every ${refreshInterval/1000} seconds`, 'info');
      const timerId = setInterval(() => {
        addDebugLog('Auto-refresh triggered', 'info');
        fetchData();
        // Update last refresh time
        const currentTime = new Date().toLocaleTimeString();
        setLastRefreshTime(currentTime);
      }, refreshInterval);
      
      setRefreshTimerId(timerId);
      
      // Cleanup function to clear interval when component unmounts or effect re-runs
      return () => {
        if (timerId) {
          clearInterval(timerId);
        }
      };
    }
  }, [autoRefreshEnabled, refreshInterval]);
  
  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    addDebugLog(`Auto-refresh ${!autoRefreshEnabled ? 'enabled' : 'disabled'}`, 'info');
    
    // Show notification
    setNotification({
      type: 'info',
      message: `Auto-refresh ${!autoRefreshEnabled ? 'enabled' : 'disabled'}`
    });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  // Update refresh interval
  const handleRefreshIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value);
    setRefreshInterval(newInterval);
    addDebugLog(`Auto-refresh interval updated to ${newInterval/1000} seconds`, 'info');
    
    // Restart interval with new value if auto-refresh is enabled
    if (autoRefreshEnabled) {
      // This will trigger the useEffect to restart the interval
      setAutoRefreshEnabled(false);
      setTimeout(() => setAutoRefreshEnabled(true), 100);
    }
  };

  // Function to toggle showing all bookings
  const toggleAllMongoDBBookings = () => {
    const newValue = !showAllMongoDBBookings;
    setShowAllMongoDBBookings(newValue);
    
    // If turning on all bookings mode, turn off PIN code filter mode
    if (newValue && viewAllBookings) {
      setViewAllBookings(false);
    }
    
    // Refresh bookings with the new setting
    setTimeout(() => {
      fetchData();
    }, 100);
    
    // Show notification
    setNotification({
      type: 'info',
      message: newValue 
        ? 'Now showing all previous bookings' 
        : 'Now showing filtered bookings by area'
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Add function to toggle auto-refresh options visibility
  const toggleAutoRefreshOptions = () => {
    setShowAutoRefreshOptions(!showAutoRefreshOptions);
    addDebugLog(`Auto-refresh options ${!showAutoRefreshOptions ? 'shown' : 'hidden'}`, 'info');
  };

  // Toggle notification dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    
    // If we're opening the dropdown, make sure we have notifications to show
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  return (
    <div className="dashboard-container" style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: '100vh', 
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      border: 'none',
      backgroundColor: 'var(--primary-color)'
    }}>
      {/* Top navigation bar */}
      <div style={{
        backgroundColor: 'var(--primary-color)',
        color: 'var(--accent-color-2)',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
            <i className="fas fa-camera" style={{ marginRight: '10px' }}></i>
            clickshick.com
          </h2>
          </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Fullscreen toggle button */}
          <div 
            onClick={toggleFullscreen} 
              style={{ 
              marginRight: '20px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`} style={{ fontSize: '1.2rem' }}></i>
          </div>

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
              {photographer && photographer.name ? photographer.name.charAt(0).toUpperCase() : 'P'}
        </div>
            <span style={{ fontWeight: 'bold' }}>
              {photographer ? photographer.name : 'Photographer'}
            </span>
            <i className="fas fa-chevron-down" style={{ marginLeft: '8px', fontSize: '0.8rem' }}></i>
        </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: '250px',
          backgroundColor: '#5C90A3',
          color: '#FFFFFF',
          padding: '20px 0',
          overflowY: 'auto',
          height: 'calc(100vh - 70px)', // Subtract header height
          position: 'relative',
          zIndex: 10
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
            }}>Photographer Dashboard</h3>
            <p style={{ 
              margin: 0, 
              fontSize: '0.9rem', 
              color: '#FFFFFF',
              opacity: 0.9
            }}>Manage your bookings</p>
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
              backgroundColor: activeTab === 'analytics' ? 'rgba(255,255,255,0.15)' : 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              color: '#FFFFFF',
              fontWeight: activeTab === 'analytics' ? 'bold' : 'normal',
              borderLeft: activeTab === 'analytics' ? '4px solid #FFFFFF' : '4px solid transparent',
            }} onClick={() => setActiveTab('analytics')}>
              <i className="fas fa-chart-bar" style={{ marginRight: '10px', width: '20px', textAlign: 'center', color: '#FFFFFF' }}></i>
              Analytics
            </li>
            <li style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'profile' ? 'rgba(255,255,255,0.15)' : 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              color: '#FFFFFF',
              fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
              borderLeft: activeTab === 'profile' ? '4px solid #FFFFFF' : '4px solid transparent',
            }} onClick={() => setActiveTab('profile')}>
              <i className="fas fa-user" style={{ marginRight: '10px', width: '20px', textAlign: 'center', color: '#FFFFFF' }}></i>
              My Profile
            </li>
            <li style={{
              padding: '12px 20px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              color: '#FFFFFF',
              fontWeight: 'normal',
              borderLeft: '4px solid transparent',
            }} onClick={() => setShowPinCodePopup(true)}>
              <i className="fas fa-filter" style={{ marginRight: '10px', width: '20px', textAlign: 'center', color: '#FFFFFF' }}></i>
              Set Area Filter {currentPinCode && `(${currentPinCode})`}
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

        {/* Main content */}
        <div style={{ 
          flex: 1, 
          padding: '20px', 
          backgroundColor: '#f5f7fa', 
          overflowY: 'auto',
          height: 'calc(100vh - 70px)', // Subtract header height
          maxHeight: 'calc(100vh - 70px)', // Keep consistent
          position: 'relative'
        }}>
          {/* Notification Alert */}
          {notification && (
            <div style={{
              backgroundColor: notification.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 
                            notification.type === 'warning' ? 'rgba(255, 193, 7, 0.1)' : 
                            notification.type === 'info' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              color: notification.type === 'success' ? 'var(--success-color)' : 
                    notification.type === 'warning' ? 'var(--warning-color)' : 
                    notification.type === 'info' ? 'var(--info-color)' : 'var(--danger-color)',
              padding: '15px',
              borderRadius: '5px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <i className={`fas fa-${
                  notification.type === 'success' ? 'check-circle' : 
                  notification.type === 'warning' ? 'exclamation-triangle' : 
                  notification.type === 'info' ? 'info-circle' : 'times-circle'
                }`} style={{ marginRight: '10px', fontSize: '1.2rem' }}></i>
                {notification.message}
                              </div>
              <button onClick={() => setNotification(null)} style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                <i className="fas fa-times"></i>
              </button>
        </div>
      )}

          {/* Main content */}
      <div className="container-fluid py-4">
        {/* Pin Code Filter Section */}
            <div style={{
              backgroundColor: 'var(--accent-color-2)',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <i className="fas fa-filter" style={{ marginRight: '8px' }}></i>
                  Booking Filters
                </h3>
                <button onClick={() => setShowPinCodePopup(true)} style={{
                  backgroundColor: currentPinCode ? 'var(--primary-color)' : 'var(--accent-color-1)',
                  color: 'var(--accent-color-2)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 15px',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}>
                  <i className="fas fa-map-marker-alt" style={{ marginRight: '5px' }}></i>
                  {currentPinCode ? 'Change Area' : 'Set Area Filter'}
                </button>
              </div>

              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '15px', 
                alignItems: 'center',
                backgroundColor: currentPinCode ? 'rgba(106, 17, 203, 0.05)' : 'transparent',
                padding: currentPinCode ? '12px' : '0',
                borderRadius: '8px'
              }}>
                {currentPinCode ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <i className="fas fa-map-marker-alt" style={{ color: 'var(--accent-color-1)', marginRight: '8px' }}></i>
                      <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Showing bookings for area:</span>
                      <span style={{
                        backgroundColor: 'var(--accent-color-1)',
                        color: 'white',
                        padding: '5px 12px',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}>
                        {currentPinCode}
                    </span>
                </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                      <button
                        onClick={handlePinCodeClear}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--danger-color)',
                          border: '1px solid var(--danger-color)',
                          borderRadius: '4px',
                          padding: '5px 10px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          marginRight: '10px'
                        }}
                      >
                        <i className="fas fa-times" style={{ marginRight: '5px' }}></i>
                        Clear Filter
                      </button>
                      
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                              <input
                                type="checkbox"
                          id="viewAllBookings"
                          checked={viewAllBookings}
                          onChange={() => toggleViewAllBookings()}
                          style={{ marginRight: '8px' }}
                        />
                        <label htmlFor="viewAllBookings" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem' }}>
                          Temporarily view all bookings
                              </label>
                            </div>
                              </div>
                  </>
                ) : (
                  <div style={{ 
                    width: '100%', 
                    padding: '15px', 
                    backgroundColor: 'rgba(106, 17, 203, 0.05)',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: '0 0 10px 0' }}>
                      <i className="fas fa-info-circle" style={{ marginRight: '8px', color: 'var(--accent-color-1)' }}></i>
                      No area filter set. Showing bookings from all areas.
                    </p>
                              <button 
                      onClick={() => setShowPinCodePopup(true)}
                      style={{
                        backgroundColor: 'var(--accent-color-1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 15px',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="fas fa-filter" style={{ marginRight: '5px' }}></i>
                      Set Area Filter
                              </button>
                        </div>
                      )}
          </div>
        </div>

        {/* Debug Panel */}
        <div className="row mx-2 mb-3">
          <div className="col-12">
            <div className="d-flex justify-content-end mb-2">
              <button 
                className="btn btn-sm btn-outline-dark"
                onClick={toggleDebugPanel}
                title="Show/hide area information"
              >
                <i className="fas fa-map-marker-alt me-1"></i>
                {showDebugInfo ? 'Hide Area Info' : 'Show Area Info'}
              </button>
            </div>
            
            {showDebugInfo && (
              <div className="card shadow-sm mb-3 border-primary">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Area Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <strong>Current PIN Code:</strong> {currentPinCode || 'None (showing all areas)'}
                    </div>
                    <div className="col-md-4">
                      <strong>Bookings Count:</strong> {bookings.length}
                    </div>
                    <div className="col-md-4">
                      <strong>Filter Active:</strong> {currentPinCode && !viewAllBookings ? 'Yes' : 'No'}
                    </div>
                  </div>
                  
                  {viewAllBookings && currentPinCode && (
                    <div className="alert alert-info py-2 mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>View All Bookings mode is active.</strong> Your PIN code filter ({currentPinCode}) is temporarily bypassed.
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <strong>Area Actions:</strong>
                    <div className="btn-group mt-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={handleForceRefresh}>
                        <i className="fas fa-sync-alt me-1"></i> Manual Refresh
                      </button>
                      
                      <button 
                        className={`btn btn-sm ${autoRefreshEnabled ? 'btn-success' : 'btn-outline-secondary'}`} 
                        onClick={toggleAutoRefresh}
                      >
                        <i className={`fas ${autoRefreshEnabled ? 'fa-stop-circle' : 'fa-play-circle'} me-1`}></i>
                        {autoRefreshEnabled ? 'Stop Auto-Refresh' : 'Start Auto-Refresh'}
                      </button>
                      
                      <select 
                        className="form-select form-select-sm" 
                        style={{ maxWidth: '200px' }}
                        value={refreshInterval}
                        onChange={handleRefreshIntervalChange}
                      >
                        <option value="30000">Auto-refresh: 30 seconds</option>
                        <option value="60000">Auto-refresh: 1 minute</option>
                        <option value="300000">Auto-refresh: 5 minutes</option>
                        <option value="600000">Auto-refresh: 10 minutes</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <button 
                      className={`btn btn-sm ${viewAllBookings ? 'btn-info' : 'btn-outline-info'}`}
                      onClick={toggleViewAllBookings}
                    >
                      <i className={`fas ${viewAllBookings ? 'fa-filter' : 'fa-list-ul'} me-1`}></i>
                      {viewAllBookings ? 'Return to Filter' : 'View All Bookings'}
                    </button>
                    
                    <button className="btn btn-sm btn-outline-danger" onClick={handlePinCodeClear}>
                      <i className="fas fa-times me-1"></i> Clear Area Filter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="row mx-2 mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card shadow-sm text-white" style={{ 
              backgroundColor: '#5C90A3',
              borderRadius: '10px',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div className="card-body text-center">
                <h5 className="card-title" style={{ fontSize: '0.85rem', marginBottom: '6px' }}>Total Bookings</h5>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{bookings.length}</h2>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card shadow-sm text-white" style={{ 
              backgroundColor: '#5C90A3',
              borderRadius: '10px',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div className="card-body text-center">
                <h5 className="card-title" style={{ fontSize: '0.85rem', marginBottom: '6px' }}>Confirmed</h5>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{bookings.filter(b => b.decision?.toLowerCase() === 'confirmed').length}</h2>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card shadow-sm text-white" style={{ 
              backgroundColor: '#5C90A3',
              borderRadius: '10px',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div className="card-body text-center">
                <h5 className="card-title" style={{ fontSize: '0.85rem', marginBottom: '6px' }}>Likely</h5>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{bookings.filter(b => b.decision?.toLowerCase() === 'likely').length}</h2>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card shadow-sm text-white" style={{ 
              backgroundColor: '#5C90A3',
              borderRadius: '10px',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div className="card-body text-center">
                <h5 className="card-title" style={{ fontSize: '0.85rem', marginBottom: '6px' }}>Pending</h5>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{bookings.filter(b => b.decision?.toLowerCase() === 'pending').length}</h2>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for different views */}
        <div className="row mx-2 mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs nav-fill">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookings')}
                  style={{ 
                    fontWeight: 'bold',
                    color: activeTab === 'bookings' ? 'var(--primary-color)' : '#6c757d',
                    borderBottom: activeTab === 'bookings' ? '3px solid var(--primary-color)' : 'none',
                    backgroundColor: activeTab === 'bookings' ? 'var(--accent-color-1)' : 'white'
                  }}
                >
                  <i className="fas fa-list-alt me-2"></i>
                  All Bookings
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                  style={{ 
                    fontWeight: 'bold',
                    color: activeTab === 'analytics' ? 'var(--primary-color)' : '#6c757d',
                    borderBottom: activeTab === 'analytics' ? '3px solid var(--primary-color)' : 'none',
                    backgroundColor: activeTab === 'analytics' ? 'var(--accent-color-1)' : 'white'
                  }}
                >
                  <i className="fas fa-chart-pie me-2"></i>
                  Analytics
                </button>
              </li>
        </ul>
          </div>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'bookings' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.5rem' }}>My Bookings</h2>
                  <div>
                    <button
                      onClick={handleForceRefresh}
                      style={{
                        backgroundColor: 'var(--accent-color-1)',
                        color: 'var(--primary-color)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 15px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        marginRight: '10px'
                      }}
                    >
                      <i className="fas fa-sync-alt" style={{ marginRight: '5px' }}></i>
                      Refresh
                    </button>
                    <button
                      onClick={toggleAllMongoDBBookings}
                      style={{
                        backgroundColor: showAllMongoDBBookings ? 'var(--primary-color)' : 'transparent',
                        color: showAllMongoDBBookings ? 'var(--accent-color-2)' : 'var(--primary-color)',
                        border: showAllMongoDBBookings ? 'none' : '1px solid var(--primary-color)',
                        borderRadius: '4px',
                        padding: '8px 15px',
                        fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                    >
                      <i className={`fas ${showAllMongoDBBookings ? 'fa-filter' : 'fa-list-alt'}`} style={{ marginRight: '5px' }}></i>
                      {showAllMongoDBBookings ? 'Show Area Bookings' : 'View All Bookings'}
                    </button>
                      </div>
                      </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ 
                      display: 'inline-block', 
                      width: '40px', 
                      height: '40px', 
                      border: '4px solid rgba(0, 0, 0, 0.1)', 
                      borderLeftColor: 'var(--primary-color)', 
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ marginTop: '15px', color: 'var(--text-light)' }}>Loading bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                  <div style={{
                    backgroundColor: 'var(--accent-color-2)',
                    borderRadius: '8px',
                    padding: '30px',
                    textAlign: 'center',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                  }}>
                    <i className="fas fa-calendar-times" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '15px', opacity: 0.6 }}></i>
                    <h3 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>No Bookings Found</h3>
                    <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
                      {currentPinCode && !viewAllBookings 
                        ? `No bookings found in area with PIN code ${currentPinCode}.` 
                        : 'You don\'t have any bookings yet.'}
                    </p>
                              <button 
                      onClick={viewAllBookings ? () => setViewAllBookings(false) : () => setViewAllBookings(true)}
                                style={{ 
                        backgroundColor: 'var(--primary-color)',
                        color: 'var(--accent-color-2)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 20px',
                                  fontSize: '0.9rem', 
                        cursor: 'pointer'
                      }}
                    >
                      {viewAllBookings ? 'Show Area Bookings' : 'View All Bookings'}
                              </button>
                            </div>
                ) : (
                  <div>
                    <div className="grid-container" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '20px',
                      marginBottom: '50px',
                      minHeight: '60vh' // Ensure minimum height for scrolling
                    }}>
                      {bookings.map((booking, index) => (
                        <div key={booking._id || booking.id || index} style={{
                          backgroundColor: 'var(--accent-color-2)',
                          borderRadius: '8px',
                          padding: '20px',
                          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                          borderLeft: `4px solid ${
                            booking.status === 'Confirmed' ? 'var(--success-color)' :
                            booking.status === 'Pending' ? 'var(--warning-color)' :
                            booking.status === 'Cancelled' ? 'var(--danger-color)' : 'var(--info-color)'
                          }`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <div>
                              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                                {booking.photographyType || 'Photography Session'}
                              </h3>
                              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>
                                {booking.userName || booking.userEmail || 'Client'}
                              </p>
                          </div>
                            <span style={{
                              backgroundColor: booking.status === 'Confirmed' ? 'rgba(76, 175, 80, 0.1)' :
                                             booking.status === 'Pending' ? 'rgba(255, 193, 7, 0.1)' :
                                             booking.status === 'Cancelled' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                              color: booking.status === 'Confirmed' ? 'var(--success-color)' :
                                    booking.status === 'Pending' ? 'var(--warning-color)' :
                                    booking.status === 'Cancelled' ? 'var(--danger-color)' : 'var(--info-color)',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}>
                              {booking.status || 'Unknown'}
                            </span>
                          </div>
                          
                          <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                              <i className="fas fa-calendar" style={{ width: '20px', color: 'var(--primary-color)', marginRight: '10px' }}></i>
                              <span>{booking.date ? new Date(booking.date).toLocaleDateString() : 'No date specified'}</span>
                      </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                              <i className="fas fa-map-marker-alt" style={{ width: '20px', color: 'var(--primary-color)', marginRight: '10px' }}></i>
                              <span>{booking.location || 'No location specified'}</span>
                    </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <i className="fas fa-money-bill-wave" style={{ width: '20px', color: 'var(--primary-color)', marginRight: '10px' }}></i>
                              <span>{booking.budgetRange || booking.price || 'Budget not specified'}</span>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            {booking.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleAcceptBooking(booking._id || booking.id, booking.userId)}
                                  style={{
                                    backgroundColor: 'var(--success-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '8px 15px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <i className="fas fa-check" style={{ marginRight: '5px' }}></i>
                                  Accept
                            </button>
                            <button 
                              onClick={() => handleRejectBooking(booking._id || booking.id, booking.userId)}
                                  style={{
                                    backgroundColor: 'var(--danger-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '8px 15px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <i className="fas fa-times" style={{ marginRight: '5px' }}></i>
                                  Decline
                            </button>
                          </>
                        )}
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowDetailsModal(true);
                              }}
                              style={{
                                backgroundColor: 'var(--primary-color)',
                                color: 'var(--accent-color-2)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '8px 15px',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                              }}
                            >
                              <i className="fas fa-info-circle" style={{ marginRight: '5px' }}></i>
                              Details
                          </button>
                      </div>
                    </div>
                      ))}
                  </div>
                {/* Add padding at bottom to ensure content isn't hidden by footer */}
                <div style={{ height: '50px' }}></div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'analytics' && (
              <div>
                <h2 style={{ margin: '0 0 20px 0', color: 'var(--primary-color)', fontSize: '1.5rem' }}>Booking Analytics</h2>
                <div style={{
                  backgroundColor: 'var(--accent-color-2)',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                }}>
                  <BookingAnalytics bookings={bookings} />
                </div>
              </div>
            )}
            </div>
          </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3" style={{ 
        width: '100%',
        position: 'relative',
        zIndex: 100
      }}>
        <p className="m-0">© 2024 Photographer Dashboard. All rights reserved.</p>
      </footer>

      {/* Pin Code Popup */}
      <PinCodePopup 
        isOpen={showPinCodePopup}
        onClose={() => setShowPinCodePopup(false)}
        onSubmit={handlePinCodeSubmit}
      />

      {/* Booking Details Modal */}
      {showDetailsModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Booking Details</h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {renderBookingDetails(selectedBooking)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotographerDashboard;
