// Sample data for testing the User Dashboard
export const sampleUserBookings = [
  {
    id: 1,
    photographyType: 'Wedding',
    date: '2025-03-01',
    location: 'Jagpalpur',
    status: 'Confirmed',
    photographer: 'Raj Mehta',
    photographerRating: 4.8,
    price: '₹65,000',
    package: 'Premium'
  },
  {
    id: 2,
    photographyType: 'Pre-wedding',
    date: '2024-12-20',
    location: 'Goa',
    status: 'Pending',
    photographer: 'Priya Singh',
    photographerRating: 4.9,
    price: '₹35,000',
    package: 'Standard'
  },
  {
    id: 3,
    photographyType: 'Family Portrait',
    date: '2024-09-10',
    location: 'Delhi',
    status: 'Completed',
    photographer: 'Vikram Patel',
    photographerRating: 4.7,
    price: '₹18,000',
    package: 'Basic'
  }
];

export const photographerSuggestions = [
  {
    id: 101,
    name: 'Kabir Sharma',
    specialization: 'Wedding',
    experience: '8 years',
    rating: 4.9,
    priceRange: '₹50,000 - ₹80,000',
    location: 'Mumbai',
    portfolio: 'https://example.com/kabir',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 102,
    name: 'Ananya Desai',
    specialization: 'Fashion',
    experience: '6 years',
    rating: 4.7,
    priceRange: '₹35,000 - ₹60,000',
    location: 'Delhi',
    portfolio: 'https://example.com/ananya',
    imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 103,
    name: 'Rohan Gupta',
    specialization: 'Wildlife',
    experience: '10 years',
    rating: 4.8,
    priceRange: '₹40,000 - ₹75,000',
    location: 'Bangalore',
    portfolio: 'https://example.com/rohan',
    imageUrl: 'https://randomuser.me/api/portraits/men/67.jpg'
  },
  {
    id: 104,
    name: 'Meera Rajput',
    specialization: 'Portrait',
    experience: '5 years',
    rating: 4.6,
    priceRange: '₹20,000 - ₹40,000',
    location: 'Chennai',
    portfolio: 'https://example.com/meera',
    imageUrl: 'https://randomuser.me/api/portraits/women/17.jpg'
  }
];

export default { sampleUserBookings, photographerSuggestions }; 