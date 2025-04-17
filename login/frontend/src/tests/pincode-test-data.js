// Test data for pin code filtering
const testBookings = [
  {
    id: 'test1',
    photographyType: 'Wedding',
    date: '2024-06-20',
    location: 'New Delhi (Connaught Place)',
    pinCode: '110001',
    decision: 'Pending',
    contactNumber: '9876543210',
    budgetRange: '₹30,000-₹50,000',
    userName: 'Rahul Sharma',
    userId: 'testuser1'
  },
  {
    id: 'test2',
    photographyType: 'Portrait',
    date: '2024-06-25',
    location: 'Mumbai (Fort)',
    pinCode: '400001',
    decision: 'Pending',
    contactNumber: '8765432109',
    budgetRange: '₹15,000-₹25,000',
    userName: 'Priya Patel',
    userId: 'testuser2'
  },
  {
    id: 'test3',
    photographyType: 'Family',
    date: '2024-07-15',
    location: 'Bangalore (MG Road)',
    pinCode: '560001',
    decision: 'Pending',
    contactNumber: '7654321098',
    budgetRange: '₹20,000-₹35,000',
    userName: 'Amit Kumar',
    userId: 'testuser3'
  },
  {
    id: 'test4',
    photographyType: 'Pre-wedding',
    date: '2024-07-20',
    location: 'Chennai (George Town)',
    pinCode: '600001',
    decision: 'Pending',
    contactNumber: '6543210987',
    budgetRange: '₹25,000-₹40,000',
    userName: 'Sneha Reddy',
    userId: 'testuser4'
  },
  {
    id: 'test5',
    photographyType: 'Event',
    date: '2024-08-10',
    location: 'Kolkata (BBD Bagh)',
    pinCode: '700001', 
    decision: 'Pending',
    contactNumber: '5432109876',
    budgetRange: '₹20,000-₹35,000',
    userName: 'Vikram Chatterjee',
    userId: 'testuser5'
  },
  // Add new test bookings with some of our new pin codes
  {
    id: 'test6',
    photographyType: 'Wedding',
    date: '2024-08-15',
    location: 'New Delhi (Hauz Khas)',
    pinCode: '110020',
    decision: 'Pending',
    contactNumber: '9876543211',
    budgetRange: '₹35,000-₹55,000',
    userName: 'Neha Gupta',
    userId: 'testuser6'
  },
  {
    id: 'test7',
    photographyType: 'Portrait',
    date: '2024-08-20',
    location: 'Mumbai (Bandra West)',
    pinCode: '400050',
    decision: 'Pending',
    contactNumber: '8765432110',
    budgetRange: '₹25,000-₹35,000',
    userName: 'Rohan Mehta',
    userId: 'testuser7'
  },
  {
    id: 'test8',
    photographyType: 'Corporate',
    date: '2024-09-10',
    location: 'Bangalore (Whitefield)',
    pinCode: '560066',
    decision: 'Pending',
    contactNumber: '7654321099',
    budgetRange: '₹40,000-₹60,000',
    userName: 'Deepika Shetty',
    userId: 'testuser8'
  },
  {
    id: 'test9',
    photographyType: 'Maternity',
    date: '2024-09-15',
    location: 'Hyderabad (Hitech City)',
    pinCode: '500081',
    decision: 'Pending',
    contactNumber: '6543210988',
    budgetRange: '₹20,000-₹30,000',
    userName: 'Arjun Nair',
    userId: 'testuser9'
  },
  {
    id: 'test10',
    photographyType: 'Fashion',
    date: '2024-09-20',
    location: 'Gurgaon (DLF Phase 3)',
    pinCode: '122003',
    decision: 'Pending',
    contactNumber: '5432109877',
    budgetRange: '₹30,000-₹45,000',
    userName: 'Simran Kapoor',
    userId: 'testuser10'
  }
];

// Function to test pin code filtering
function filterBookingsByPinCode(bookings, pinCode) {
  console.log('-------------------------------------');
  console.log(`PIN CODE FILTER TEST: ${pinCode || 'No pin code provided'}`);
  
  if (!pinCode) {
    console.log('No pin code provided, returning all bookings');
    return bookings;
  }
  
  console.log(`Filtering ${bookings.length} bookings by pin code "${pinCode}"`);
  console.log('Bookings before filtering:');
  bookings.forEach((booking, index) => {
    console.log(`${index + 1}. ID: ${booking.id}, PIN: ${booking.pinCode}, Location: ${booking.location}`);
  });
  
  const filteredBookings = bookings.filter(booking => {
    // Handle both string and number comparison
    const bookingPinCode = booking.pinCode?.toString();
    const filterPinCode = pinCode?.toString();
    
    const isMatch = bookingPinCode === filterPinCode;
    console.log(`Comparing booking PIN ${bookingPinCode} with filter ${filterPinCode}: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
    
    return isMatch;
  });
  
  console.log(`Found ${filteredBookings.length} bookings with pin code ${pinCode}`);
  
  if (filteredBookings.length > 0) {
    console.log('Matched bookings:');
    filteredBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.photographyType} booking in ${booking.location} (PIN: ${booking.pinCode})`);
    });
  } else {
    console.log('⚠️ No matching bookings found for this pin code');
  }
  
  console.log('-------------------------------------');
  return filteredBookings;
}

// Test the filtering function
function runPinCodeTests() {
  const pinCodes = ['110001', '400001', '560001', '600001', '700001', '110020', '400050', '560066', '500081', '122003', '999999'];
  
  console.log('==========================================');
  console.log('RUNNING PIN CODE FILTERING TESTS');
  console.log('==========================================');
  
  pinCodes.forEach(pinCode => {
    const result = filterBookingsByPinCode(testBookings, pinCode);
    console.log(`Test result for ${pinCode}: ${result.length} bookings found`);
  });
  
  // Test edge cases
  console.log('\nTesting edge cases:');
  
  // Test with null pin code
  const nullResult = filterBookingsByPinCode(testBookings, null);
  console.log(`Test with null pin code: ${nullResult.length} bookings returned (should return all)`);
  
  // Test with empty pin code
  const emptyResult = filterBookingsByPinCode(testBookings, '');
  console.log(`Test with empty pin code: ${emptyResult.length} bookings returned (should return all)`);
  
  // Test with number type pin code
  const numberResult = filterBookingsByPinCode(testBookings, 110001);
  console.log(`Test with number type pin code: ${numberResult.length} bookings found`);
  
  console.log('Pin code tests completed.');
  console.log('==========================================');
}

// Run tests automatically when imported in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode detected - running pin code tests automatically');
  setTimeout(() => {
    runPinCodeTests();
  }, 1000); // Delay by 1 second to let other initialization complete
}

export { testBookings, filterBookingsByPinCode, runPinCodeTests }; 