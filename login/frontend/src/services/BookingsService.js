import { testBookings } from '../tests/pincode-test-data';

/**
 * BookingsService - Handles all interactions with bookings data
 * Provides consistent pin code filtering and API interaction
 */
class BookingsService {
  constructor() {
    this.baseUrl = 'http://localhost:8080/api';
    this.mockMode = process.env.REACT_APP_USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development';
  }

  /**
   * Fetch bookings with optional pin code filter
   * @param {string} photographerId - Photographer ID to fetch bookings for
   * @param {string} pinCode - Optional pin code to filter bookings
   * @param {boolean} fetchAllBookings - Whether to fetch all bookings regardless of photographer
   * @returns {Promise<Array>} - Array of bookings with complete details
   */
  async fetchBookings(photographerId, pinCode = null, fetchAllBookings = false) {
    const logs = [];
    logs.push(`Fetching bookings for photographer: ${photographerId}`);
    logs.push(`With pin code filter: ${pinCode || 'None'}`);
    logs.push(`Fetch all bookings mode: ${fetchAllBookings ? 'Yes' : 'No'}`);
    
    const token = localStorage.getItem('token');
    logs.push(`Auth token exists: ${!!token}`);
    console.log(`Auth token available: ${!!token}`);
    
    // If no token is available, return mock data immediately - no point trying API
    if (!token) {
      logs.push('No auth token available, skipping API call and using mock data');
      console.warn('No auth token available, skipping API call');
      return this.getMockBookings(photographerId, pinCode, fetchAllBookings, logs);
    }
    
    // Build the URL based on whether we want all bookings or filtered bookings
    let url;
    if (fetchAllBookings) {
      // Endpoint to get all bookings with complete details
      url = `${this.baseUrl}/bookings/all?includeDetails=true`;
      logs.push(`Fetching ALL bookings with complete details using URL: ${url}`);
      console.log(`Fetching ALL bookings with complete details using URL: ${url}`);
    } else if (photographerId && pinCode) {
      // Endpoint with both photographer ID and PIN code filter
      url = `${this.baseUrl}/bookings?photographerId=${photographerId}&pinCode=${pinCode}&includeDetails=true`;
      logs.push(`Fetching filtered bookings by photographer and PIN code: ${url}`);
      console.log(`Fetching filtered bookings by photographer and PIN code: ${url}`);
    } else if (photographerId) {
      // Endpoint with just photographer ID filter
      url = `${this.baseUrl}/bookings?photographerId=${photographerId}&includeDetails=true`;
      logs.push(`Fetching bookings by photographer: ${url}`);
      console.log(`Fetching bookings by photographer: ${url}`);
    } else {
      // Default endpoint for all bookings
      url = `${this.baseUrl}/bookings?includeDetails=true`;
      logs.push(`Fetching all bookings with default URL: ${url}`);
      console.log(`Fetching all bookings with default URL: ${url}`);
    }
    
    // Create a retryFetch function
    const retryFetch = async (retryCount = 0, maxRetries = 2) => {
      try {
        logs.push(`Fetching booking data from API (attempt ${retryCount + 1})...`);
        console.log(`Fetching booking data from API (attempt ${retryCount + 1})...`);
        
        // Fetch with a timeout for API response
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        logs.push(`API Response Status: ${response.status} ${response.statusText}`);
        console.log(`API Response Status: ${response.status} ${response.statusText}`);
        
        // Handle HTTP error status codes
        if (!response.ok) {
          const errorStatus = response.status;
          logs.push(`API error: ${errorStatus} ${response.statusText}`);
          console.error(`API error: ${errorStatus} ${response.statusText}`);
          
          let errorDetails = '';
          try {
            // Try to get error message from response
            const errorText = await response.text();
            if (errorText) {
              try {
                // Try to parse as JSON
                const errorJson = JSON.parse(errorText);
                errorDetails = errorJson.message || errorJson.error || errorText;
              } catch {
                // Use as plain text if not JSON
                errorDetails = errorText;
              }
              logs.push(`Error details: ${errorDetails}`);
            }
          } catch (e) {
            // Ignore if we can't read the error body
          }
          
          // For 500 errors or 401/403 (auth issues), try again if we haven't reached max retries
          if ((errorStatus === 500 || errorStatus === 401 || errorStatus === 403) && retryCount < maxRetries) {
            logs.push(`Retrying after ${errorStatus} error (attempt ${retryCount + 1} of ${maxRetries})`);
            console.warn(`Retrying after ${errorStatus} error (attempt ${retryCount + 1} of ${maxRetries})`);
            
            // Wait a bit before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
            return retryFetch(retryCount + 1, maxRetries);
          }
          
          // If we've reached max retries or it's not a retriable error, fallback to mock data
          logs.push(`Fallback to mock data after ${errorStatus} error`);
          throw new Error(`API responded with ${errorStatus}${errorDetails ? `: ${errorDetails}` : ''}`);
        }
        
        // Parse response JSON
        try {
          const data = await response.json();
          
          // Check if the response is valid (should be an array)
          if (Array.isArray(data)) {
            logs.push(`API returned ${data.length} bookings`);
            console.log(`Successfully fetched ${data.length} bookings from API`);
            return data;
          } else {
            logs.push('API returned non-array data');
            console.warn('API returned invalid data format:', data);
            throw new Error('API returned invalid data format (not an array)');
          }
        } catch (jsonError) {
          logs.push(`Error parsing JSON response: ${jsonError.message}`);
          console.error('JSON parse error:', jsonError);
          throw new Error(`Error parsing API response: ${jsonError.message}`);
        }
      } catch (error) {
        // If we've reached max retries or it's a non-retriable error (not network related)
        if (retryCount >= maxRetries || 
            !(error.name === 'AbortError' || error.message.includes('network') || error.message.includes('NetworkError'))) {
          throw error;
        }
        
        // For network errors, retry
        logs.push(`Network error, retrying (attempt ${retryCount + 1} of ${maxRetries}): ${error.message}`);
        console.warn(`Network error, retrying: ${error.message}`);
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return retryFetch(retryCount + 1, maxRetries);
      }
    };
    
    try {
      // Attempt to fetch data with retries
      const data = await retryFetch();
      
      // Process the bookings data
      const processedBookings = data.map(booking => {
        // Make sure we have complete user details
        const enhancedBooking = {
          ...booking,
          // Ensure these fields exist
          userName: booking.userName || booking.user?.name || 'Unknown User',
          userContactEmail: booking.userContactEmail || booking.user?.email || booking.email || '',
          userContactPhone: booking.userContactPhone || booking.user?.phone || booking.contactNumber || '',
          // Ensure these booking fields exist
          photographyType: booking.photographyType || booking.sessionType || 'General Photography',
          date: booking.date || booking.sessionDate || booking.bookingDate || 'Not specified',
          location: booking.location || booking.sessionLocation || 'Not specified',
          pinCode: booking.pinCode || booking.pin || booking.zipCode || '',
          budgetRange: booking.budgetRange || booking.budget || 'Not specified',
          // Ensure status fields exist
          status: booking.status || booking.sessionStatus || 'Pending',
          decision: booking.decision || booking.sessionDecision || booking.status || 'Pending'
        };
        
        return enhancedBooking;
      });
      
      // Client-side PIN code filtering if needed
      let filteredBookings = processedBookings;
      if (pinCode && !fetchAllBookings) {
        logs.push(`Filtering ${processedBookings.length} bookings by PIN code: ${pinCode}`);
        filteredBookings = processedBookings.filter(booking => 
          booking.pinCode && booking.pinCode.toString() === pinCode.toString()
        );
        logs.push(`Found ${filteredBookings.length} bookings with PIN code ${pinCode}`);
        console.log(`Filtered to ${filteredBookings.length} bookings with PIN code ${pinCode}`);
      }
      
      // Mark bookings that match the pin code for UI highlighting
      const enhancedBookings = processedBookings.map(booking => ({
        ...booking,
        matchesPinCode: !pinCode || (booking.pinCode && booking.pinCode.toString() === pinCode.toString())
      }));
      
      // Log sample booking data
      if (enhancedBookings.length > 0) {
        console.log('Sample booking data:');
        console.log(enhancedBookings[0]);
      }
      
      return { 
        bookings: enhancedBookings, 
        filteredBookings, 
        logs, 
        source: 'api' 
      };
      
    } catch (error) {
      logs.push(`API fetch error: ${error.message}`);
      logs.push('Falling back to mock bookings due to API error');
      console.error('Error fetching bookings:', error);
      
      // Fall back to mock data
      return this.getMockBookings(photographerId, pinCode, fetchAllBookings, logs);
    }
  }
  
  /**
   * Get mock booking data when API fails
   * @private
   * @param {string} photographerId - Photographer ID
   * @param {string} pinCode - Optional pin code
   * @param {boolean} fetchAllBookings - Whether to fetch all bookings
   * @param {Array} existingLogs - Existing logs to append to
   * @returns {Object} - Mock booking data
   */
  getMockBookings(photographerId, pinCode = null, fetchAllBookings = false, existingLogs = []) {
    const logs = [...existingLogs];
    logs.push('Using mock booking data as fallback');
    console.log('Using mock booking data as fallback');
    
    // Use test bookings from our mock data file
    let mockBookings = [...testBookings];
    
    // Get user name from localStorage if available (this would be from the signup/login process)
    const loggedInUserName = localStorage.getItem('userName');
    
    if (loggedInUserName) {
      logs.push(`Found logged in user name: ${loggedInUserName}`);
      // Update the mock bookings to use the actual signed-in user's name
      mockBookings = mockBookings.map((booking, index) => ({
        ...booking,
        // Only replace the first booking's userName with the logged-in user's name
        userName: index === 0 ? loggedInUserName : booking.userName,
        createdAt: booking.createdAt || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        date: booking.date || new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      }));
    } else {
      logs.push('No logged in user name found in localStorage');
      // Add some random booking dates without changing userNames
      mockBookings = mockBookings.map(booking => ({
        ...booking,
        createdAt: booking.createdAt || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        date: booking.date || new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      }));
    }
    
    // If not fetchAllBookings, filter by photographerId
    if (!fetchAllBookings && photographerId) {
      mockBookings = mockBookings.filter(booking => 
        !booking.photographerId || booking.photographerId === photographerId
      );
      logs.push(`Filtered mock bookings by photographer: ${mockBookings.length} bookings remaining`);
    }
    
    // Filter by pin code if specified
    let filteredBookings = mockBookings;
    if (pinCode && !fetchAllBookings) {
      filteredBookings = mockBookings.filter(booking => 
        booking.pinCode && booking.pinCode.toString() === pinCode.toString()
      );
      logs.push(`Filtered ${mockBookings.length} mock bookings by PIN code: ${pinCode}`);
      logs.push(`Found ${filteredBookings.length} mock bookings with PIN code ${pinCode}`);
    }
    
    logs.push(`Returning ${mockBookings.length} mock bookings`);
    return { 
      bookings: mockBookings, 
      filteredBookings: filteredBookings,
      logs, 
      source: 'mock-data'
    };
  }

  /**
   * Test the API connection for pin code filtering
   * @param {string} pinCode - Pin code to test with
   * @returns {Promise<Object>} - Test results with status and message
   */
  async testConnection(pinCode) {
    try {
      // Try a direct test endpoint first
      const testUrl = `${this.baseUrl}/bookings/test?pinCode=${pinCode}`;
      
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        return {
          success: true,
          message: 'API connection successful',
          details: await response.json()
        };
      }
      
      // If test endpoint fails, try regular bookings endpoint
      const fallbackUrl = `${this.baseUrl}/bookings?pinCode=${pinCode}`;
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        signal: AbortSignal.timeout(3000)
      });
      
      if (fallbackResponse.ok) {
        return {
          success: true,
          message: 'API connection successful (using fallback endpoint)',
          details: await fallbackResponse.json()
        };
      }
      
      return {
        success: false,
        message: `API responded with error: ${fallbackResponse.status}`,
        details: null
      };
    } catch (error) {
      return {
        success: false,
        message: `API connection failed: ${error.message}`,
        details: null
      };
    }
  }
}

// Create a singleton instance
const bookingsService = new BookingsService();

export default bookingsService; 